using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SSA.SDS.Api.Entities;

public class ChemicalProduct
{
    [Key]
    public int Id { get; set; }

    [Required]
    [Column("client_id")]
    public int ClientId { get; set; }

    [Required]
    [Column("product_name")]
    public string ProductName { get; set; } = string.Empty;

    [Column("producer")]
    public string? Producer { get; set; }

    [Column("h_phrases")]
    public string? HPhrases { get; set; }

    [Column("pictogram")]
    public string? Pictogram { get; set; }

    [Column("composition_cas_above")]
    public string? CompositionCasAbove { get; set; }

    [Column("composition_cas_below")]
    public string? CompositionCasBelow { get; set; }

    [Column("composition")]
    public string? Composition { get; set; }

    [Column("has_diisocyanates")]
    public bool? HasDiisocyanates { get; set; }

    [Column("physical_state")]
    public string? PhysicalState { get; set; }

    [Column("boiling_point")]
    public string? BoilingPoint { get; set; }

    [Column("voc_percent")]
    public string? VocPercent { get; set; }

    [Column("density")]
    public string? Density { get; set; }

    [Column("sds_url")]
    public string? SdsUrl { get; set; }

    [Column("sds_date")]
    public DateTime? SdsDate { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    [ForeignKey("ClientId")]
    public Client? Client { get; set; }
}
