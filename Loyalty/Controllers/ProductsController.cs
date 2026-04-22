using Loyalty.DTOs;
using Loyalty.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace Loyalty.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly IProductRepository _repository;

    public ProductsController(IProductRepository repository)
    {
        _repository = repository;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllProducts()
    {
        var products = await _repository.GetAllProductsAsync();
        return Ok(products);
    }

    [HttpPost]
    public async Task<IActionResult> CreateProduct([FromBody] CreateProductRequest req)
    {
        try 
        {
            var product = await _repository.CreateProductAsync(req);
            return Ok(new { ProductId = product.Id, Message = "Created successfully" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Title = "Lỗi hệ thống", Detail = ex.InnerException?.Message ?? ex.Message });
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateProduct(Guid id, [FromBody] CreateProductRequest req)
    {
        try 
        {
            var product = await _repository.UpdateProductAsync(id, req);
            if (product == null) return NotFound(new { Error = "Không tìm thấy sản phẩm" });
            return Ok(new { Message = "Sản phẩm đã được cập nhật (PUT)" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Title = "Lỗi cập nhật", Detail = ex.InnerException?.Message ?? ex.Message });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteProduct(Guid id)
    {
        try 
        {
            var success = await _repository.DeleteProductAsync(id);
            if (!success) return NotFound(new { Error = "Không tìm thấy sản phẩm" });
            return Ok(new { Message = "Sản phẩm đã bị xóa (DELETE)" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Title = "Lỗi xóa sản phẩm", Detail = ex.InnerException?.Message ?? ex.Message });
        }
    }
}
