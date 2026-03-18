using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CarRentalAPI.Data;
using CarRentalAPI.Models;

[Route("api/[controller]")]
[ApiController]
public class CarsController : ControllerBase
{
    private readonly AppDbContext _context;

    public CarsController(AppDbContext context) => _context = context;
[HttpGet]
public async Task<ActionResult<IEnumerable<object>>> GetCars()
{
    var today = DateTime.Today;

    // Fetch cars and their busy dates in one go for better performance
    var cars = await _context.Cars
        .Select(car => new {
            car.Id,
            car.Model,
            car.Type,
            car.DailyPrice,
            car.MonthlyPrice,
            car.ImageUrl,
            // Include ANY booking that is not Rejected
            BusyDates = _context.Bookings
                .Where(b => b.CarId == car.Id && 
                            b.Status != "Rejected" && 
                            b.EndDate >= today)
                .Select(b => new { b.StartDate, b.EndDate })
                .ToList()
        })
        .ToListAsync();

    // Add the "Currently Booked" flag based on the new logic
    var carList = cars.Select(car => new {
        car.Id,
        car.Model,
        car.Type,
        car.DailyPrice,
        car.MonthlyPrice,
        car.ImageUrl,
        car.BusyDates,
        IsCurrentlyBooked = car.BusyDates.Any(d => today >= d.StartDate && today <= d.EndDate)
    });

    return Ok(carList);
}
    [HttpPost]
    public async Task<ActionResult<Car>> PostCar(Car car)
    {
        _context.Cars.Add(car);
        await _context.SaveChangesAsync();
        return Ok(car);
    }
    [HttpPost("add")]
public async Task<IActionResult> AddCar([FromForm] Car car, IFormFile imageFile)
{
    if (imageFile != null)
    {
        // 1. Create a unique filename
        var fileName = Guid.NewGuid().ToString() + Path.GetExtension(imageFile.FileName);
        var folderPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/uploads");
        
        // Ensure directory exists
        if (!Directory.Exists(folderPath)) Directory.CreateDirectory(folderPath);

        var filePath = Path.Combine(folderPath, fileName);

        // 2. Save file to server
        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await imageFile.CopyToAsync(stream);
        }

        // 3. Save the path in the database
        car.ImageUrl = "/uploads/" + fileName;
    }

    _context.Cars.Add(car);
    await _context.SaveChangesAsync();
    return Ok(car);
}
}