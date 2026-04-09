using Loyalty.Data;
using Loyalty.DTOs;
using Loyalty.Models;
using Microsoft.EntityFrameworkCore;

namespace Loyalty.Services;

public class OrderService
{
    private readonly AppDbContext _context;

    public OrderService(AppDbContext context)
    {
        _context = context;
    }

    public async Task ProcessVirtualSkuAsync(Guid comboId, int qtyToSell)
    {
        var components = await _context.VirtualSkuLinks.Where(v => v.ComboId == comboId).ToListAsync();
        foreach (var comp in components)
        {
            var requiredQty = comp.QuantityRequired * qtyToSell;
            var inventory = await _context.Inventories.FirstOrDefaultAsync(i => i.ProductId == comp.ComponentId);
            
            if (inventory == null || inventory.Quantity < requiredQty)
                throw new Exception($"Không đủ tồn kho thành phần (ID: {comp.ComponentId})");
                
            inventory.Quantity -= requiredQty;
        }
    }

    public (decimal PointsEarned, decimal TotalDiscount) CalculateBenefits(List<OrderItemDto> items, LoyaltyProfile profile)
    {
        int currentMonth = DateTime.Now.Month;
        decimal totalDiscount = 0;
        decimal pointsEarned = 0;

        decimal baseEarnRate = profile.Tier == "Gold" ? 0.03m : (profile.Tier == "Diamond" ? 0.05m : 0.01m);

        foreach (var item in items)
        {
            int multiplier = 1;
            
            // Tháng 8-9: x2 điểm cho Dụng cụ học tập
            if (item.Category == "Dụng cụ học tập" && (currentMonth == 8 || currentMonth == 9))
            {
                multiplier = 2;
            }

            // Tháng 5-6: Sách luyện đề giảm 20%
            if (item.Category == "Sách luyện đề" && (currentMonth == 5 || currentMonth == 6))
            {
                totalDiscount += item.Price * item.Quantity * 0.20m;
            }

            pointsEarned += (item.Price * item.Quantity * baseEarnRate) * multiplier;
        }

        return (pointsEarned, totalDiscount);
    }
}
