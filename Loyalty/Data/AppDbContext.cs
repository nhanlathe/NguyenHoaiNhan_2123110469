using Loyalty.Models;
using Microsoft.EntityFrameworkCore;

namespace Loyalty.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Product> Products { get; set; }
    public DbSet<ProductMetadata> ProductMetadatas { get; set; }
    public DbSet<Inventory> Inventories { get; set; }
    public DbSet<VirtualSkuLink> VirtualSkuLinks { get; set; }
    public DbSet<Customer> Customers { get; set; }
    public DbSet<LoyaltyProfile> LoyaltyProfiles { get; set; }
    public DbSet<LoyaltyTransaction> LoyaltyTransactions { get; set; }
    public DbSet<AppUser> AppUsers { get; set; }

    // ECommerce extensions
    public DbSet<Order> Orders { get; set; }
    public DbSet<OrderItem> OrderItems { get; set; }
    public DbSet<Review> Reviews { get; set; }
    public DbSet<Coupon> Coupons { get; set; }
    public DbSet<CustomerCoupon> CustomerCoupons { get; set; }
    public DbSet<Wishlist> Wishlists { get; set; }
    public DbSet<SupportRequest> SupportRequests { get; set; }
    public DbSet<SupportMessage> SupportMessages { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Product>()
            .HasOne(p => p.Metadata)
            .WithOne(m => m.Product)
            .HasForeignKey<ProductMetadata>(m => m.ProductId);

        modelBuilder.Entity<Product>()
            .HasOne(p => p.Inventory)
            .WithOne(i => i.Product)
            .HasForeignKey<Inventory>(i => i.ProductId);

        modelBuilder.Entity<Customer>()
            .HasOne(c => c.Profile)
            .WithOne(p => p.Customer)
            .HasForeignKey<LoyaltyProfile>(p => p.CustomerId);
            
        modelBuilder.Entity<VirtualSkuLink>()
            .HasOne(v => v.Combo)
            .WithMany()
            .HasForeignKey(v => v.ComboId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<VirtualSkuLink>()
            .HasOne(v => v.Component)
            .WithMany()
            .HasForeignKey(v => v.ComponentId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
