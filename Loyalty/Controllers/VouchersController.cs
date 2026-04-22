using Loyalty.Data;
using Loyalty.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Loyalty.Controllers;

[ApiController]
[Route("api/[controller]")]
public class VouchersController : ControllerBase
{
    private readonly AppDbContext _context;

    public VouchersController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllCoupons()
    {
        var coupons = await _context.Coupons.ToListAsync();
        return Ok(coupons);
    }

    [HttpPost]
    public async Task<IActionResult> CreateCoupon([FromBody] Coupon coupon)
    {
        if (await _context.Coupons.AnyAsync(c => c.Code == coupon.Code))
            return BadRequest("Mã ưu đãi đã tồn tại");
            
        _context.Coupons.Add(coupon);
        await _context.SaveChangesAsync();
        return Ok(coupon);
    }

    [HttpPost("issue")]
    public async Task<IActionResult> IssueCoupon([FromBody] IssueVoucherRequest req)
    {
        var coupon = await _context.Coupons.FindAsync(req.CouponCode);
        if (coupon == null) return NotFound("Mã ưu đãi không tồn tại");

        var customerCoupons = new List<CustomerCoupon>();
        
        if (req.TargetAll)
        {
            var customers = await _context.Customers.ToListAsync();
            foreach (var c in customers)
            {
                if (!await _context.CustomerCoupons.AnyAsync(cc => cc.CustomerId == c.Id && cc.CouponCode == req.CouponCode))
                {
                    customerCoupons.Add(new CustomerCoupon { CustomerId = c.Id, CouponCode = req.CouponCode });
                }
            }
        }
        else if (req.CustomerIds != null)
        {
            foreach (var cid in req.CustomerIds)
            {
                 if (!await _context.CustomerCoupons.AnyAsync(cc => cc.CustomerId == cid && cc.CouponCode == req.CouponCode))
                 {
                    customerCoupons.Add(new CustomerCoupon { CustomerId = cid, CouponCode = req.CouponCode });
                 }
            }
        }

        _context.CustomerCoupons.AddRange(customerCoupons);
        await _context.SaveChangesAsync();
        return Ok(new { Message = $"Đã phát hành {customerCoupons.Count} thẻ ưu đãi" });
    }

    [HttpGet("my-vouchers/{userId}")]
    public async Task<IActionResult> GetMyVouchers(Guid userId)
    {
        var user = await _context.AppUsers.FindAsync(userId);
        if (user == null) return Ok(new List<object>());

        var customer = await _context.Customers.FirstOrDefaultAsync(c => c.UserId == userId || (c.PhoneNumber != null && c.PhoneNumber == user.PhoneNumber));
        if (customer == null) return Ok(new List<object>());

        var vouchers = await _context.CustomerCoupons
            .Where(cc => cc.CustomerId == customer.Id && !cc.IsUsed)
            .Include(cc => cc.Coupon)
            .Select(cc => new {
                cc.Id,
                cc.CouponCode,
                cc.Coupon.Title,
                cc.Coupon.Description,
                cc.Coupon.DiscountValue,
                cc.Coupon.IsPercentage,
                cc.Coupon.ExpiryDate,
                cc.ReceivedAt
            })
            .ToListAsync();
        return Ok(vouchers);
    }
}

public class IssueVoucherRequest
{
    public string CouponCode { get; set; }
    public bool TargetAll { get; set; }
    public List<Guid>? CustomerIds { get; set; }
}
