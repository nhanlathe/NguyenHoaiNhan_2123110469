using Loyalty.Data;
using Loyalty.Models;
using Loyalty.Utils;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Loyalty.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;

    public AuthController(AppDbContext context)
    {
        _context = context;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto request)
    {
        var user = await _context.AppUsers.FirstOrDefaultAsync(u => u.Username == request.Username && u.Password == request.Password);
        if (user == null) return Unauthorized(new { Error = "Sai username hoặc password" });
        
        return Ok(new {
            user.Id,
            user.Username,
            user.FullName,
            user.Role
        });
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto request)
    {
        var existing = await _context.AppUsers.FirstOrDefaultAsync(u => u.Username == request.Username);
        if (existing != null) return BadRequest(new { Error = "Username đã tồn tại" });

        var user = new AppUser
        {
            Username = request.Username,
            Password = request.Password,
            Role = request.Role ?? "Customer",
            FullName = request.FullName,
            PhoneNumber = request.PhoneNumber
        };
        _context.AppUsers.Add(user);

        if (user.Role == "Customer")
        {
            var customer = new Customer
            {
                UserId = user.Id,
                Persona = request.Persona ?? "Student",
                PersonaDetailJson = request.PersonaDetailJson,
                PhoneNumber = request.PhoneNumber,
                Profile = new LoyaltyProfile { Tier = "Member" }
            };
            _context.Customers.Add(customer);
        }

        await _context.SaveChangesAsync();
        
        return Ok(new { Message = "Đăng ký thành công", UserId = user.Id });
    }

    [HttpPut("profile")]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest req)
    {
        var user = await _context.AppUsers.FindAsync(req.UserId);
        if (user == null) return NotFound();

        user.FullName = req.FullName;
        user.PhoneNumber = req.Phone;

        // Sync with Customer table
        var customer = await _context.Customers.FirstOrDefaultAsync(c => c.UserId == req.UserId);
        if (customer != null)
        {
            customer.PhoneEncrypted = EncryptionUtil.Encrypt(req.Phone);
            customer.PhoneNumber = req.Phone;
        }

        await _context.SaveChangesAsync();
        return Ok(new { user.FullName, user.PhoneNumber });
    }
}

public class UpdateProfileRequest
{
    public Guid UserId { get; set; }
    public string FullName { get; set; }
    public string Phone { get; set; }
}

public class LoginDto
{
    public string Username { get; set; }
    public string Password { get; set; }
}

public class RegisterDto
{
    public string Username { get; set; }
    public string Password { get; set; }
    public string? Role { get; set; }
    public string FullName { get; set; }
    public string? PhoneNumber { get; set; }
    public string? Persona { get; set; }
    public string? PersonaDetailJson { get; set; }
}
