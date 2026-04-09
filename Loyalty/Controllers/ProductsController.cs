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
        var product = await _repository.CreateProductAsync(req);
        return Ok(new { ProductId = product.Id, Message = "Created successfully" });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateProduct(Guid id, [FromBody] CreateProductRequest req)
    {
        var product = await _repository.UpdateProductAsync(id, req);
        if (product == null) return NotFound(new { Error = "Không tìm thấy sản phẩm" });

        return Ok(new { Message = "Sản phẩm đã được cập nhật (PUT)" });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteProduct(Guid id)
    {
        var success = await _repository.DeleteProductAsync(id);
        if (!success) return NotFound(new { Error = "Không tìm thấy sản phẩm" });

        return Ok(new { Message = "Sản phẩm đã bị xóa (DELETE)" });
    }
}
