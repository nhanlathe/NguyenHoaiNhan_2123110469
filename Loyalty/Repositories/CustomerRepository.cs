using Loyalty.Models;
using Loyalty.Data;
using Microsoft.EntityFrameworkCore;
using Loyalty.Utils;

namespace Loyalty.Repositories;

public interface ICustomerRepository
{
    Task<IEnumerable<object>> GetAllCustomersAsync();
    Task<bool> UpdateTierAsync(Guid id, string newTier);
    Task<bool> DeleteCustomerAsync(Guid id);
}

public class CustomerRepository : ICustomerRepository
{
    private readonly AppDbContext _context;

    public CustomerRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<object>> GetAllCustomersAsync()
    {
        var customers = await _context.Customers.Include(c => c.Profile).ToListAsync();
        return customers.Select(c => new {
            c.Id,
            c.UserId,
            Phone = c.PhoneNumber ?? (c.PhoneEncrypted != null ? EncryptionUtil.Decrypt(c.PhoneEncrypted) : "N/A"),
            c.Persona,
            c.PersonaDetailJson,
            Tier = c.Profile?.Tier,
            PointBalance = c.Profile?.PointBalance,
            c.CreatedAt
        });
    }

    public async Task<bool> UpdateTierAsync(Guid id, string newTier)
    {
        var profile = await _context.LoyaltyProfiles.FirstOrDefaultAsync(p => p.CustomerId == id);
        if (profile == null) return false;
        
        profile.Tier = newTier;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteCustomerAsync(Guid id)
    {
        var customer = await _context.Customers.FindAsync(id);
        if (customer == null) return false;
        
        _context.Customers.Remove(customer);
        await _context.SaveChangesAsync();
        return true;
    }
}
