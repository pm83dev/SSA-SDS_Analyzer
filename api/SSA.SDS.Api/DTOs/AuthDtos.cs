namespace SSA.SDS.Api.DTOs;

public class LoginRequest
{
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class LoginResponse
{
    public string AccessToken { get; set; } = string.Empty;
    public string RefreshToken { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public string Role { get; set; } = string.Empty;
}

public class RefreshRequest
{
    public string RefreshToken { get; set; } = string.Empty;
}

public class RegisterRequest
{
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = "Operator";
}

public class CreateClientDto
{
    public string RagioneSociale { get; set; } = string.Empty;
    public string? CodiceFiscale { get; set; }
    public string? Indirizzo { get; set; }
    public string? Citta { get; set; }
    public string? Provincia { get; set; }
    public string? Cap { get; set; }
    public string? Telefono { get; set; }
    public string? Email { get; set; }
    public string? Contatto { get; set; }
    public string? Note { get; set; }
}

public class UpdateClientDto
{
    public string? RagioneSociale { get; set; }
    public string? CodiceFiscale { get; set; }
    public string? Indirizzo { get; set; }
    public string? Citta { get; set; }
    public string? Provincia { get; set; }
    public string? Cap { get; set; }
    public string? Telefono { get; set; }
    public string? Email { get; set; }
    public string? Contatto { get; set; }
    public string? Note { get; set; }
}

public class ClientDto
{
    public int Id { get; set; }
    public string RagioneSociale { get; set; } = string.Empty;
    public string? CodiceFiscale { get; set; }
    public string? Indirizzo { get; set; }
    public string? Citta { get; set; }
    public string? Provincia { get; set; }
    public string? Cap { get; set; }
    public string? Telefono { get; set; }
    public string? Email { get; set; }
    public string? Contatto { get; set; }
    public string? Note { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public int TotalCards { get; set; }
}

public class CreateSafetyCardDto
{
    public int ClientId { get; set; }
    public string Tipologia { get; set; } = string.Empty;
    public string Titolo { get; set; } = string.Empty;
    public string? NumeroProtocollo { get; set; }
    public string? EnteEmittitore { get; set; }
    public DateTime? DataRilascio { get; set; }
    public DateTime? DataScadenza { get; set; }
    public int? ValiditaMesi { get; set; }
    public string? FrequenzaControllo { get; set; }
    public string? Osservazioni { get; set; }
}

public class SafetyCardDto
{
    public int Id { get; set; }
    public int ClientId { get; set; }
    public string ClientName { get; set; } = string.Empty;
    public string Tipologia { get; set; } = string.Empty;
    public string Titolo { get; set; } = string.Empty;
    public string? NumeroProtocollo { get; set; }
    public string? EnteEmittitore { get; set; }
    public DateTime? DataRilascio { get; set; }
    public DateTime? DataScadenza { get; set; }
    public int? ValiditaMesi { get; set; }
    public string Stato { get; set; } = "NotExpired";
    public int? DaysRemaining { get; set; }
    public string? FrequenzaControllo { get; set; }
    public string? Osservazioni { get; set; }
    public string? PdfUrl { get; set; }
    public bool HasPdf { get; set; }
    public bool LlmAnalyzed { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
