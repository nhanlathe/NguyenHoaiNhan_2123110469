using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace Loyalty.Models;

public class Product
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();
    [Required, StringLength(100)]
    public string Sku { get; set; }
    [Required, StringLength(255)]
    public string Name { get; set; }
    [Required, StringLength(50)]
    public string UoM { get; set; }
    [Required, Column(TypeName = "decimal(18,2)")]
    public decimal BasePrice { get; set; }
    [Required, StringLength(100)]
    public string Category { get; set; } // Sách, Dụng cụ học tập, Sách luyện đề, v.v.
    public string? ImageUrl { get; set; }
    public bool IsVirtual { get; set; } = false;

    public ProductMetadata Metadata { get; set; }
    public Inventory Inventory { get; set; }
}

public class ProductMetadata
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ProductId { get; set; }
    
    [Column(TypeName = "nvarchar(max)")]
    public string AttributesJson { get; set; } // { "ISBN": "...", "Author": "..." }

    [JsonIgnore]
    public Product Product { get; set; }
}

public class Inventory
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ProductId { get; set; }
    public int Quantity { get; set; } = 0;
    public DateTime? BatchDate { get; set; }
    public DateTime? ExpiryDate { get; set; } // Phục vụ cảnh báo Clearance

    [JsonIgnore]
    public Product Product { get; set; }
}

public class VirtualSkuLink
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ComboId { get; set; }
    public Guid ComponentId { get; set; }
    public int QuantityRequired { get; set; }

    [ForeignKey("ComboId")]
    public Product Combo { get; set; }
    [ForeignKey("ComponentId")]
    public Product Component { get; set; }
}

public class Customer
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();
    
    public byte[] PhoneEncrypted { get; set; }
    public byte[] EmailEncrypted { get; set; }
    
    [StringLength(100)]
    public string Persona { get; set; } // Enterprise, School, Grade

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public LoyaltyProfile Profile { get; set; }
}

public class LoyaltyProfile
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid CustomerId { get; set; }
    [StringLength(50)]
    public string Tier { get; set; } = "Member"; // Member, Silver, Gold, Diamond
    
    [Column(TypeName = "decimal(18,2)")]
    public decimal TotalSpent { get; set; } = 0;
    public decimal PointBalance { get; set; } = 0;
    public int EStamps { get; set; } = 0;

    [JsonIgnore]
    public Customer Customer { get; set; }
}

public class LoyaltyTransaction
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid CustomerId { get; set; }
    public decimal PointsEarned { get; set; }
    public int StampsEarned { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    [StringLength(255)]
    public string Reason { get; set; }

    [ForeignKey("CustomerId")]
    public Customer Customer { get; set; }
}

public class AppUser
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();
    [Required, StringLength(100)]
    public string Username { get; set; }
    [Required, StringLength(255)]
    public string Password { get; set; } // Hashed or plain (for simplicity, plain in test)
    [Required, StringLength(50)]
    public string Role { get; set; } // Admin, Staff, Customer
    public string FullName { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
