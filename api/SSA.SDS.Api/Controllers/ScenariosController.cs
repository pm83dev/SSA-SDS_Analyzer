using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SSA.SDS.Api.Data;
using SSA.SDS.Api.DTOs;
using SSA.SDS.Api.Services;

namespace SSA.SDS.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ScenariosController : ControllerBase
{
    private readonly SdsDbContext _context;
    private readonly IExpirationService _expirationService;
    private readonly ILogger<ScenariosController> _logger;

    public ScenariosController(SdsDbContext context, IExpirationService expirationService, ILogger<ScenariosController> logger)
    {
        _context = context;
        _expirationService = expirationService;
        _logger = logger;
    }

    [HttpGet("expiring")]
    public async Task<IActionResult> GetExpiring([FromQuery] int days = 90)
    {
        await _expirationService.RecalculateCardStatusesAsync();

        var limit = DateTime.Today.AddDays(days);
        var cards = await _context.SafetyCards
            .Include(sc => sc.Clients)
            .Where(sc => sc.DataScadenza != null && sc.DataScadenza >= DateTime.Today.AddDays(-365) && sc.DataScadenza <= limit)
            .OrderBy(sc => sc.DataScadenza)
            .ToListAsync();

        return Ok(cards.Select(sc => new ExpiringCardDto
        {
            Id = sc.Id,
            ClientName = string.Join(", ", sc.Clients.Select(c => c.RagioneSociale).OrderBy(n => n)),
            Tipologia = sc.Tipologia,
            Titolo = sc.Titolo,
            DataScadenza = sc.DataScadenza,
            DaysRemaining = sc.DaysRemaining,
            Stato = sc.Stato
        }));
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        await _expirationService.RecalculateCardStatusesAsync();

        var cards = await _context.SafetyCards
            .Include(sc => sc.Clients)
            .Where(sc => sc.DataScadenza != null)
            .OrderBy(sc => sc.DataScadenza)
            .ToListAsync();

        return Ok(cards.Select(sc => new ExpiringCardDto
        {
            Id = sc.Id,
            ClientName = string.Join(", ", sc.Clients.Select(c => c.RagioneSociale).OrderBy(n => n)),
            Tipologia = sc.Tipologia,
            Titolo = sc.Titolo,
            DataScadenza = sc.DataScadenza,
            DaysRemaining = sc.DaysRemaining,
            Stato = sc.Stato
        }));
    }
}

[ApiController]
[Route("api/notifications")]
[Authorize]
public class NotificationsController : ControllerBase
{
    private readonly SdsDbContext _context;

    public NotificationsController(SdsDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] bool unreadOnly = false)
    {
        var query = _context.Notifications
            .Include(n => n.Client)
            .Include(n => n.SafetyCard)
            .AsQueryable();

        if (unreadOnly)
            query = query.Where(n => !n.IsRead);

        var notifications = await query
            .OrderByDescending(n => n.CreatedAt)
            .Take(200)
            .ToListAsync();

        return Ok(notifications.Select(MapNotification));
    }

    [HttpGet("unread-count")]
    public async Task<IActionResult> GetUnreadCount()
    {
        var count = await _context.Notifications.CountAsync(n => !n.IsRead);
        return Ok(new { count });
    }

    [HttpPut("{id}/read")]
    public async Task<IActionResult> MarkAsRead(int id)
    {
        var notification = await _context.Notifications.FindAsync(id);
        if (notification == null) return NotFound();

        notification.IsRead = true;
        await _context.SaveChangesAsync();
        return Ok(MapNotification(notification));
    }

    [HttpPut("read-all")]
    public async Task<IActionResult> MarkAllAsRead()
    {
        var unread = await _context.Notifications.Where(n => !n.IsRead).ToListAsync();
        foreach (var n in unread)
            n.IsRead = true;
        await _context.SaveChangesAsync();
        return Ok(new { updated = unread.Count });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var notification = await _context.Notifications.FindAsync(id);
        if (notification == null) return NotFound();

        _context.Notifications.Remove(notification);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    private static NotificationDto MapNotification(Entities.Notification n) => new()
    {
        Id = n.Id,
        ClientId = n.ClientId,
        ClientName = n.Client?.RagioneSociale ?? string.Empty,
        CardId = n.CardId,
        CardTitle = n.SafetyCard?.Titolo,
        Type = n.Type,
        Message = n.Message,
        IsRead = n.IsRead,
        SentDate = n.SentDate,
        CreatedAt = n.CreatedAt
    };
}

[ApiController]
[Route("api/dashboard")]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly SdsDbContext _context;
    private readonly IExpirationService _expirationService;

    public DashboardController(SdsDbContext context, IExpirationService expirationService)
    {
        _context = context;
        _expirationService = expirationService;
    }

    [HttpGet("stats")]
    public async Task<IActionResult> GetStats()
    {
        await _expirationService.RecalculateCardStatusesAsync();

        var totalClients = await _context.Clients.CountAsync();
        var totalCards = await _context.SafetyCards.CountAsync();
        var expiringCards = await _context.SafetyCards.CountAsync(sc => sc.Stato == "Expiring");
        var expiredCards = await _context.SafetyCards.CountAsync(sc => sc.Stato == "Expired");
        var validCards = await _context.SafetyCards.CountAsync(sc => sc.Stato == "Valid");
        var unreadNotifications = await _context.Notifications.CountAsync(n => !n.IsRead);

        return Ok(new DashboardStatsDto
        {
            TotalClients = totalClients,
            TotalCards = totalCards,
            ExpiringCards = expiringCards,
            ExpiredCards = expiredCards,
            ValidCards = validCards,
            UnreadNotifications = unreadNotifications
        });
    }
}
