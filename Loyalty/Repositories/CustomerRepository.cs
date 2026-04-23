using Loyalty.Models;
using Loyalty.Data;
using Microsoft.EntityFrameworkCore;
using Loyalty.Utils;

namespace Loyalty.Repositories;

public interface ICustomerRepository
{
    Task<IEnumerable<object>> GetAllCustomersAsync();
    Task<bool> UpdateTierAsync(Guid id, string newTier);
    Task<bool> UpdatePointsAsync(Guid id, decimal newPoints);
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
        var userIds = customers.Where(c => c.UserId.HasValue).Select(c => c.UserId.Value).ToList();
        var users = await _context.AppUsers.Where(u => userIds.Contains(u.Id)).ToDictionaryAsync(u => u.Id, u => u.FullName);

        return customers.Select(c => new {
            c.Id,
            c.UserId,
            FullName = c.UserId.HasValue && users.ContainsKey(c.UserId.Value) ? users[c.UserId.Value] : "Khách vãng lai",
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

    public async Task<bool> UpdatePointsAsync(Guid id, decimal newPoints)
    {
        var profile = await _context.LoyaltyProfiles.FirstOrDefaultAsync(p => p.CustomerId == id);
        if (profile == null) return false;
        
        profile.PointBalance = newPoints;
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
