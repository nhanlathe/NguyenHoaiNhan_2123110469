using Loyalty.Data;
using Loyalty.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Loyalty.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SupportController : ControllerBase
{
    private readonly AppDbContext _context;

    public SupportController(AppDbContext context)
    {
        _context = context;
    }

    [HttpPost]
    public async Task<IActionResult> CreateRequest([FromBody] SupportRequestDto req)
    {
        try
        {
            var thread = new SupportRequest
            {
                CustomerId = req.CustomerId,
                Subject = req.Subject,
                Status = "Open",
                IsReadByAdmin = false,
                IsReadByCustomer = true,
                CreatedAt = DateTime.UtcNow,
                LastUpdatedAt = DateTime.UtcNow
            };
            
            _context.SupportRequests.Add(thread);
            await _context.SaveChangesAsync();
            
            var initialMessage = new SupportMessage
            {
                SupportRequestId = thread.Id,
                SenderType = "Customer",
                Content = req.Message,
                CreatedAt = DateTime.UtcNow
            };
            
            _context.SupportMessages.Add(initialMessage);
            await _context.SaveChangesAsync();
            
            return Ok(new { Message = "Gửi yêu cầu hỗ trợ thành công!", ThreadId = thread.Id });
        }
        catch (Exception ex)
        {
            return BadRequest(new { Error = ex.Message });
        }
    }

    [HttpGet]
    public async Task<IActionResult> GetAllThreads()
    {
        var threads = await _context.SupportRequests
            .Include(t => t.Customer)
            .Include(t => t.Messages)
            .OrderByDescending(t => t.LastUpdatedAt)
            .Select(t => new
            {
                t.Id,
                t.CustomerId,
                CustomerName = t.Customer != null ? t.Customer.PhoneNumber : "Unknown",
                t.Subject,
                t.Status,
                t.IsReadByAdmin,
                t.CreatedAt,
                t.LastUpdatedAt,
                MessageCount = t.Messages.Count,
                LastMessage = t.Messages.OrderByDescending(m => m.CreatedAt).Select(m => m.Content).FirstOrDefault()
            })
            .ToListAsync();
            
        return Ok(threads);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetThreadDetail(Guid id)
    {
        var thread = await _context.SupportRequests
            .Include(t => t.Customer)
            .Include(t => t.Messages.OrderBy(m => m.CreatedAt))
            .FirstOrDefaultAsync(t => t.Id == id);
            
        if (thread == null) return NotFound();
        
        return Ok(new {
            thread.Id,
            thread.CustomerId,
            CustomerName = thread.Customer?.PhoneNumber,
            thread.Subject,
            thread.Status,
            thread.IsReadByAdmin,
            thread.IsReadByCustomer,
            thread.CreatedAt,
            Messages = thread.Messages.Select(m => new {
                m.Id,
                m.SenderType,
                m.Content,
                m.CreatedAt
            })
        });
    }

    [HttpGet("customer/{customerId}")]
    public async Task<IActionResult> GetCustomerThreads(Guid customerId)
    {
        var threads = await _context.SupportRequests
            .Where(t => t.CustomerId == customerId)
            .Include(t => t.Messages)
            .OrderByDescending(t => t.LastUpdatedAt)
            .Select(t => new
            {
                t.Id,
                t.Subject,
                t.Status,
                t.IsReadByCustomer,
                t.CreatedAt,
                t.LastUpdatedAt,
                LastMessage = t.Messages.OrderByDescending(m => m.CreatedAt).Select(m => m.Content).FirstOrDefault()
            })
            .ToListAsync();
            
        return Ok(threads);
    }

    [HttpPost("{id}/message")]
    public async Task<IActionResult> AddMessage(Guid id, [FromBody] AddMessageDto req)
    {
        var thread = await _context.SupportRequests.FindAsync(id);
        if (thread == null) return NotFound();
        
        var message = new SupportMessage
        {
            SupportRequestId = id,
            SenderType = req.SenderType, // Customer or Staff
            Content = req.Content,
            CreatedAt = DateTime.UtcNow
        };
        
        thread.LastUpdatedAt = DateTime.UtcNow;
        if (req.SenderType == "Staff")
        {
            thread.IsReadByCustomer = false;
            thread.IsReadByAdmin = true;
        }
        else
        {
            thread.IsReadByAdmin = false;
            thread.IsReadByCustomer = true;
        }
        
        _context.SupportMessages.Add(message);
        await _context.SaveChangesAsync();
        
        return Ok(new { Message = "Gửi tin nhắn thành công!" });
    }

    [HttpPut("{id}/mark-read-admin")]
    public async Task<IActionResult> MarkReadByAdmin(Guid id)
    {
        var thread = await _context.SupportRequests.FindAsync(id);
        if (thread == null) return NotFound();
        thread.IsReadByAdmin = true;
        await _context.SaveChangesAsync();
        return Ok();
    }

    [HttpPut("{id}/mark-read-customer")]
    public async Task<IActionResult> MarkReadByCustomer(Guid id)
    {
        var thread = await _context.SupportRequests.FindAsync(id);
        if (thread == null) return NotFound();
        thread.IsReadByCustomer = true;
        await _context.SaveChangesAsync();
        return Ok();
    }

    [HttpGet("unread-count-admin")]
    public async Task<IActionResult> GetUnreadCountAdmin()
    {
        var count = await _context.SupportRequests.CountAsync(t => !t.IsReadByAdmin);
        return Ok(new { Count = count });
    }

    [HttpGet("customer/{customerId}/unread-count")]
    public async Task<IActionResult> GetUnreadCountCustomer(Guid customerId)
    {
        var count = await _context.SupportRequests.CountAsync(t => t.CustomerId == customerId && !t.IsReadByCustomer);
        return Ok(new { Count = count });
    }
}

public class SupportRequestDto
{
    public Guid CustomerId { get; set; }
    public string Subject { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
}

public class AddMessageDto
{
    public string SenderType { get; set; } = string.Empty; // Customer, Staff
    public string Content { get; set; } = string.Empty;
}
