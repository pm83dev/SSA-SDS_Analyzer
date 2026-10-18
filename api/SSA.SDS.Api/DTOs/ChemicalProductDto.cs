namespace SSA.SDS.Api.DTOs;

public class ChemicalProductDto
{
    public int Id { get; set; }
    public int ClientId { get; set; }
    public string ClientName { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;
    public string? Producer { get; set; }
    public string? HPhrases { get; set; }
    public string? Pictogram { get; set; }
    public string? CompositionCasAbove { get; set; }
    public string? CompositionCasBelow { get; set; }
    public string? Composition { get; set; }
    public bool? HasDiisocyanates { get; set; }
    public string? PhysicalState { get; set; }
    public string? BoilingPoint { get; set; }
    public string? VocPercent { get; set; }
    public string? Density { get; set; }
    public string? SdsUrl { get; set; }
    public DateTime? SdsDate { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class CreateChemicalProductDto
{
    public int ClientId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string? Producer { get; set; }
    public string? HPhrases { get; set; }
    public string? Pictogram { get; set; }
    public string? CompositionCasAbove { get; set; }
    public string? CompositionCasBelow { get; set; }
    public string? Composition { get; set; }
    public bool? HasDiisocyanates { get; set; }
    public string? PhysicalState { get; set; }
    public string? BoilingPoint { get; set; }
    public string? VocPercent { get; set; }
    public string? Density { get; set; }
    public string? SdsUrl { get; set; }
    public DateTime? SdsDate { get; set; }
}
