using System.ComponentModel.DataAnnotations;

namespace SSA.SDS.Api.DTOs;

public class ImportSafetyCardDto
{
    [Required]
    public string ClientName { get; set; } = string.Empty;
    
    [Required]
    public string Tipologia { get; set; } = string.Empty;
    
    [Required]
    public string Titolo { get; set; } = string.Empty;
    
    public string? NumeroProtocollo { get; set; }
    
    public string? EnteEmittitore { get; set; }
    
    public DateTime? DataRilascio { get; set; }
    
    public DateTime? DataScadenza { get; set; }
    
    public int? ValiditaMesi { get; set; }
    
    public string? FrequenzaControllo { get; set; }
    
    public string? Osservazioni { get; set; }
}