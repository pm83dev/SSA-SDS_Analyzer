namespace SSA.SDS.Api.DTOs;

public class ImportHistoryDto
{
    public int Id { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string FileType { get; set; } = string.Empty;
    public int? ClientId { get; set; }
    public string? ClientName { get; set; }
    public int RecordsImported { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? ErrorMessage { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class ImportExcelResultDto
{
    public int HistoryId { get; set; }
    public string Status { get; set; } = string.Empty;
    public int ClientsImported { get; set; }
    public int CardsImported { get; set; }
    // Righe di prodotti già presenti in archivio: la scheda esistente è stata collegata al cliente
    public int LinksAdded { get; set; }
    public int Errors { get; set; }
    public List<string> ErrorDetails { get; set; } = new();
}

public class AnalyzePdfResultDto
{
    public bool Success { get; set; }
    // true se lo stesso PDF era già in archivio: la scheda esistente è stata (eventualmente) collegata al cliente
    public bool AlreadyExisting { get; set; }
    public string? Message { get; set; }
    public SafetyCardDto? Card { get; set; }
}
