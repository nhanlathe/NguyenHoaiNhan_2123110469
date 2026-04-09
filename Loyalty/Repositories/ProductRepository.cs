using Loyalty.Data;
using Loyalty.Models;
using Loyalty.DTOs;
using Microsoft.EntityFrameworkCore;

namespace Loyalty.Repositories;

public class ProductRepository : IProductRepository
{
    private readonly AppDbContext _context;

    public ProductRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<object>> GetAllProductsAsync()
    {
        return await _context.Products
            .Include(p => p.Metadata)
            .Include(p => p.Inventory)
            .Select(p => new {
                p.Id,
                p.Sku,
                p.Name,
                p.Category,
                BasePrice = p.BasePrice,
                ImageUrl = p.ImageUrl,
                IsVirtual = p.IsVirtual,
                InventoryQuantity = p.Inventory != null ? p.Inventory.Quantity : 0,
                Metadata = p.Metadata != null ? p.Metadata.AttributesJson : null
            })
            .ToListAsync();
    }

    public async Task<Product> GetProductByIdAsync(Guid id)
    {
        return await _context.Products.Include(p => p.Metadata).FirstOrDefaultAsync(p => p.Id == id);
    }

    public async Task<Product> CreateProductAsync(CreateProductRequest req)
    {
        var product = new Product
        {
            Sku = req.Sku,
            Name = req.Name,
            UoM = req.UoM ?? "Cái",
            BasePrice = req.BasePrice,
            Category = req.Category,
            ImageUrl = req.ImageUrl,
            IsVirtual = req.IsVirtual,
            Inventory = new Inventory { Quantity = 0, BatchDate = DateTime.UtcNow }
        };

        if (!string.IsNullOrEmpty(req.MetadataJson))
        {
            product.Metadata = new ProductMetadata { AttributesJson = req.MetadataJson };
        }

        _context.Products.Add(product);
        await _context.SaveChangesAsync();
        return product;
    }

    public async Task<Product> UpdateProductAsync(Guid id, CreateProductRequest req)
    {
        var product = await GetProductByIdAsync(id);
        if (product == null) return null;

        product.Sku = req.Sku;
        product.Name = req.Name;
        product.UoM = req.UoM ?? "Cái";
        product.BasePrice = req.BasePrice;
        product.Category = req.Category;
        product.ImageUrl = req.ImageUrl;
        product.IsVirtual = req.IsVirtual;

        if (!string.IsNullOrEmpty(req.MetadataJson))
        {
            if (product.Metadata == null) product.Metadata = new ProductMetadata { AttributesJson = req.MetadataJson };
            else product.Metadata.AttributesJson = req.MetadataJson;
        }

        await _context.SaveChangesAsync();
        return product;
    }

    public async Task<bool> DeleteProductAsync(Guid id)
    {
        var product = await _context.Products.FindAsync(id);
        if (product == null) return false;

        _context.Products.Remove(product);
        await _context.SaveChangesAsync();
        return true;
    }
}
