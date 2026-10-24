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
    public string? FrasiH { get; set; }
    public string? Pittogrammi { get; set; }
    public string? ComposizioneCasSopra { get; set; }
    public string? ComposizioneCasSotto { get; set; }
    public string? Composizione { get; set; }
    public bool? ContieneDiisocianati { get; set; }
    public string? StatoFisico { get; set; }
    public string? TemperaturaEbollizione { get; set; }
    public string? CovPercent { get; set; }
    public string? Densita { get; set; }
    public string? SdsUrl { get; set; }

    public void ApplyTo(SSA.SDS.Api.Entities.SafetyCard card)
    {
        card.ClientId = ClientId;
        card.Tipologia = Tipologia;
        card.Titolo = Titolo;
        card.NumeroProtocollo = NumeroProtocollo;
        card.EnteEmittitore = EnteEmittitore;
        card.DataRilascio = DataRilascio;
        card.DataScadenza = DataScadenza;
        card.ValiditaMesi = ValiditaMesi;
        card.FrequenzaControllo = FrequenzaControllo;
        card.Osservazioni = Osservazioni;
        card.FrasiH = FrasiH;
        card.Pittogrammi = Pittogrammi;
        card.ComposizioneCasSopra = ComposizioneCasSopra;
        card.ComposizioneCasSotto = ComposizioneCasSotto;
        card.Composizione = Composizione;
        card.ContieneDiisocianati = ContieneDiisocianati;
        card.StatoFisico = StatoFisico;
        card.TemperaturaEbollizione = TemperaturaEbollizione;
        card.CovPercent = CovPercent;
        card.Densita = Densita;
        card.SdsUrl = SdsUrl;
    }
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
    public string? FrasiH { get; set; }
    public string? Pittogrammi { get; set; }
    public string? ComposizioneCasSopra { get; set; }
    public string? ComposizioneCasSotto { get; set; }
    public string? Composizione { get; set; }
    public bool? ContieneDiisocianati { get; set; }
    public string? StatoFisico { get; set; }
    public string? TemperaturaEbollizione { get; set; }
    public string? CovPercent { get; set; }
    public string? Densita { get; set; }
    public string? SdsUrl { get; set; }
    public string? PdfUrl { get; set; }
    public bool HasPdf { get; set; }
    public bool LlmAnalyzed { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public static SafetyCardDto From(SSA.SDS.Api.Entities.SafetyCard sc, string? clientName = null) => new()
    {
        Id = sc.Id,
        ClientId = sc.ClientId,
        ClientName = clientName ?? sc.Client?.RagioneSociale ?? string.Empty,
        Tipologia = sc.Tipologia,
        Titolo = sc.Titolo,
        NumeroProtocollo = sc.NumeroProtocollo,
        EnteEmittitore = sc.EnteEmittitore,
        DataRilascio = sc.DataRilascio,
        DataScadenza = sc.DataScadenza,
        ValiditaMesi = sc.ValiditaMesi,
        Stato = sc.Stato,
        DaysRemaining = sc.DaysRemaining,
        FrequenzaControllo = sc.FrequenzaControllo,
        Osservazioni = sc.Osservazioni,
        FrasiH = sc.FrasiH,
        Pittogrammi = sc.Pittogrammi,
        ComposizioneCasSopra = sc.ComposizioneCasSopra,
        ComposizioneCasSotto = sc.ComposizioneCasSotto,
        Composizione = sc.Composizione,
        ContieneDiisocianati = sc.ContieneDiisocianati,
        StatoFisico = sc.StatoFisico,
        TemperaturaEbollizione = sc.TemperaturaEbollizione,
        CovPercent = sc.CovPercent,
        Densita = sc.Densita,
        SdsUrl = sc.SdsUrl,
        PdfUrl = sc.PdfUrl != null ? $"/api/files/{sc.PdfUrl.Replace('\\', '/')}" : null,
        HasPdf = !string.IsNullOrEmpty(sc.PdfUrl),
        LlmAnalyzed = sc.LlmAnalyzed,
        CreatedAt = sc.CreatedAt,
        UpdatedAt = sc.UpdatedAt
    };
}
