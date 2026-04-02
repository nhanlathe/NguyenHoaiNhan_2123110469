using Loyalty.Data;
using Loyalty.Models;
using Microsoft.EntityFrameworkCore;

namespace Loyalty.Services;

public class LoyaltyService
{
    private readonly AppDbContext _context;

    public LoyaltyService(AppDbContext context)
    {
        _context = context;
    }

    public async Task ValidateDailyPointCapAsync(Guid customerId)
    {
        var today = DateTime.UtcNow.Date;
        var count = await _context.LoyaltyTransactions
            .Where(t => t.CustomerId == customerId && t.CreatedAt.Date == today)
            .CountAsync();

        if (count >= 2)
        {
            throw new Exception("Limit Exceeded: Tối đa tích điểm 2 lần/ngày.");
        }
    }

    public async Task RedeemStampsAsync(Guid customerId, int stamps, decimal rewardValue)
    {
        if (stamps < 10) throw new Exception("Cần tối thiểu 10 tem.");
        if (rewardValue >= 50000 && stamps == 10) throw new Exception("Quà tặng phải dưới 50k với 10 tem.");

        var profile = await _context.LoyaltyProfiles.FirstOrDefaultAsync(p => p.CustomerId == customerId);
        if (profile == null || profile.EStamps < stamps) throw new Exception("Không đủ tem.");

        profile.EStamps -= stamps;
        await _context.SaveChangesAsync();
    }
}
