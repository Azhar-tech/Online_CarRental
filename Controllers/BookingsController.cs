using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CarRentalAPI.Data;
using CarRentalAPI.Models;
using CarRentalAPI.Hubs;
using Microsoft.AspNetCore.SignalR;


namespace CarRentalAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BookingsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IHubContext<BookingHub> _hubContext;

        // SINGLE MERGED CONSTRUCTOR: Fixes the 'read-only' and 'duplicate' errors
        public BookingsController(AppDbContext context, IHubContext<BookingHub> hubContext)
        {
            _context = context;
            _hubContext = hubContext;
        }

        // GET: api/bookings
        [HttpGet]
public async Task<ActionResult<IEnumerable<object>>> GetAllBookings()
{
    // Using .Include to join the Cars table with Bookings
    var bookings = await _context.Bookings
        .Include(b => b.Car) 
        .OrderByDescending(b => b.Id)
        .Select(b => new {
            b.Id,
            b.StartDate,
            b.EndDate,
            b.Status,
            b.TotalAmount,
            b.WithDriver,
            // These are the new fields for your frontend
            CarName = b.Car.Type, 
            CarYear = b.Car.Model,
            CarImage = b.Car.ImageUrl
        })
        .ToListAsync();

    return Ok(bookings);
}

// Ensure the route is exactly "my-history/{userId}"
[HttpGet("my-history/{userId}")]
public async Task<ActionResult<IEnumerable<object>>> GetMyHistory(int userId)
{
    // Check if the database has any bookings for this user
    var history = await _context.Bookings
        .Include(b => b.Car)
        .Where(b => b.UserId == userId)
        .OrderByDescending(b => b.Id)
        .Select(b => new {
            b.Id,
            b.StartDate,
            b.EndDate,
            b.Status,
            b.TotalAmount,
            CarName = b.Car.Type,
            CarYear = b.Car.Model,
            CarImage = b.Car.ImageUrl
        })
        .ToListAsync();

    // Even if history is empty, return an empty list [], not a 404
    return Ok(history);
}

[HttpGet("status/{status}")]
public async Task<ActionResult<IEnumerable<object>>> GetBookingsByStatus(string status)
{
    var query = _context.Bookings.AsQueryable();

    if (status != "All")
    {
        query = query.Where(b => b.Status == status);
    }

    return await query
        .OrderByDescending(b => b.Id)
        .Select(b => new {
            b.Id,
            b.CustomerName,
            b.StartDate,
            b.EndDate,
            b.TotalAmount,
            b.Status,
            b.PaymentSlipPath
        })
        .ToListAsync();
}

        [HttpPost("upload-slip")]
        public async Task<IActionResult> BookCar([FromForm] Booking booking, IFormFile slip)
        {
            if (slip == null) return BadRequest("Payment slip is required.");

            // 1. Save the file to wwwroot/uploads
            var fileName = Guid.NewGuid().ToString() + Path.GetExtension(slip.FileName);
            var folderPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");

            if (!Directory.Exists(folderPath)) Directory.CreateDirectory(folderPath);

            var filePath = Path.Combine(folderPath, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await slip.CopyToAsync(stream);
            }

            // 2. Map the data
            booking.PaymentSlipPath = fileName;
            booking.Status = "Pending";

            // Extract the calculated price from the React FormData
            if (Request.Form.ContainsKey("totalAmount"))
            {
                if (decimal.TryParse(Request.Form["totalAmount"], out decimal price))
                {
                    booking.TotalAmount = price;
                }
            }

            // 3. Save to SQL Server
            _context.Bookings.Add(booking);
            await _context.SaveChangesAsync();

            // 4. REAL-TIME SIGNALR NOTIFICATION
            // This triggers the "ReceiveNewBooking" event in your AdminDashboard.jsx
            await _hubContext.Clients.All.SendAsync("ReceiveNewBooking");

            return Ok(new { message = "Booking submitted successfully!" });
        }

        [HttpPut("approve/{id}")]
        public async Task<IActionResult> Approve(int id)
        {
            var booking = await _context.Bookings.FindAsync(id);
            if (booking == null) return NotFound();

            booking.Status = "Confirmed";
            await _context.SaveChangesAsync();

            return Ok(new { message = "Booking approved!" });
        }



[HttpPatch("reject/{id}")] // Using Patch as we are only updating one field
public async Task<IActionResult> RejectBooking(int id)
{
    var booking = await _context.Bookings.FindAsync(id);
    if (booking == null) return NotFound();

    // Update status instead of deleting the record
    booking.Status = "Rejected";

    await _context.SaveChangesAsync();
    return Ok(new { message = "Booking status updated to Rejected" });
}


        [HttpGet("check-availability")]
        public async Task<IActionResult> CheckAvailability(int carId, DateTime start, DateTime end)
        {
            // Checks SQL Server for any overlapping 'Confirmed' bookings
            var isBooked = await _context.Bookings.AnyAsync(b => 
                b.CarId == carId && 
                b.Status == "Confirmed" &&
                ((start >= b.StartDate && start <= b.EndDate) || 
                 (end >= b.StartDate && end <= b.EndDate) ||
                 (b.StartDate >= start && b.StartDate <= end))
            );

            return Ok(new { available = !isBooked });
        }
    }
}