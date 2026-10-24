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
            .Include(sc => sc.Client)
            .ToListAsync();

        return Ok(cards.Select(MapCard));
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var card = await _context.SafetyCards
            .Include(sc => sc.Client)
            .FirstOrDefaultAsync(sc => sc.Id == id);

        if (card == null)
            return NotFound();

        return Ok(MapCard(card));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateSafetyCardDto dto)
    {
        if (!await _context.Clients.AnyAsync(c => c.Id == dto.ClientId))
            return BadRequest(new { message = "Cliente non trovato" });

        var card = new SafetyCard
        {
            ClientId = dto.ClientId,
            Tipologia = dto.Tipologia,
            Titolo = dto.Titolo,
            NumeroProtocollo = dto.NumeroProtocollo,
            EnteEmittitore = dto.EnteEmittitore,
            DataRilascio = dto.DataRilascio,
            DataScadenza = dto.DataScadenza,
            ValiditaMesi = dto.ValiditaMesi,
            FrequenzaControllo = dto.FrequenzaControllo,
            Osservazioni = dto.Osservazioni
        };

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
        var card = await _context.SafetyCards.FindAsync(id);
        if (card == null) return NotFound();
        if (!await _context.Clients.AnyAsync(c => c.Id == dto.ClientId))
            return BadRequest(new { message = "Cliente non trovato" });

        card.ClientId = dto.ClientId;
        card.Tipologia = dto.Tipologia;
        card.Titolo = dto.Titolo;
        card.NumeroProtocollo = dto.NumeroProtocollo;
        card.EnteEmittitore = dto.EnteEmittitore;
        card.DataRilascio = dto.DataRilascio;
        card.DataScadenza = dto.DataScadenza;
        card.ValiditaMesi = dto.ValiditaMesi;
        card.FrequenzaControllo = dto.FrequenzaControllo;
        card.Osservazioni = dto.Osservazioni;

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

        var relativePath = await _fileStorage.SavePdfAsync(card.ClientId, card.Id, file.OpenReadStream(), file.FileName);
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
    public async Task<IActionResult> AnalyzePdf([FromForm] int clientId, IFormFile pdfFile)
    {
        if (pdfFile == null || pdfFile.Length == 0)
            return BadRequest(new { message = "Nessun file caricato" });

        using var stream = pdfFile.OpenReadStream();
        var result = await _importService.AnalyzePdfAsync(stream, clientId, pdfFile.FileName);

        return result.Success ? Ok(result) : BadRequest(result);
    }

    private static SafetyCardDto MapCard(SafetyCard sc) => new()
    {
        Id = sc.Id,
        ClientId = sc.ClientId,
        ClientName = sc.Client != null ? sc.Client.RagioneSociale : string.Empty,
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
        PdfUrl = sc.PdfUrl != null ? $"/api/files/{sc.PdfUrl.Replace('\\', '/')}" : null,
        HasPdf = !string.IsNullOrEmpty(sc.PdfUrl),
        LlmAnalyzed = sc.LlmAnalyzed,
        CreatedAt = sc.CreatedAt,
        UpdatedAt = sc.UpdatedAt
    };
}
