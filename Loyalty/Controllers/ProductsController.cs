using Loyalty.Data;
using Loyalty.Models;
using Loyalty.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Loyalty.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly AppDbContext _context;

    public ProductsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllProducts()
    {
        var products = await _context.Products
            .Include(p => p.Metadata)
            .Include(p => p.Inventory)
            .Select(p => new {
                p.Id,
                p.Sku,
                p.Name,
                p.Category,
                p.BasePrice,
                IsVirtual = p.IsVirtual,
                InventoryQuantity = p.Inventory != null ? p.Inventory.Quantity : 0,
                Metadata = p.Metadata != null ? p.Metadata.AttributesJson : null
            })
            .ToListAsync();
            
        return Ok(products);
    }

    [HttpPost]
    public async Task<IActionResult> CreateProduct([FromBody] CreateProductRequest req)
    {
        var product = new Product
        {
            Sku = req.Sku,
            Name = req.Name,
            UoM = req.UoM,
            BasePrice = req.BasePrice,
            Category = req.Category,
            IsVirtual = req.IsVirtual,
            Inventory = new Inventory { Quantity = 0, BatchDate = DateTime.UtcNow }
        };

        if (!string.IsNullOrEmpty(req.MetadataJson))
        {
            product.Metadata = new ProductMetadata { AttributesJson = req.MetadataJson };
        }

        _context.Products.Add(product);
        await _context.SaveChangesAsync();
        return Ok(new { ProductId = product.Id, Message = "Created successfully" });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateProduct(Guid id, [FromBody] CreateProductRequest req)
    {
        var product = await _context.Products.Include(p => p.Metadata).FirstOrDefaultAsync(p => p.Id == id);
        if (product == null) return NotFound(new { Error = "Không tìm thấy sản phẩm" });

        product.Sku = req.Sku;
        product.Name = req.Name;
        product.UoM = req.UoM;
        product.BasePrice = req.BasePrice;
        product.Category = req.Category;
        product.IsVirtual = req.IsVirtual;

        if (!string.IsNullOrEmpty(req.MetadataJson))
        {
            if (product.Metadata == null) product.Metadata = new ProductMetadata { AttributesJson = req.MetadataJson };
            else product.Metadata.AttributesJson = req.MetadataJson;
        }

        await _context.SaveChangesAsync();
        return Ok(new { Message = "Sản phẩm đã được cập nhật (PUT)" });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteProduct(Guid id)
    {
        var product = await _context.Products.FindAsync(id);
        if (product == null) return NotFound(new { Error = "Không tìm thấy sản phẩm" });

        _context.Products.Remove(product);
        await _context.SaveChangesAsync();
        return Ok(new { Message = "Sản phẩm đã bị xóa (DELETE)" });
    }

    [HttpGet("expiring")]
    public async Task<IActionResult> GetExpiringProducts()
    {
        var warningDate = DateTime.UtcNow.AddMonths(6);
        var res = await _context.Inventories
            .Include(i => i.Product)
            .Where(i => i.ExpiryDate <= warningDate && i.Quantity > 0)
            .Select(i => new { i.Product.Sku, i.Product.Name, i.ExpiryDate, i.Quantity })
            .ToListAsync();
            
        return Ok(res);
    }
}
