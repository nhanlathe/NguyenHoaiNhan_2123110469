namespace Loyalty.DTOs;

public class CheckoutRequest
{
    public string PhoneRaw { get; set; }
    public decimal TotalAmount { get; set; }
    public List<OrderItem> Items { get; set; } = new();
}

public class OrderItem
{
    public Guid ProductId { get; set; }
    public int Quantity { get; set; }
    public decimal Price { get; set; }
    public string Category { get; set; }
    public bool IsVirtual { get; set; }
}

public class CreateProductRequest
{
    public string Sku { get; set; }
    public string Name { get; set; }
    public string UoM { get; set; }
    public decimal BasePrice { get; set; }
    public string Category { get; set; }
    public bool IsVirtual { get; set; }
    public string MetadataJson { get; set; } // {"ISBN":"..."}
}

public class RedeemRequest
{
    public Guid CustomerId { get; set; }
    public int StampsToUse { get; set; }
    public decimal RewardValue { get; set; }
}
