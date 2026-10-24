using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SSA.SDS.Api.Entities;

public class SafetyCard
{
    [Key]
    public int Id { get; set; }

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

    // Nome originale del file (PDF o Excel) da cui la scheda è stata importata
    [Column("nome_file_importato")]
    public string? NomeFileImportato { get; set; }

    // Campi (nomi come nell'API, separati da virgola) che l'analisi del PDF non ha potuto verificare
    // nel testo della SDS: il dato non è stato inserito e va controllato sulla scheda
    [Column("campi_da_verificare")]
    public string? CampiDaVerificare { get; set; }

    // Motivo per ogni campo da verificare, una riga per campo ("campo: motivo")
    [Column("note_verifica")]
    public string? NoteVerifica { get; set; }

    [Column("llm_analyzed")]
    public bool LlmAnalyzed { get; set; }

    [Column("llm_raw_response")]
    public string? LlmRawResponse { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // SHA-256 del PDF importato: lo stesso file importato di nuovo riusa questa scheda invece di duplicarla
    [Column("pdf_hash")]
    [MaxLength(64)]
    public string? PdfHash { get; set; }

    // Una scheda può essere collegata a più clienti (o a nessuno: resta nell'archivio)
    public ICollection<Client> Clients { get; set; } = new List<Client>();
}
