namespace SSA.SDS.Api.DTOs;

public class DashboardStatsDto
{
    public int TotalClients { get; set; }
    public int TotalCards { get; set; }
    public int ExpiringCards { get; set; }
    public int ExpiredCards { get; set; }
    public int ValidCards { get; set; }
    public int TotalProducts { get; set; }
    public int UnreadNotifications { get; set; }
}

public class ExpiringCardDto
{
    public int Id { get; set; }
    public int ClientId { get; set; }
    public string ClientName { get; set; } = string.Empty;
    public string Tipologia { get; set; } = string.Empty;
    public string Titolo { get; set; } = string.Empty;
    public DateTime? DataScadenza { get; set; }
    public int? DaysRemaining { get; set; }
    public string Stato { get; set; } = string.Empty;
}

public class NotificationDto
{
    public int Id { get; set; }
    public int ClientId { get; set; }
    public string ClientName { get; set; } = string.Empty;
    public int? CardId { get; set; }
    public string? CardTitle { get; set; }
    public string Type { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public bool IsRead { get; set; }
    public DateTime? SentDate { get; set; }
    public DateTime CreatedAt { get; set; }
}
