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

    [Column("days_remaining")]
    public int? DaysRemaining { get; set; }

    [Column("frequenza_controllo")]
    public string? FrequenzaControllo { get; set; }

    [Column("osservazioni")]
    public string? Osservazioni { get; set; }

    // Dati estratti dalla scheda di sicurezza (SDS) del prodotto chimico.
    // Il produttore è in EnteEmittitore e la data della SDS in DataRilascio.

    [Column("frasi_h")]
    public string? FrasiH { get; set; }

    [Column("pittogrammi")]
    public string? Pittogrammi { get; set; }

    [Column("composizione_cas_sopra")]
    public string? ComposizioneCasSopra { get; set; }

    [Column("composizione_cas_sotto")]
    public string? ComposizioneCasSotto { get; set; }

    [Column("composizione")]
    public string? Composizione { get; set; }

    [Column("contiene_diisocianati")]
    public bool? ContieneDiisocianati { get; set; }

    [Column("stato_fisico")]
    public string? StatoFisico { get; set; }

    [Column("temperatura_ebollizione")]
    public string? TemperaturaEbollizione { get; set; }

    [Column("cov_percent")]
    public string? CovPercent { get; set; }

    [Column("densita")]
    public string? Densita { get; set; }

    [Column("sds_url")]
    public string? SdsUrl { get; set; }

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
