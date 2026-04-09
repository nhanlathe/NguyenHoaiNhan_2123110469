using Loyalty.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace Loyalty.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CustomersController : ControllerBase
{
    private readonly ICustomerRepository _repository;

    public CustomersController(ICustomerRepository repository)
    {
        _repository = repository;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllCustomers()
    {
        var customers = await _repository.GetAllCustomersAsync();
        return Ok(customers);
    }

    [HttpPost("seed-test-customer")]
    public async Task<IActionResult> SeedTestCustomer([FromQuery] string phone = "0961234567")
    {
        var result = await _repository.SeedTestCustomerAsync(phone);
        if (!result) return Ok("Khách hàng đã tồn tại");
        return Ok($"Khách hàng {phone} đã được seed thành công với bản ghi Gold Tier!");
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
