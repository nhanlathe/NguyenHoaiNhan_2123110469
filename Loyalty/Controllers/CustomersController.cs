using Loyalty.Repositories;
using Loyalty.Data;
using Microsoft.AspNetCore.Mvc;

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

        var customers = await _repository.GetAllCustomersAsync();
        
        // Find by UserId or Phone
        var profile = customers.FirstOrDefault(c => {
            var cUserId = (Guid?)c.GetType().GetProperty("UserId")?.GetValue(c);
            var cPhone = (string)c.GetType().GetProperty("Phone")?.GetValue(c);
            return cUserId == userId || (cPhone != null && cPhone == user.PhoneNumber);
        });
        
        if (profile == null) return NotFound("Chưa có hồ sơ Loyalty");
        return Ok(profile);
    }

    [HttpPut("{id}/tier")]
    public async Task<IActionResult> UpdateTier(Guid id, [FromQuery] string newTier)
    {
        var result = await _repository.UpdateTierAsync(id, newTier);
        if (!result) return NotFound(new { Error = "Không tìm thấy hồ sơ Loyalty" });
        return Ok(new { Message = $"Đã nâng/hạ hạng (PUT) thành {newTier}" });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCustomer(Guid id)
    {
        var result = await _repository.DeleteCustomerAsync(id);
        if (!result) return NotFound(new { Error = "Không tìm thấy khách hàng" });
        return Ok(new { Message = "Đã xoá khách hàng hoàn toàn khỏi cơ sở (DELETE)" });
    }
}
