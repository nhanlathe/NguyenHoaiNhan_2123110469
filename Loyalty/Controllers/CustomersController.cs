using Loyalty.Data;
using Loyalty.Models;
using Loyalty.Utils;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Loyalty.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CustomersController : ControllerBase
{
    private readonly AppDbContext _context;

    public CustomersController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllCustomers()
    {
        var customers = await _context.Customers.Include(c => c.Profile).ToListAsync();
        return Ok(customers.Select(c => new {
            c.Id,
            PhoneDecrypted = EncryptionUtil.Decrypt(c.PhoneEncrypted), // Giải mã khi hiển thị Admin
            c.Persona,
            Tier = c.Profile?.Tier,
            PointBalance = c.Profile?.PointBalance,
            c.CreatedAt
        }));
    }

    [HttpPost("seed-test-customer")]
    public async Task<IActionResult> SeedTestCustomer([FromQuery] string phone = "0961234567")
    {
        var existing = _context.Customers.AsEnumerable().FirstOrDefault(c => c.PhoneEncrypted.SequenceEqual(EncryptionUtil.Encrypt(phone)));
        if (existing != null) return Ok("Khách hàng đã tồn tại");

        var customer = new Customer
        {
            PhoneEncrypted = EncryptionUtil.Encrypt(phone),
            EmailEncrypted = EncryptionUtil.Encrypt("test@mail.com"),
            Persona = "School",
            Profile = new LoyaltyProfile { Tier = "Gold", PointBalance = 0, EStamps = 0, TotalSpent = 0 }
        };

        _context.Customers.Add(customer);
        await _context.SaveChangesAsync();
        return Ok($"Khách hàng {phone} đã được seed thành công với bản ghi Gold Tier!");
    }

    [HttpPut("{id}/tier")]
    public async Task<IActionResult> UpdateTier(Guid id, [FromQuery] string newTier)
    {
        var profile = await _context.LoyaltyProfiles.FirstOrDefaultAsync(p => p.CustomerId == id);
        if (profile == null) return NotFound(new { Error = "Không tìm thấy hồ sơ Loyalty" });
        
        profile.Tier = newTier;
        await _context.SaveChangesAsync();
        return Ok(new { Message = $"Đã nâng/hạ hạng (PUT) thành {newTier}" });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCustomer(Guid id)
    {
        var customer = await _context.Customers.FindAsync(id);
        if (customer == null) return NotFound(new { Error = "Không tìm thấy khách hàng" });
        
        _context.Customers.Remove(customer); // Sẽ tự động Cascade xoá Profile dựa theo Entity config
        await _context.SaveChangesAsync();
        return Ok(new { Message = "Đã xoá khách hàng hoàn toàn khỏi cơ sở (DELETE)" });
    }
}
