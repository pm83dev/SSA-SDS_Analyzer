using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SSA.SDS.Api.Entities;

public class SafetyCard
{
    [Key]
    public int Id { get; set; }

    [Required]
    [Column("client_id")]
    public int ClientId { get; set; }

    [Required]
    [Column("tipologia")]
    public string Tipologia { get; set; } = string.Empty;

    [Required]
    [Column("titolo")]
    public string Titolo { get; set; } = string.Empty;

    [Column("numero_protocollo")]
    public string? NumeroProtocollo { get; set; }

    [Column("ente_emittitore")]
    public string? EnteEmittitore { get; set; }

    [Column("data_rilascio")]
    public DateTime? DataRilascio { get; set; }

    [Column("data_scadenza")]
    public DateTime? DataScadenza { get; set; }

    [Column("validita_mesi")]
    public int? ValiditaMesi { get; set; }

    [Column("stato")]
    public string Stato { get; set; } = "NotExpired";

    [Column("frequenza_controllo")]
    public string? FrequenzaControllo { get; set; }

    [Column("osservazioni")]
    public string? Osservazioni { get; set; }

    [Column("pdf_url")]
    public string? PdfUrl { get; set; }

    [Column("llm_analyzed")]
    public bool LlmAnalyzed { get; set; }

    [Column("llm_raw_response")]
    public string? LlmRawResponse { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    [ForeignKey("ClientId")]
    public Client? Client { get; set; }
}
