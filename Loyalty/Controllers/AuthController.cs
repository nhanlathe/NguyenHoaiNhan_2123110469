using Loyalty.Data;
using Loyalty.Models;
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
            FullName = request.FullName
        };
        _context.AppUsers.Add(user);
        await _context.SaveChangesAsync();
        
        return Ok(new { Message = "Đăng ký thành công", UserId = user.Id });
    }
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
    public string Role { get; set; }
    public string FullName { get; set; }
}
