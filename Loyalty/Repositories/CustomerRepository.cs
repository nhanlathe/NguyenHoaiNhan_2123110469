using Loyalty.Models;
using Loyalty.Data;
using Microsoft.EntityFrameworkCore;
using Loyalty.Utils;

namespace Loyalty.Repositories;

public interface ICustomerRepository
{
    Task<IEnumerable<object>> GetAllCustomersAsync();
    Task<bool> SeedTestCustomerAsync(string phone);
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
            PhoneDecrypted = EncryptionUtil.Decrypt(c.PhoneEncrypted),
            c.Persona,
            Tier = c.Profile?.Tier,
            PointBalance = c.Profile?.PointBalance,
            c.CreatedAt
        });
    }

    public async Task<bool> SeedTestCustomerAsync(string phone)
    {
        var existing = _context.Customers.AsEnumerable().FirstOrDefault(c => c.PhoneEncrypted.SequenceEqual(EncryptionUtil.Encrypt(phone)));
        if (existing != null) return false;

        var customer = new Customer
        {
            PhoneEncrypted = EncryptionUtil.Encrypt(phone),
            EmailEncrypted = EncryptionUtil.Encrypt("test@mail.com"),
            Persona = "School",
            Profile = new LoyaltyProfile { Tier = "Gold", PointBalance = 0, EStamps = 0, TotalSpent = 0 }
        };

        _context.Customers.Add(customer);
        await _context.SaveChangesAsync();
        return true;
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
