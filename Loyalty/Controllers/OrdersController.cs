using Loyalty.Data;
using Loyalty.DTOs;
using Loyalty.Models;
using Loyalty.Services;
using Loyalty.Utils;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Loyalty.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OrdersController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly OrderService _orderService;
    private readonly LoyaltyService _loyaltyService;
    private readonly IConfiguration _configuration;

    public OrdersController(AppDbContext context, OrderService orderService, LoyaltyService loyaltyService, IConfiguration configuration)
    {
        _context = context;
        _orderService = orderService;
        _loyaltyService = loyaltyService;
        _configuration = configuration;
    }

    [HttpGet]
    public async Task<IActionResult> GetOrders()
    {
        var orders = await _context.Orders
            .Include(o => o.Items)
            .OrderByDescending(o => o.CreatedAt)
            .Take(50) // Giới hạn 50 đơn gần nhất cho POS
            .ToListAsync();
        return Ok(orders);
    }

    [HttpGet("my-orders/{customerId}")]
    public async Task<IActionResult> GetMyOrders(Guid customerId)
    {
        var orders = await _context.Orders
            .Where(o => o.CustomerId == customerId)
            .Include(o => o.Items)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync();
        return Ok(orders);
    }

    [HttpPut("{id}/approve")]
    public async Task<IActionResult> ApproveOrder(Guid id)
    {
        using var dbTransaction = await _context.Database.BeginTransactionAsync();
        try
        {
            var order = await _context.Orders
                .Include(o => o.Items)
                .FirstOrDefaultAsync(o => o.Id == id);
                
            if (order == null) return NotFound("Không tìm thấy đơn hàng");
            if (order.Status == "Processing" || order.Status == "Delivered") 
                return BadRequest("Đơn hàng đã được duyệt trước đó");

            order.Status = "Processing";

            if (order.CustomerId.HasValue)
            {
                var customer = await _context.Customers
                    .Include(c => c.Profile)
                    .FirstOrDefaultAsync(c => c.Id == order.CustomerId.Value);
                    
                if (customer != null && customer.Profile != null)
                {
                    var reqItems = order.Items.Select(i => new OrderItemDto { ProductId = i.ProductId, Quantity = i.Quantity, Price = i.Price }).ToList();
                    var benefits = _orderService.CalculateBenefits(reqItems, customer.Profile);
                    
                    decimal pointsEarned = benefits.PointsEarned;
                    
                    var today = DateTime.UtcNow.Date;
                    var earningCountToday = await _context.LoyaltyTransactions
                        .Where(t => t.CustomerId == customer.Id && t.CreatedAt >= today && t.PointsEarned > 0)
                        .CountAsync();
                        
                    if (earningCountToday >= 2)
                    {
                        pointsEarned = 0; // Exceeded limit
                    }
                    
                    customer.Profile.PointBalance += pointsEarned;
                    customer.Profile.TotalSpent += order.TotalAmount;
                    
                    int newStamps = (int)(order.TotalAmount / 100000);
                    customer.Profile.EStamps += newStamps;

                    _context.LoyaltyTransactions.Add(new LoyaltyTransaction
                    {
                        CustomerId = customer.Id,
                        PointsEarned = pointsEarned,
                        StampsEarned = newStamps,
                        Reason = $"Duyệt mua hàng Online (Đơn {order.OrderNumber})"
                    });
                }
            }

            await _context.SaveChangesAsync();
            await dbTransaction.CommitAsync();
            return Ok(new { Message = "Duyệt đơn hàng thành công" });
        }
        catch (Exception ex)
        {
            await dbTransaction.RollbackAsync();
            return BadRequest(new { Error = ex.Message });
        }
    }

    [HttpPost("/api/Orders/checkout")]
    public async Task<IActionResult> Checkout([FromBody] CheckoutRequest req)
    {
        using var dbTransaction = await _context.Database.BeginTransactionAsync();
        try
        {
            var order = new Order
            {
                TotalAmount = req.TotalAmount,
                PaymentMethod = "POS",
                PaymentStatus = "Paid",
                Status = "Delivered"
            };

            Customer? customer = null;
            if (!string.IsNullOrEmpty(req.PhoneRaw))
            {
                customer = await _context.Customers
                    .Include(c => c.Profile)
                    .FirstOrDefaultAsync(c => c.PhoneNumber == req.PhoneRaw);
                
                if (customer != null)
                {
                    order.CustomerId = customer.Id;
                }
            }

            decimal totalDiscount = 0;
            decimal pointsEarned = 0;

            if (customer != null)
            {
                var benefits = _orderService.CalculateBenefits(req.Items, customer.Profile);
                pointsEarned = benefits.PointsEarned;
                totalDiscount = benefits.TotalDiscount;
                
                var today = DateTime.UtcNow.Date;
                var earningCountToday = await _context.LoyaltyTransactions
                    .Where(t => t.CustomerId == customer.Id && t.CreatedAt >= today && t.PointsEarned > 0)
                    .CountAsync();
                    
                if (earningCountToday >= 2)
                {
                    pointsEarned = 0; // Exceeded limit
                }
                
                decimal pointDiscount = 0;
                if (req.RedeemPoints > 0 && customer.Profile.PointBalance >= req.RedeemPoints)
                {
                    decimal maxDiscountFromPoints = req.TotalAmount * 0.2m;
                    decimal requestedPointDiscount = req.RedeemPoints * 100; // 1 point = 100 VND
                    
                    if (requestedPointDiscount <= maxDiscountFromPoints)
                    {
                        customer.Profile.PointBalance -= req.RedeemPoints;
                        pointDiscount = requestedPointDiscount;
                        
                        _context.LoyaltyTransactions.Add(new LoyaltyTransaction
                        {
                            CustomerId = customer.Id,
                            PointsEarned = -req.RedeemPoints,
                            StampsEarned = 0,
                            Reason = $"Đổi {req.RedeemPoints} điểm lấy {pointDiscount.ToString("N0")} ₫ giảm giá đơn hàng"
                        });
                    }
                }
                
                // Apply discount to total amount
                order.TotalAmount -= (totalDiscount + pointDiscount);
                if (order.TotalAmount < 0) order.TotalAmount = 0;

                // Update loyalty profile
                customer.Profile.PointBalance += pointsEarned;
                customer.Profile.TotalSpent += order.TotalAmount;
                
                // 100k = 1 stamp
                int newStamps = (int)(order.TotalAmount / 100000);
                customer.Profile.EStamps += newStamps;

                _context.LoyaltyTransactions.Add(new LoyaltyTransaction
                {
                    CustomerId = customer.Id,
                    PointsEarned = pointsEarned,
                    StampsEarned = newStamps,
                    Reason = $"Mua hàng tại quầy (Đơn {order.OrderNumber})"
                });
            }

            foreach (var item in req.Items)
            {
                var product = await _context.Products.Include(p => p.Inventory).FirstOrDefaultAsync(p => p.Id == item.ProductId);
                if (product == null) continue;

                if (product.IsVirtual)
                {
                    await _orderService.ProcessVirtualSkuAsync(product.Id, item.Quantity);
                }
                else if (product.Inventory != null)
                {
                    if (product.Inventory.Quantity < item.Quantity)
                        throw new Exception($"Sản phẩm {product.Name} không đủ tồn kho.");
                    
                    product.Inventory.Quantity -= item.Quantity;
                }

                order.Items.Add(new OrderItem
                {
                    ProductId = item.ProductId,
                    Quantity = item.Quantity,
                    Price = item.Price
                });
            }

            _context.Orders.Add(order);
            await _context.SaveChangesAsync();
            await dbTransaction.CommitAsync();

            return Ok(new { 
                OrderId = order.Id, 
                DiscountApplied = totalDiscount, 
                PointsEarned = pointsEarned,
                Message = "Giao dịch thành công" 
            });
        }
        catch (Exception ex)
        {
            await dbTransaction.RollbackAsync();
            return BadRequest(new { Error = ex.Message });
        }
    }

    [HttpPost("create-order")]
    public async Task<IActionResult> CreateOrder([FromBody] CreateOrderRequest req)
    {
        using var dbTransaction = await _context.Database.BeginTransactionAsync();
        try {
            var order = new Order
            {
                CustomerId = req.CustomerId, // Frontend will send UserId, let's fix this below
                TotalAmount = req.TotalAmount,
                PaymentMethod = req.PaymentMethod,
                PaymentStatus = "Unpaid",
                Status = "Pending"
            };

            // Fix ID lookup: req.CustomerId is actually UserId from frontend
            var user = await _context.AppUsers.FindAsync(req.CustomerId);
            Customer? customer = null;
            if (user != null) {
                customer = await _context.Customers.FirstOrDefaultAsync(c => c.UserId == req.CustomerId || (c.PhoneNumber != null && c.PhoneNumber == user.PhoneNumber));
            } else {
                customer = await _context.Customers.FirstOrDefaultAsync(c => c.UserId == req.CustomerId);
            }
            if (customer != null) order.CustomerId = customer.Id;

            foreach (var item in req.Items)
            {
                var product = await _context.Products.Include(p => p.Inventory).FirstOrDefaultAsync(p => p.Id == item.ProductId);
                if (product == null || product.Inventory == null || product.Inventory.Quantity < item.Quantity)
                {
                    return BadRequest(new { Error = $"Sản phẩm {product?.Name} đã hết hàng hoặc không đủ số lượng." });
                }

                // Subtract inventory
                product.Inventory.Quantity -= item.Quantity;

                order.Items.Add(new OrderItem
                {
                    ProductId = item.ProductId,
                    Quantity = item.Quantity,
                    Price = item.Price
                });
            }

            // Xử lý tiêu thụ CouponCode nếu có
            if (!string.IsNullOrEmpty(req.CouponCode) && customer != null)
            {
                var customerCoupon = await _context.CustomerCoupons
                    .Include(cc => cc.Coupon)
                    .FirstOrDefaultAsync(cc => cc.CustomerId == customer.Id && cc.CouponCode == req.CouponCode && !cc.IsUsed);

                if (customerCoupon != null)
                {
                    customerCoupon.IsUsed = true;
                    customerCoupon.Coupon.UsageCount += 1;
                }
            }

            _context.Orders.Add(order);
            await _context.SaveChangesAsync();
            await dbTransaction.CommitAsync();

            if (req.PaymentMethod == "VNPay")
            {
                return Ok(new { OrderId = order.Id, RequiresPayment = true });
            }

            return Ok(new { OrderId = order.Id, RequiresPayment = false });
        }
        catch (Exception ex)
        {
            await dbTransaction.RollbackAsync();
            return BadRequest(new { Error = ex.Message });
        }
    }

    [HttpGet("vnpay-payment/{orderId}")]
    public async Task<IActionResult> VnPayPayment(Guid orderId)
    {
        var order = await _context.Orders.FindAsync(orderId);
        if (order == null) return NotFound();

        string vnp_Returnurl = _configuration["VNPay:ReturnUrl"];
        string vnp_Url = _configuration["VNPay:Url"];
        string vnp_TmnCode = _configuration["VNPay:TmnCode"];
        string vnp_HashSecret = _configuration["VNPay:HashSecret"];

        VnPayLibrary vnpay = new VnPayLibrary();
        vnpay.AddRequestData("vnp_Version", "2.1.0");
        vnpay.AddRequestData("vnp_Command", "pay");
        vnpay.AddRequestData("vnp_TmnCode", vnp_TmnCode);
        vnpay.AddRequestData("vnp_Amount", ((long)(order.TotalAmount * 100)).ToString());
        vnpay.AddRequestData("vnp_CreateDate", DateTime.Now.ToString("yyyyMMddHHmmss"));
        vnpay.AddRequestData("vnp_CurrCode", "VND");
        vnpay.AddRequestData("vnp_IpAddr", VnPayUtil.GetIpAddress(HttpContext));
        vnpay.AddRequestData("vnp_Locale", "vn");
        vnpay.AddRequestData("vnp_OrderInfo", "Thanh toan don hang:" + order.OrderNumber);
        vnpay.AddRequestData("vnp_OrderType", "other");
        vnpay.AddRequestData("vnp_ReturnUrl", vnp_Returnurl);
        vnpay.AddRequestData("vnp_TxnRef", order.Id.ToString());

        string paymentUrl = vnpay.CreateRequestUrl(vnp_Url, vnp_HashSecret);
        return Ok(new { PaymentUrl = paymentUrl });
    }

    [HttpGet("vnpay-return")]
    public async Task<IActionResult> VnPayReturn()
    {
        if (Request.Query.Count > 0)
        {
            string vnp_HashSecret = _configuration["VNPay:HashSecret"];
            var vnpayData = Request.Query;
            VnPayLibrary vnpay = new VnPayLibrary();

            foreach (string s in vnpayData.Keys)
            {
                if (!string.IsNullOrEmpty(s) && s.StartsWith("vnp_"))
                {
                    vnpay.AddResponseData(s, vnpayData[s]);
                }
            }

            Guid orderId = Guid.Parse(vnpay.GetResponseData("vnp_TxnRef"));
            long vnp_ResponseCode = Convert.ToInt64(vnpay.GetResponseData("vnp_ResponseCode"));
            string vnp_TransactionStatus = vnpay.GetResponseData("vnp_TransactionStatus");
            String vnp_SecureHash = Request.Query["vnp_SecureHash"];
            bool checkSignature = vnpay.ValidateSignature(vnp_SecureHash, vnp_HashSecret);

            if (checkSignature)
            {
                var order = await _context.Orders.FindAsync(orderId);
                if (order != null)
                {
                    if (vnp_ResponseCode == 0 && vnp_TransactionStatus == "00")
                    {
                        order.PaymentStatus = "Paid";
                        order.Status = "Processing";
                        order.VnPayTransactionId = vnpay.GetResponseData("vnp_TransactionNo");
                        await _context.SaveChangesAsync();
                        return Redirect(_configuration["VNPay:FrontendSuccessUrl"] + "?orderId=" + orderId);
                    }
                    else
                    {
                        order.PaymentStatus = "Failed";
                        await _context.SaveChangesAsync();
                        return Redirect(_configuration["VNPay:FrontendFailUrl"] + "?orderId=" + orderId);
                    }
                }
            }
        }
        return BadRequest();
    }
}
