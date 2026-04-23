using Loyalty.Repositories;
using Loyalty.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Loyalty.Models;
using Loyalty.Utils;

namespace Loyalty.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CustomersController : ControllerBase
{
    private readonly ICustomerRepository _repository;
    private readonly AppDbContext _context;

    public CustomersController(ICustomerRepository repository, AppDbContext context)
    {
        _repository = repository;
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllCustomers()
    {
        var customers = await _repository.GetAllCustomersAsync();
        return Ok(customers);
    }

    [HttpGet("my-profile/{userId}")]
    public async Task<IActionResult> GetMyProfile(Guid userId)
    {
        var user = await _context.AppUsers.FindAsync(userId);
        if (user == null) return NotFound();

        var customer = await _context.Customers
            .Include(c => c.Profile)
            .FirstOrDefaultAsync(c => c.UserId == userId || (c.PhoneNumber != null && c.PhoneNumber == user.PhoneNumber));
            
        if (customer == null) 
        {
            customer = new Customer
            {
                UserId = user.Id,
                Persona = "Member",
                PhoneNumber = user.PhoneNumber,
                Profile = new LoyaltyProfile { Tier = "Member" }
            };
            _context.Customers.Add(customer);
            await _context.SaveChangesAsync();
        }

        var profileDto = new {
            customer.Id,
            customer.UserId,
            Phone = customer.PhoneNumber ?? (customer.PhoneEncrypted != null ? EncryptionUtil.Decrypt(customer.PhoneEncrypted) : "N/A"),
            customer.Persona,
            customer.PersonaDetailJson,
            Tier = customer.Profile?.Tier,
            PointBalance = customer.Profile?.PointBalance,
            customer.CreatedAt
        };

        return Ok(profileDto);
    }

    [HttpPut("{id}/tier")]
    public async Task<IActionResult> UpdateTier(Guid id, [FromQuery] string newTier)
    {
        var result = await _repository.UpdateTierAsync(id, newTier);
        if (!result) return NotFound(new { Error = "Không tìm thấy hồ sơ Loyalty" });
        return Ok(new { Message = $"Đã nâng/hạ hạng (PUT) thành {newTier}" });
    }

    [HttpPut("{id}/points")]
    public async Task<IActionResult> UpdatePoints(Guid id, [FromQuery] decimal newPoints)
    {
        var result = await _repository.UpdatePointsAsync(id, newPoints);
        if (!result) return NotFound(new { Error = "Không tìm thấy hồ sơ Loyalty" });
        return Ok(new { Message = $"Đã cập nhật điểm thành {newPoints}" });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCustomer(Guid id)
    {
        var result = await _repository.DeleteCustomerAsync(id);
        if (!result) return NotFound(new { Error = "Không tìm thấy khách hàng" });
        return Ok(new { Message = "Đã xoá khách hàng hoàn toàn khỏi cơ sở (DELETE)" });
    }
}
