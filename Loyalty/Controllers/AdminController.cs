using Loyalty.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Loyalty.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AdminController : ControllerBase
{
    private readonly AppDbContext _context;

    public AdminController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("reports/dead-stock")]
    public async Task<IActionResult> GetDeadStock()
    {
        // Giả sử tồn kho quá 12 tháng không bán hoặc nhập từ 1 năm trước
        var deadDate = DateTime.UtcNow.AddMonths(-12);
        
        var deadStocks = await _context.Inventories
            .Include(i => i.Product)
            .Where(i => i.BatchDate <= deadDate && i.Quantity > 0)
            .Select(i => new {
                i.Product.Sku,
                i.Product.Name,
                i.Quantity,
                i.BatchDate,
                DaysInStock = (DateTime.UtcNow - i.BatchDate).Value.Days
            })
            .ToListAsync();

        return Ok(new { TotalDeadStock = deadStocks.Count, Items = deadStocks });
    }

    [HttpGet("reports/loyalty-efficiency")]
    public async Task<IActionResult> GetLoyaltyEfficiency()
    {
        var transactions = await _context.LoyaltyTransactions.ToListAsync();
        
        var totalPointsEarned = transactions.Where(t => t.PointsEarned > 0).Sum(t => t.PointsEarned);
        var totalStampsRedeemed = transactions.Where(t => t.StampsEarned < 0).Sum(t => Math.Abs(t.StampsEarned));
        var totalTiers = await _context.LoyaltyProfiles
            .GroupBy(p => p.Tier)
            .Select(g => new { Tier = g.Key, Count = g.Count() })
            .ToListAsync();

        return Ok(new
        {
            Summary = "Báo cáo hiệu quả Loyalty System",
            TotalPointsDistributed = totalPointsEarned,
            TotalStampsRedeemed = totalStampsRedeemed,
            MembersByTier = totalTiers
        });
    }
}
