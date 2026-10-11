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
public class ClientsController : ControllerBase
{
    private readonly SdsDbContext _context;

    public ClientsController(SdsDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        return Ok(await _context.Clients
            .Include(c => c.SafetyCards)
            .Select(c => new ClientDto
            {
                Id = c.Id,
                RagioneSociale = c.RagioneSociale,
                CodiceFiscale = c.CodiceFiscale,
                Indirizzo = c.Indirizzo,
                Citta = c.Citta,
                Provincia = c.Provincia,
                Cap = c.Cap,
                Telefono = c.Telefono,
                Email = c.Email,
                Contatto = c.Contatto,
                Note = c.Note,
                CreatedAt = c.CreatedAt,
                UpdatedAt = c.UpdatedAt,
                TotalCards = c.SafetyCards.Count
            }).ToListAsync());
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var client = await _context.Clients
            .Include(c => c.SafetyCards)
            .Select(c => new ClientDto
            {
                Id = c.Id,
                RagioneSociale = c.RagioneSociale,
                CodiceFiscale = c.CodiceFiscale,
                Indirizzo = c.Indirizzo,
                Citta = c.Citta,
                Provincia = c.Provincia,
                Cap = c.Cap,
                Telefono = c.Telefono,
                Email = c.Email,
                Contatto = c.Contatto,
                Note = c.Note,
                CreatedAt = c.CreatedAt,
                UpdatedAt = c.UpdatedAt,
                TotalCards = c.SafetyCards.Count
            }).FirstOrDefaultAsync(c => c.Id == id);

        return client == null ? NotFound() : Ok(client);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateClientDto dto)
    {
        var client = new Client
        {
            RagioneSociale = dto.RagioneSociale,
            CodiceFiscale = dto.CodiceFiscale,
            Indirizzo = dto.Indirizzo,
            Citta = dto.Citta,
            Provincia = dto.Provincia,
            Cap = dto.Cap,
            Telefono = dto.Telefono,
            Email = dto.Email,
            Contatto = dto.Contatto,
            Note = dto.Note
        };
        _context.Clients.Add(client);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = client.Id }, client);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateClientDto dto)
    {
        var client = await _context.Clients.FindAsync(id);
        if (client == null) return NotFound();

        if (dto.RagioneSociale != null) client.RagioneSociale = dto.RagioneSociale;
        if (dto.CodiceFiscale != null) client.CodiceFiscale = dto.CodiceFiscale;
        if (dto.Indirizzo != null) client.Indirizzo = dto.Indirizzo;
        if (dto.Citta != null) client.Citta = dto.Citta;
        if (dto.Provincia != null) client.Provincia = dto.Provincia;
        if (dto.Cap != null) client.Cap = dto.Cap;
        if (dto.Telefono != null) client.Telefono = dto.Telefono;
        if (dto.Email != null) client.Email = dto.Email;
        if (dto.Contatto != null) client.Contatto = dto.Contatto;
        if (dto.Note != null) client.Note = dto.Note;

        client.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return Ok(client);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var client = await _context.Clients.FindAsync(id);
        if (client == null) return NotFound();

        _context.Clients.Remove(client);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
