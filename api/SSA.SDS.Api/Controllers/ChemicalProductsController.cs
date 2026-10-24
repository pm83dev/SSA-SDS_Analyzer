using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SSA.SDS.Api.Data;
using SSA.SDS.Api.DTOs;
using SSA.SDS.Api.Entities;

namespace SSA.SDS.Api.Controllers;

[ApiController]
[Route("api/chemical-products")]
[Authorize]
public class ChemicalProductsController : ControllerBase
{
    private readonly SdsDbContext _context;

    public ChemicalProductsController(SdsDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] int? clientId)
    {
        var query = _context.ChemicalProducts
            .Include(cp => cp.Client)
            .AsQueryable();

        if (clientId.HasValue)
            query = query.Where(cp => cp.ClientId == clientId.Value);

        var products = await query.OrderBy(cp => cp.ProductName).ToListAsync();
        return Ok(products.Select(MapProduct));
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var product = await _context.ChemicalProducts
            .Include(cp => cp.Client)
            .FirstOrDefaultAsync(cp => cp.Id == id);

        if (product == null) return NotFound();
        return Ok(MapProduct(product));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateChemicalProductDto dto)
    {
        if (!await _context.Clients.AnyAsync(c => c.Id == dto.ClientId))
            return BadRequest(new { message = "Cliente non trovato" });

        var product = new ChemicalProduct
        {
            ClientId = dto.ClientId,
            ProductName = dto.ProductName,
            Producer = dto.Producer,
            HPhrases = dto.HPhrases,
            Pictogram = dto.Pictogram,
            CompositionCasAbove = dto.CompositionCasAbove,
            CompositionCasBelow = dto.CompositionCasBelow,
            Composition = dto.Composition,
            HasDiisocyanates = dto.HasDiisocyanates,
            PhysicalState = dto.PhysicalState,
            BoilingPoint = dto.BoilingPoint,
            VocPercent = dto.VocPercent,
            Density = dto.Density,
            SdsUrl = dto.SdsUrl,
            SdsDate = dto.SdsDate
        };

        _context.ChemicalProducts.Add(product);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = product.Id }, MapProduct(product));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] CreateChemicalProductDto dto)
    {
        var product = await _context.ChemicalProducts.FindAsync(id);
        if (product == null) return NotFound();
        if (!await _context.Clients.AnyAsync(c => c.Id == dto.ClientId))
            return BadRequest(new { message = "Cliente non trovato" });

        product.ClientId = dto.ClientId;
        product.ProductName = dto.ProductName;
        product.Producer = dto.Producer;
        product.HPhrases = dto.HPhrases;
        product.Pictogram = dto.Pictogram;
        product.CompositionCasAbove = dto.CompositionCasAbove;
        product.CompositionCasBelow = dto.CompositionCasBelow;
        product.Composition = dto.Composition;
        product.HasDiisocyanates = dto.HasDiisocyanates;
        product.PhysicalState = dto.PhysicalState;
        product.BoilingPoint = dto.BoilingPoint;
        product.VocPercent = dto.VocPercent;
        product.Density = dto.Density;
        product.SdsUrl = dto.SdsUrl;
        product.SdsDate = dto.SdsDate;
        product.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return Ok(MapProduct(product));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var product = await _context.ChemicalProducts.FindAsync(id);
        if (product == null) return NotFound();

        _context.ChemicalProducts.Remove(product);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    private static ChemicalProductDto MapProduct(ChemicalProduct cp) => new()
    {
        Id = cp.Id,
        ClientId = cp.ClientId,
        ClientName = cp.Client?.RagioneSociale ?? string.Empty,
        ProductName = cp.ProductName,
        Producer = cp.Producer,
        HPhrases = cp.HPhrases,
        Pictogram = cp.Pictogram,
        CompositionCasAbove = cp.CompositionCasAbove,
        CompositionCasBelow = cp.CompositionCasBelow,
        Composition = cp.Composition,
        HasDiisocyanates = cp.HasDiisocyanates,
        PhysicalState = cp.PhysicalState,
        BoilingPoint = cp.BoilingPoint,
        VocPercent = cp.VocPercent,
        Density = cp.Density,
        SdsUrl = cp.SdsUrl,
        SdsDate = cp.SdsDate,
        CreatedAt = cp.CreatedAt,
        UpdatedAt = cp.UpdatedAt
    };
}
