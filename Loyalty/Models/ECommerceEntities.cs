using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace Loyalty.Models;

public class Order
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();
    public string OrderNumber { get; set; } = $"ORD-{DateTime.UtcNow.Ticks}";
    public Guid? CustomerId { get; set; }
    
    [Column(TypeName = "decimal(18,2)")]
    public decimal TotalAmount { get; set; }
    public string Status { get; set; } = "Pending"; // Pending, Processing, Shipped, Delivered, Cancelled
    public string PaymentMethod { get; set; } = "COD"; // COD, VNPay
    public string PaymentStatus { get; set; } = "Unpaid"; // Unpaid, Paid, Failed
    public string? VnPayTransactionId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public List<OrderItem> Items { get; set; } = new();
}

public class OrderItem
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid OrderId { get; set; }
    public Guid ProductId { get; set; }
    public string? ProductName { get; set; }
    public int Quantity { get; set; }
    
    [Column(TypeName = "decimal(18,2)")]
    public decimal Price { get; set; }

    [ForeignKey("OrderId")]
    public Order Order { get; set; }
}

public class Review
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ProductId { get; set; }
    public Guid CustomerId { get; set; }
    public int Rating { get; set; } // 1-5
    public string Comment { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class Coupon
{
    [Key]
    public string Code { get; set; }
    public string Title { get; set; } = "Ưu đãi đặc biệt";
    public string Description { get; set; } = "Giảm giá cho đơn hàng của bạn";
    [Column(TypeName = "decimal(18,2)")]
    public decimal DiscountValue { get; set; }
    public bool IsPercentage { get; set; }
    public DateTime ExpiryDate { get; set; }
    public int UsageLimit { get; set; }
    public int UsageCount { get; set; } = 0;
}

public class CustomerCoupon
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid CustomerId { get; set; }
    public string CouponCode { get; set; }
    public bool IsUsed { get; set; } = false;
    public DateTime ReceivedAt { get; set; } = DateTime.UtcNow;

    [ForeignKey("CouponCode")]
    public Coupon Coupon { get; set; }
}

public class Wishlist
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid CustomerId { get; set; }
    public Guid ProductId { get; set; }
    public DateTime AddedAt { get; set; } = DateTime.UtcNow;
}

public class SupportRequest
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid CustomerId { get; set; }
    public string Subject { get; set; } = string.Empty;
    public string Status { get; set; } = "Open"; // Open, Resolved, Closed
    public bool IsReadByAdmin { get; set; } = false;
    public bool IsReadByCustomer { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime LastUpdatedAt { get; set; } = DateTime.UtcNow;
    
    [ForeignKey("CustomerId")]
    public Customer? Customer { get; set; }
    
    public List<SupportMessage> Messages { get; set; } = new();
}

public class SupportMessage
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid SupportRequestId { get; set; }
    public string SenderType { get; set; } = string.Empty; // Customer, Staff
    public string Content { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    [ForeignKey("SupportRequestId")]
    [JsonIgnore]
    public SupportRequest? SupportRequest { get; set; }
}
