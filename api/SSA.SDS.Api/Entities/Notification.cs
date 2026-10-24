using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SSA.SDS.Api.Entities;

public class Notification
{
    [Key]
    public int Id { get; set; }

    // Le notifiche di scadenza riguardano la scheda, che può essere di più clienti: il cliente è facoltativo
    [Column("client_id")]
    public int? ClientId { get; set; }

    [Column("card_id")]
    public int? CardId { get; set; }

    [Required]
    [Column("type")]
    public string Type { get; set; } = string.Empty;

    [Required]
    [Column("message")]
    public string Message { get; set; } = string.Empty;

    [Column("is_read")]
    public bool IsRead { get; set; }

    [Column("sent_date")]
    public DateTime? SentDate { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [ForeignKey("ClientId")]
    public Client? Client { get; set; }

    [ForeignKey("CardId")]
    public SafetyCard? SafetyCard { get; set; }
}
