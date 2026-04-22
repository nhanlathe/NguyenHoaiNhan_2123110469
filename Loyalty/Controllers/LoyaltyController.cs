using Loyalty.Data;
using Loyalty.DTOs;
using Loyalty.Services;
using Loyalty.Utils;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Loyalty.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LoyaltyController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly LoyaltyService _loyaltyService;

    public LoyaltyController(AppDbContext context, LoyaltyService loyaltyService)
    {
        _context = context;
        _loyaltyService = loyaltyService;
    }

    [HttpGet("dashboard")]
    public async Task<IActionResult> GetDashboard([FromQuery] string phoneRaw)
    {
        var customer = await _context.Customers
            .Include(c => c.Profile)
            .FirstOrDefaultAsync(c => c.PhoneNumber == phoneRaw);

        if (customer == null) return NotFound("Không tìm thấy khách hàng");

        var profile = customer.Profile;
        decimal nextTierRequirement = profile.Tier == "Member" ? 5000000 : (profile.Tier == "Silver" ? 10000000 : 20000000);
        decimal progressPercent = (profile.TotalSpent / nextTierRequirement) * 100;

        return Ok(new
        {
            CurrentTier = profile.Tier,
            PointBalance = profile.PointBalance,
            EStamps = profile.EStamps,
            TotalSpent = profile.TotalSpent,
            NextTier = profile.Tier == "Member" ? "Silver" : (profile.Tier == "Silver" ? "Gold" : "Diamond"),
            ProgressPercent = progressPercent > 100 ? 100 : Math.Round(progressPercent, 2)
        });
    }

    [HttpPost("redeem")]
    public async Task<IActionResult> Redeem([FromBody] RedeemRequest req)
    {
        try
        {
            await _loyaltyService.RedeemStampsAsync(req.CustomerId, req.StampsToUse, req.RewardValue);
            
            // Log transaction
            _context.LoyaltyTransactions.Add(new Models.LoyaltyTransaction {
                CustomerId = req.CustomerId,
                StampsEarned = -req.StampsToUse,
                Reason = "Đổi quà tặng"
            });
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Đổi quà thành công!" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { Error = ex.Message });
        }
    }

    [HttpPost("redeem-points")]
    public async Task<IActionResult> RedeemPoints([FromBody] RedeemPointsRequest req)
    {
        using var dbTransaction = await _context.Database.BeginTransactionAsync();
        try
        {
            var customer = await _context.Customers.Include(c => c.Profile).FirstOrDefaultAsync(c => c.Id == req.CustomerId);
            if (customer == null || customer.Profile == null) return NotFound("Không tìm thấy khách hàng");

            if (customer.Profile.PointBalance < req.PointsToUse)
                return BadRequest(new { Error = "Không đủ điểm phúc lợi để đổi món quà này." });

            customer.Profile.PointBalance -= req.PointsToUse;
            
            _context.LoyaltyTransactions.Add(new Models.LoyaltyTransaction {
                CustomerId = req.CustomerId,
                PointsEarned = -req.PointsToUse,
                Reason = $"Đổi quà: {req.GiftName}"
            });

            var giftOrder = new Models.Order {
                CustomerId = req.CustomerId,
                TotalAmount = 0,
                Status = "Pending",
                PaymentMethod = "GiftExchange",
                PaymentStatus = "Paid",
                Items = new List<Models.OrderItem>
                {
                    new Models.OrderItem {
                        ProductId = Guid.Empty,
                        ProductName = $"[QUÀ TẶNG] {req.GiftName}",
                        Quantity = 1,
                        Price = 0
                    }
                }
            };
            _context.Orders.Add(giftOrder);

            if (req.GiftName.Contains("Voucher"))
            {
                var voucherCode = $"GIFT-{DateTime.UtcNow.Ticks.ToString().Substring(8)}";
                decimal discountVal = req.GiftName.Contains("100K") ? 100000 : 50000;
                
                var newCoupon = new Models.Coupon {
                    Code = voucherCode,
                    Title = req.GiftName,
                    Description = "Quà tặng đổi từ điểm phúc lợi",
                    DiscountValue = discountVal,
                    IsPercentage = false,
                    ExpiryDate = DateTime.UtcNow.AddMonths(1),
                    UsageLimit = 1
                };
                _context.Coupons.Add(newCoupon);

                _context.CustomerCoupons.Add(new Models.CustomerCoupon {
                    CustomerId = req.CustomerId,
                    CouponCode = voucherCode,
                    IsUsed = false,
                    ReceivedAt = DateTime.UtcNow
                });
            }

            await _context.SaveChangesAsync();
            await dbTransaction.CommitAsync();

            return Ok(new { Message = $"Đổi {req.GiftName} thành công!" });
        }
        catch (Exception ex)
        {
            await dbTransaction.RollbackAsync();
            return BadRequest(new { Error = ex.Message });
        }
    }
}
