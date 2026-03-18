using Microsoft.AspNetCore.Mvc;
using CarRentalAPI.Data;
using CarRentalAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace CarRentalAPI.Controllers // CHANGE THIS to your actual namespace
{
    [Route("api/[controller]")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;
    public AuthController(AppDbContext context) { _context = context; }

    public class LoginRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    [HttpPost("signup")]
    public async Task<IActionResult> Signup([FromBody] User user)
    {
        // Check if email already exists
        if (await _context.Users.AnyAsync(u => u.Email == user.Email))
            return BadRequest("Email is already registered.");

        user.Role = "User"; // Force new signups to be regular users
        _context.Users.Add(user);
        await _context.SaveChangesAsync();
        return Ok(new { message = "Registration successful!" });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest login)
    {
        // Check database for a matching Email and Password
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == login.Email && u.Password == login.Password);

        if (user != null)
        {
            // We return the Role so React knows whether to show the Admin button or not
            return Ok(new { 
                message = "Success", 
                userId = user.Id, 
                fullName = user.FullName,
                role = user.Role 
            });
        }

        return Unauthorized(new { message = "Invalid Email or Password" });
    }
}
}