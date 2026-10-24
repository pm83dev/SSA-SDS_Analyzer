using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SSA.SDS.Api.Data;
using SSA.SDS.Api.DTOs;
using SSA.SDS.Api.Entities;
using SSA.SDS.Api.Services;

namespace SSA.SDS.Api.Controllers;

[ApiController]
[Route("api/safety-cards")]
[Authorize]
public class SafetyCardsController : ControllerBase
{
    private readonly SdsDbContext _context;
    private readonly IFileStorageService _fileStorage;
    private readonly IImportService _importService;
    private readonly IExpirationService _expirationService;
    private readonly ILogger<SafetyCardsController> _logger;

    public SafetyCardsController(
        SdsDbContext context,
        IFileStorageService fileStorage,
        IImportService importService,
        IExpirationService expirationService,
        ILogger<SafetyCardsController> logger)
    {
        _context = context;
        _fileStorage = fileStorage;
        _importService = importService;
        _expirationService = expirationService;
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        await _expirationService.RecalculateCardStatusesAsync();

        var cards = await _context.SafetyCards
            .Include(sc => sc.Clients)
            .ToListAsync();

        return Ok(cards.Select(MapCard));
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var card = await _context.SafetyCards
            .Include(sc => sc.Clients)
            .FirstOrDefaultAsync(sc => sc.Id == id);

        if (card == null)
            return NotFound();

        return Ok(MapCard(card));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateSafetyCardDto dto)
    {
        var clients = await LoadClientsAsync(dto.ClientIds);
        if (clients == null)
            return BadRequest(new { message = "Uno o più clienti non trovati" });

        var card = new SafetyCard();
        dto.ApplyTo(card);
        foreach (var c in clients) card.Clients.Add(c);

        if (card.DataScadenza != null)
        {
            var days = (int)(card.DataScadenza.Value.Date - DateTime.Today).Days;
            card.Stato = days < 0 ? "Expired" : days <= 90 ? "Expiring" : "Valid";
            card.DaysRemaining = days;
        }

        _context.SafetyCards.Add(card);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = card.Id }, MapCard(card));
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] CreateSafetyCardDto dto)
    {
        var card = await _context.SafetyCards.Include(sc => sc.Clients).FirstOrDefaultAsync(sc => sc.Id == id);
        if (card == null) return NotFound();
        var clients = await LoadClientsAsync(dto.ClientIds);
        if (clients == null)
            return BadRequest(new { message = "Uno o più clienti non trovati" });

        var before = VerifiableValues(card);
        dto.ApplyTo(card);
        card.Clients.Clear();
        foreach (var c in clients) card.Clients.Add(c);
        UpdateVerificationFlags(card, before, dto.DatiVerificati);

        if (card.DataScadenza != null)
        {
            var days = (int)(card.DataScadenza.Value.Date - DateTime.Today).Days;
            card.Stato = days < 0 ? "Expired" : days <= 90 ? "Expiring" : "Valid";
            card.DaysRemaining = days;
        }
        else
        {
            card.Stato = "NotExpired";
            card.DaysRemaining = null;
        }

        card.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return Ok(MapCard(card));
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var card = await _context.SafetyCards.FindAsync(id);
        if (card == null) return NotFound();

        if (!string.IsNullOrEmpty(card.PdfUrl))
            _fileStorage.DeletePdf(card.PdfUrl);

        _context.SafetyCards.Remove(card);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpPost("{id:int}/upload-pdf")]
    [RequestSizeLimit(30 * 1024 * 1024)]
    public async Task<IActionResult> UploadPdf(int id, IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new { message = "Nessun file caricato" });

        var card = await _context.SafetyCards.FindAsync(id);
        if (card == null) return NotFound();

        var relativePath = await _fileStorage.SavePdfAsync(card.Id, file.OpenReadStream(), file.FileName);
        card.PdfUrl = relativePath;
        card.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return Ok(new
        {
            pdfPath = $"/api/files/{relativePath.Replace('\\', '/')}",
            fileName = file.FileName,
            size = file.Length
        });
    }

    [HttpGet("{id:int}/pdf-url")]
    public async Task<IActionResult> GetPdfUrl(int id)
    {
        var card = await _context.SafetyCards.FindAsync(id);
        if (card == null) return NotFound();
        if (string.IsNullOrEmpty(card.PdfUrl)) return Ok((string?)null);

        return Ok($"/api/files/{card.PdfUrl.Replace('\\', '/')}");
    }

    [HttpDelete("{id:int}/pdf")]
    public async Task<IActionResult> DeletePdf(int id)
    {
        var card = await _context.SafetyCards.FindAsync(id);
        if (card == null) return NotFound();

        if (!string.IsNullOrEmpty(card.PdfUrl))
            _fileStorage.DeletePdf(card.PdfUrl);

        card.PdfUrl = null;
        card.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpPost("analyze-pdf")]
    [RequestSizeLimit(30 * 1024 * 1024)]
    // clientId facoltativo: senza cliente la scheda va solo nell'archivio
    public async Task<IActionResult> AnalyzePdf([FromForm] int? clientId, IFormFile pdfFile)
    {
        if (pdfFile == null || pdfFile.Length == 0)
            return BadRequest(new { message = "Nessun file caricato" });

        using var stream = pdfFile.OpenReadStream();
        var result = await _importService.AnalyzePdfAsync(stream, clientId, pdfFile.FileName);

        return result.Success ? Ok(result) : BadRequest(result);
    }

    private static SafetyCardDto MapCard(SafetyCard sc) => SafetyCardDto.From(sc);

    // Clienti da collegare alla scheda; null se qualche id non esiste
    private async Task<List<Client>?> LoadClientsAsync(IEnumerable<int>? ids)
    {
        var distinct = (ids ?? Enumerable.Empty<int>()).Distinct().ToList();
        var clients = await _context.Clients.Where(c => distinct.Contains(c.Id)).ToListAsync();
        return clients.Count == distinct.Count ? clients : null;
    }

    // Valori dei campi che l'import PDF può segnare "da verificare" (chiavi come nell'API)
    private static Dictionary<string, string?> VerifiableValues(SafetyCard c) => new()
    {
        ["titolo"] = c.Titolo,
        ["enteEmittitore"] = c.EnteEmittitore,
        ["numeroProtocollo"] = c.NumeroProtocollo,
        ["dataRilascio"] = c.DataRilascio?.ToString("yyyy-MM-dd"),
        ["dataScadenza"] = c.DataScadenza?.ToString("yyyy-MM-dd"),
        ["frasiH"] = c.FrasiH,
        ["pittogrammi"] = c.Pittogrammi,
        ["composizioneCasSopra"] = c.ComposizioneCasSopra,
        ["composizioneCasSotto"] = c.ComposizioneCasSotto,
        ["composizione"] = c.Composizione,
        ["contieneDiisocianati"] = c.ContieneDiisocianati?.ToString(),
        ["statoFisico"] = c.StatoFisico,
        ["temperaturaEbollizione"] = c.TemperaturaEbollizione,
        ["covPercent"] = c.CovPercent,
        ["densita"] = c.Densita,
        ["sdsUrl"] = c.SdsUrl
    };

    // Un campo "da verificare" esce dall'elenco quando l'utente lo modifica nel form;
    // con "Ho verificato i dati con la scheda" si tolgono tutti
    private static void UpdateVerificationFlags(SafetyCard card, Dictionary<string, string?> before, bool allVerified)
    {
        if (string.IsNullOrWhiteSpace(card.CampiDaVerificare)) return;
        if (allVerified)
        {
            card.CampiDaVerificare = null;
            card.NoteVerifica = null;
            return;
        }

        var after = VerifiableValues(card);
        var remaining = card.CampiDaVerificare.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .Where(f => !before.ContainsKey(f) || before[f] == after[f])
            .ToList();
        card.CampiDaVerificare = remaining.Count > 0 ? string.Join(",", remaining) : null;
        card.NoteVerifica = remaining.Count > 0 && card.NoteVerifica != null
            ? string.Join("\n", card.NoteVerifica.Split('\n').Where(l => remaining.Any(f => l.StartsWith(f + ":"))))
            : null;
    }
}
