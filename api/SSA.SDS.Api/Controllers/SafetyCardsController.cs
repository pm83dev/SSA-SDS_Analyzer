using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SSA.SDS.Api.Data;
using SSA.SDS.Api.DTOs;
using SSA.SDS.Api.Entities;

namespace SSA.SDS.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SafetyCardsController : ControllerBase
{
    private readonly SdsDbContext _context;

    public SafetyCardsController(SdsDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var cards = await _context.SafetyCards
            .Include(sc => sc.Client)
            .ToListAsync();

        var result = cards.Select(sc => new SafetyCardDto
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
            FrequenzaControllo = sc.FrequenzaControllo,
            Osservazioni = sc.Osservazioni,
            PdfUrl = sc.PdfUrl,
            LlmAnalyzed = sc.LlmAnalyzed,
            CreatedAt = sc.CreatedAt,
            UpdatedAt = sc.UpdatedAt
        });

        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var card = await _context.SafetyCards
            .Include(sc => sc.Client)
            .FirstOrDefaultAsync(sc => sc.Id == id);

        if (card == null)
            return NotFound();

        return Ok(new SafetyCardDto
        {
            Id = card.Id,
            ClientId = card.ClientId,
            ClientName = card.Client != null ? card.Client.RagioneSociale : string.Empty,
            Tipologia = card.Tipologia,
            Titolo = card.Titolo,
            NumeroProtocollo = card.NumeroProtocollo,
            EnteEmittitore = card.EnteEmittitore,
            DataRilascio = card.DataRilascio,
            DataScadenza = card.DataScadenza,
            ValiditaMesi = card.ValiditaMesi,
            Stato = card.Stato,
            FrequenzaControllo = card.FrequenzaControllo,
            Osservazioni = card.Osservazioni,
            PdfUrl = card.PdfUrl,
            LlmAnalyzed = card.LlmAnalyzed,
            CreatedAt = card.CreatedAt,
            UpdatedAt = card.UpdatedAt
        });
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateSafetyCardDto dto)
    {
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
        _context.SafetyCards.Add(card);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = card.Id }, card);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] CreateSafetyCardDto dto)
    {
        var card = await _context.SafetyCards.FindAsync(id);
        if (card == null) return NotFound();

        card.Tipologia = dto.Tipologia;
        card.Titolo = dto.Titolo;
        card.NumeroProtocollo = dto.NumeroProtocollo;
        card.EnteEmittitore = dto.EnteEmittitore;
        card.DataRilascio = dto.DataRilascio;
        card.DataScadenza = dto.DataScadenza;
        card.ValiditaMesi = dto.ValiditaMesi;
        card.FrequenzaControllo = dto.FrequenzaControllo;
        card.Osservazioni = dto.Osservazioni;

        await _context.SaveChangesAsync();
        return Ok(card);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var card = await _context.SafetyCards.FindAsync(id);
        if (card == null) return NotFound();

        _context.SafetyCards.Remove(card);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
