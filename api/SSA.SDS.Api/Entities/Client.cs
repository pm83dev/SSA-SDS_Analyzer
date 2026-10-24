using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SSA.SDS.Api.Entities;

public class Client
{
    [Key]
    public int Id { get; set; }

    [Required]
    [Column("ragione_sociale")]
    public string RagioneSociale { get; set; } = string.Empty;

    [Column("codice_fiscale")]
    public string? CodiceFiscale { get; set; }

    [Column("indirizzo")]
    public string? Indirizzo { get; set; }

    [Column("citta")]
    public string? Citta { get; set; }

    [Column("provincia")]
    public string? Provincia { get; set; }

    [Column("cap")]
    public string? Cap { get; set; }

    [Column("telefono")]
    public string? Telefono { get; set; }

    [Column("email")]
    public string? Email { get; set; }

    [Column("contatto")]
    public string? Contatto { get; set; }

    [Column("note")]
    public string? Note { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Schede collegate al cliente (la stessa scheda può essere collegata a più clienti)
    public ICollection<SafetyCard> SafetyCards { get; set; } = new List<SafetyCard>();
}
