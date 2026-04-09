using Loyalty.Models;
using Loyalty.DTOs;

namespace Loyalty.Repositories;

public interface IProductRepository
{
    Task<IEnumerable<object>> GetAllProductsAsync();
    Task<Product> GetProductByIdAsync(Guid id);
    Task<Product> CreateProductAsync(CreateProductRequest req);
    Task<Product> UpdateProductAsync(Guid id, CreateProductRequest req);
    Task<bool> DeleteProductAsync(Guid id);
}
