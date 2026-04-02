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

    public OrdersController(AppDbContext context, OrderService orderService, LoyaltyService loyaltyService)
    {
        _context = context;
        _orderService = orderService;
        _loyaltyService = loyaltyService;
    }

    [HttpPost("checkout")]
    public async Task<IActionResult> Checkout([FromBody] CheckoutRequest req)
    {
        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            decimal pointsEarned = 0;
            decimal totalDiscount = 0;

            if (!string.IsNullOrEmpty(req.PhoneRaw))
            {
                var encryptedPhone = EncryptionUtil.Encrypt(req.PhoneRaw);
                // Note: SQL comparison on encrypted byte arrays depends on exact match
                var customers = await _context.Customers
                    .Include(c => c.Profile)
                    // For demo, fetch all and match locally to avoid byte array SQL translation issues
                    .ToListAsync();
                
                var customer = customers.FirstOrDefault(c => c.PhoneEncrypted.SequenceEqual(encryptedPhone));

                if (customer != null)
                {
                    await _loyaltyService.ValidateDailyPointCapAsync(customer.Id);
                    
                    var benefits = _orderService.CalculateBenefits(req.Items, customer.Profile);
                    pointsEarned = benefits.PointsEarned;
                    totalDiscount = benefits.TotalDiscount;

                    customer.Profile.PointBalance += pointsEarned;
                    customer.Profile.TotalSpent += req.TotalAmount - totalDiscount;

                    _context.LoyaltyTransactions.Add(new LoyaltyTransaction
                    {
                        CustomerId = customer.Id,
                        PointsEarned = pointsEarned,
                        Reason = "POS Checkout"
                    });
                }
            }

            foreach (var item in req.Items)
            {
                if (item.IsVirtual)
                {
                    await _orderService.ProcessVirtualSkuAsync(item.ProductId, item.Quantity);
                }
                else
                {
                    var inv = await _context.Inventories.FirstOrDefaultAsync(i => i.ProductId == item.ProductId);
                    if (inv == null || inv.Quantity < item.Quantity) throw new Exception("Hết hàng!");
                    inv.Quantity -= item.Quantity;
                }
            }

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            return Ok(new { Message = "Checkout success", DiscountAppied = totalDiscount });
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return BadRequest(new { Error = ex.Message });
        }
    }
}
