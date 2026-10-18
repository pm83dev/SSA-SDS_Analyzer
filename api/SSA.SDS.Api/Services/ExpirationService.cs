using Microsoft.EntityFrameworkCore;
using SSA.SDS.Api.Data;
using SSA.SDS.Api.Entities;
using SSA.SDS.Api.Enums;

namespace SSA.SDS.Api.Services;

public interface IExpirationService
{
    Task<int> RecalculateCardStatusesAsync();
    Task<int> GenerateNotificationsAsync();
}

public class ExpirationService : IExpirationService
{
    private readonly SdsDbContext _context;
    private readonly ILogger<ExpirationService> _logger;

    public ExpirationService(SdsDbContext context, ILogger<ExpirationService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<int> RecalculateCardStatusesAsync()
    {
        var cards = await _context.SafetyCards
            .Where(c => c.DataScadenza != null)
            .ToListAsync();

        var today = DateTime.Today;
        var changed = 0;

        foreach (var card in cards)
        {
            var days = (int)(card.DataScadenza!.Value.Date - today).Days;
            var status = days < 0 ? CardStatus.Expired
                : days <= 90 ? CardStatus.Expiring
                : CardStatus.Valid;

            if (card.Stato != status.ToString() || card.DaysRemaining != days)
            {
                card.Stato = status.ToString();
                card.DaysRemaining = days;
                card.UpdatedAt = DateTime.UtcNow;
                changed++;
            }
        }

        if (changed > 0)
            await _context.SaveChangesAsync();

        _logger.LogInformation("Stato ricalcolato per {Changed} schede", changed);
        return changed;
    }

    public async Task<int> GenerateNotificationsAsync()
    {
        var today = DateTime.Today;
        var cards = await _context.SafetyCards
            .Include(c => c.Client)
            .Where(c => c.DataScadenza != null && c.DataScadenza >= today.AddDays(-1))
            .ToListAsync();

        var notificationsCreated = 0;

        foreach (var card in cards)
        {
            var days = (int)(card.DataScadenza!.Value.Date - today).Days;
            if (days > 90) continue;

            string type;
            string message;
            if (days < 0)
            {
                type = NotificationType.Expired.ToString();
                message = $"Scheda '{card.Titolo}' scaduta da {-days} giorni (scadenza {card.DataScadenza:dd/MM/yyyy})";
            }
            else if (days <= 30)
            {
                type = NotificationType.Expired.ToString();
                message = $"Scheda '{card.Titolo}' scade tra {days} giorni ({card.DataScadenza:dd/MM/yyyy})";
            }
            else
            {
                type = NotificationType.ExpiringSoon.ToString();
                message = $"Scheda '{card.Titolo}' in scadenza tra {days} giorni ({card.DataScadenza:dd/MM/yyyy})";
            }

            var exists = await _context.Notifications.AnyAsync(n =>
                n.CardId == card.Id && n.Type == type && n.SentDate == card.DataScadenza);

            if (!exists)
            {
                _context.Notifications.Add(new Notification
                {
                    ClientId = card.ClientId,
                    CardId = card.Id,
                    Type = type,
                    Message = message,
                    IsRead = false,
                    SentDate = card.DataScadenza,
                    CreatedAt = DateTime.UtcNow
                });
                notificationsCreated++;
            }
        }

        if (notificationsCreated > 0)
            await _context.SaveChangesAsync();

        _logger.LogInformation("Notifiche generate: {Count}", notificationsCreated);
        return notificationsCreated;
    }
}
