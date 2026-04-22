namespace Loyalty.DTOs;

public class CheckoutRequest
{
    public string? PhoneRaw { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal RedeemPoints { get; set; }
    public List<OrderItemDto> Items { get; set; } = new();
}

public class OrderItemDto
{
    public Guid ProductId { get; set; }
    public int Quantity { get; set; }
    public decimal Price { get; set; }
    public string? Category { get; set; }
    public bool IsVirtual { get; set; }
}

public class CreateProductRequest
{
    public string Sku { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? UoM { get; set; }
    public decimal BasePrice { get; set; }
    public string Department { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public bool IsVirtual { get; set; }
    public DateTime? BatchDate { get; set; }
    public DateTime? ExpiryDate { get; set; }
    public string? MetadataJson { get; set; }
    public int InventoryQuantity { get; set; }
    public List<ComboComponentDto>? ComboComponents { get; set; }
}

public class ComboComponentDto
{
    public Guid ComponentId { get; set; }
    public int Quantity { get; set; }
}

public class RedeemRequest
{
    public Guid CustomerId { get; set; }
    public int StampsToUse { get; set; }
    public decimal RewardValue { get; set; }
}

public class RedeemPointsRequest
{
    public Guid CustomerId { get; set; }
    public decimal PointsToUse { get; set; }
    public string GiftName { get; set; } = string.Empty;
}

public class CreateOrderRequest
{
    public Guid CustomerId { get; set; }
    public List<OrderItemDto> Items { get; set; } = new();
    public decimal TotalAmount { get; set; }
    public string PaymentMethod { get; set; } = "COD"; // COD or VNPay
    public string? CouponCode { get; set; }
}
