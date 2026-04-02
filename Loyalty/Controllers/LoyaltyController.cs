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
        var encryptedPhone = EncryptionUtil.Encrypt(phoneRaw);
        
        var customers = await _context.Customers.Include(c => c.Profile).ToListAsync();
        var customer = customers.FirstOrDefault(c => c.PhoneEncrypted.SequenceEqual(encryptedPhone));

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
}
