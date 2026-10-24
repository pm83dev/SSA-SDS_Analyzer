using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace SSA.LlmService.Models;

public class SafetyDataSheet
{
    public int Id { get; set; }
    
    [Required]
    [JsonPropertyName("titolo")]
    public string Titolo { get; set; } = string.Empty;
    
    [JsonPropertyName("produttore")]
    public string Produttore { get; set; } = string.Empty;
    
    [JsonPropertyName("frasi_h")]
    public string FrasiH { get; set; } = string.Empty;
    
    [JsonPropertyName("pittogramma")]
    public string Pittogramma { get; set; } = string.Empty;
    
    [JsonPropertyName("composizione_cas_sopra_01")]
    public string ComposizioneCasSopra01 { get; set; } = string.Empty;
    
    [JsonPropertyName("composizione_cas_sotto_01")]
    public string ComposizioneCasSotto01 { get; set; } = string.Empty;
    
    [JsonPropertyName("composizione")]
    public string Composizione { get; set; } = string.Empty;
    
    [JsonPropertyName("stato_fisico")]
    public string StatoFisico { get; set; } = string.Empty;
    
    [JsonPropertyName("teb")]
    public string TEB { get; set; } = string.Empty;
    
    [JsonPropertyName("cov_percent")]
    public string CovPercent { get; set; } = string.Empty;
    
    [JsonPropertyName("densita")]
    public string Densita { get; set; } = string.Empty;
    
    [JsonPropertyName("sds_url")]
    public string SdsUrl { get; set; } = string.Empty;
    
    [JsonPropertyName("data_sds")]
    public DateTime? DataSds { get; set; }
    
    // Additional fields based on typical SDS structure
    public string CasNumbers { get; set; } = string.Empty;
    public string ChemicalName { get; set; } = string.Empty;
    public string ProductIdentifier { get; set; } = string.Empty;
    public string SignalWord { get; set; } = string.Empty;
    public string EmergencyOverview { get; set; } = string.Empty;
    public string FirstAidMeasures { get; set; } = string.Empty;
    public string FireFightingMeasures { get; set; } = string.Empty;
    public string AccidentalReleaseMeasures { get; set; } = string.Empty;
    public string HandlingAndStorage { get; set; } = string.Empty;
    public string ExposureControls { get; set; } = string.Empty;
    public string PhysicalChemicalProperties { get; set; } = string.Empty;
    public string StabilityReactivity { get; set; } = string.Empty;
    public string ToxicologicalInformation { get; set; } = string.Empty;
    public string EcologicalInformation { get; set; } = string.Empty;
    public string DisposalConsiderations { get; set; } = string.Empty;
    public string TransportInformation { get; set; } = string.Empty;
    public string RegulatoryInformation { get; set; } = string.Empty;
    public string OtherInformation { get; set; } = string.Empty;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}