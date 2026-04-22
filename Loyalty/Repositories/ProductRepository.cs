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
        var sixMonthsFromNow = DateTime.UtcNow.AddMonths(6);
        var products = await _context.Products
            .Include(p => p.Metadata)
            .Include(p => p.Inventory)
            .ToListAsync();

        var links = await _context.VirtualSkuLinks.ToListAsync();

        return products.Select(p => new {
            p.Id,
            p.Sku,
            p.Name,
            p.Category,
            p.Department,
            p.UoM,
            BasePrice = p.BasePrice,
            ImageUrl = p.ImageUrl,
            IsVirtual = p.IsVirtual,
            InventoryQuantity = p.Inventory != null ? p.Inventory.Quantity : 0,
            ExpiryDate = p.Inventory != null ? p.Inventory.ExpiryDate : null,
            IsClearance = p.Inventory != null && p.Inventory.ExpiryDate != null && p.Inventory.ExpiryDate <= sixMonthsFromNow,
            Metadata = p.Metadata != null ? p.Metadata.AttributesJson : null,
            ComboComponents = links.Where(v => v.ComboId == p.Id).Select(v => new { v.ComponentId, v.QuantityRequired }).ToList()
        });
    }

    public async Task<Product> GetProductByIdAsync(Guid id)
    {
        return await _context.Products.Include(p => p.Metadata).FirstOrDefaultAsync(p => p.Id == id);
    }

    public async Task<Product> CreateProductAsync(CreateProductRequest req)
    {
        var product = new Product
        {
            Id = Guid.NewGuid(),
            Sku = req.Sku,
            Name = req.Name,
            UoM = req.UoM ?? "Cái",
            BasePrice = req.BasePrice,
            Category = req.Category,
            Department = req.Department,
            ImageUrl = req.ImageUrl,
            IsVirtual = req.IsVirtual
        };

        product.Inventory = new Inventory 
        { 
            ProductId = product.Id,
            Quantity = req.InventoryQuantity, 
            BatchDate = req.BatchDate ?? DateTime.UtcNow,
            ExpiryDate = req.ExpiryDate
        };

        if (!string.IsNullOrEmpty(req.MetadataJson))
        {
            product.Metadata = new ProductMetadata 
            { 
                ProductId = product.Id,
                AttributesJson = req.MetadataJson 
            };
        }

        if (req.IsVirtual && req.ComboComponents != null)
        {
            foreach (var comp in req.ComboComponents)
            {
                if (comp.ComponentId != Guid.Empty)
                {
                    _context.VirtualSkuLinks.Add(new VirtualSkuLink
                    {
                        ComboId = product.Id,
                        ComponentId = comp.ComponentId,
                        QuantityRequired = comp.Quantity
                    });
                }
            }
        }

        _context.Products.Add(product);
        await _context.SaveChangesAsync();
        return product;
    }

    public async Task<Product> UpdateProductAsync(Guid id, CreateProductRequest req)
    {
        var product = await _context.Products
            .Include(p => p.Metadata)
            .Include(p => p.Inventory)
            .FirstOrDefaultAsync(p => p.Id == id);
            
        if (product == null) return null;

        Console.WriteLine($"[DEBUG] Updating Product {id}. New Quantity: {req.InventoryQuantity}");

        product.Sku = req.Sku;
        product.Name = req.Name;
        product.UoM = req.UoM ?? "Cái";
        product.BasePrice = req.BasePrice;
        product.Category = req.Category;
        product.Department = req.Department;
        product.ImageUrl = req.ImageUrl;
        product.IsVirtual = req.IsVirtual;

        // Ensure Inventory exists
        if (product.Inventory == null) 
        {
            var dbInv = await _context.Inventories.FirstOrDefaultAsync(i => i.ProductId == id);
            if (dbInv == null)
            {
                product.Inventory = new Inventory { ProductId = id, Quantity = req.InventoryQuantity };
                _context.Inventories.Add(product.Inventory);
            }
            else
            {
                product.Inventory = dbInv;
                product.Inventory.Quantity = req.InventoryQuantity;
            }
        }
        else 
        {
            product.Inventory.Quantity = req.InventoryQuantity;
        }
        product.Inventory.BatchDate = req.BatchDate ?? product.Inventory.BatchDate;
        product.Inventory.ExpiryDate = req.ExpiryDate ?? product.Inventory.ExpiryDate;

        // Ensure Metadata exists
        if (!string.IsNullOrEmpty(req.MetadataJson))
        {
            if (product.Metadata == null) 
            {
                var dbMeta = await _context.ProductMetadatas.FirstOrDefaultAsync(m => m.ProductId == id);
                if (dbMeta == null)
                {
                    product.Metadata = new ProductMetadata { ProductId = id, AttributesJson = req.MetadataJson };
                    _context.ProductMetadatas.Add(product.Metadata);
                }
                else
                {
                    product.Metadata = dbMeta;
                    product.Metadata.AttributesJson = req.MetadataJson;
                }
            }
            else 
            {
                product.Metadata.AttributesJson = req.MetadataJson;
            }
        }

        // Update Combo Components
        var existingLinks = await _context.VirtualSkuLinks.Where(v => v.ComboId == id).ToListAsync();
        _context.VirtualSkuLinks.RemoveRange(existingLinks);

        if (req.IsVirtual && req.ComboComponents != null)
        {
            foreach (var comp in req.ComboComponents)
            {
                if (comp.ComponentId != Guid.Empty)
                {
                    _context.VirtualSkuLinks.Add(new VirtualSkuLink
                    {
                        ComboId = id,
                        ComponentId = comp.ComponentId,
                        QuantityRequired = comp.Quantity
                    });
                }
            }
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
