using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SSA.SDS.Api.Data;
using SSA.SDS.Api.DTOs;
using SSA.SDS.Api.Services;

namespace SSA.SDS.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ImportController : ControllerBase
{
    private readonly SdsDbContext _context;
    private readonly IImportService _importService;
    private readonly ILogger<ImportController> _logger;

    public ImportController(SdsDbContext context, IImportService importService, ILogger<ImportController> logger)
    {
        _context = context;
        _importService = importService;
        _logger = logger;
    }

    [HttpPost("excel")]
    [RequestSizeLimit(50 * 1024 * 1024)]
    public async Task<IActionResult> ImportExcel(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new { message = "Nessun file caricato" });

        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (extension != ".xlsx" && extension != ".xls")
            return BadRequest(new { message = "Formato non supportato: usa file .xlsx" });

        using var stream = file.OpenReadStream();
        var result = await _importService.ImportExcelAsync(stream, file.FileName);

        return result.Status == "Success" || result.CardsImported > 0
            ? Ok(result)
            : BadRequest(result);
    }

    [HttpGet("history")]
    public async Task<IActionResult> GetHistory()
    {
        var history = await _context.ImportHistories
            .Include(h => h.Client)
            .OrderByDescending(h => h.CreatedAt)
            .Take(100)
            .ToListAsync();

        return Ok(history.Select(h => new ImportHistoryDto
        {
            Id = h.Id,
            FileName = h.FileName,
            FileType = h.FileType,
            ClientId = h.ClientId,
            ClientName = h.Client?.RagioneSociale,
            RecordsImported = h.RecordsImported,
            Status = h.Status,
            ErrorMessage = h.ErrorMessage,
            CreatedAt = h.CreatedAt
        }));
    }

    [HttpGet("{id}/status")]
    public async Task<IActionResult> GetStatus(int id)
    {
        var history = await _context.ImportHistories
            .Include(h => h.Client)
            .FirstOrDefaultAsync(h => h.Id == id);

        if (history == null)
            return NotFound();

        return Ok(new ImportHistoryDto
        {
            Id = history.Id,
            FileName = history.FileName,
            FileType = history.FileType,
            ClientId = history.ClientId,
            ClientName = history.Client?.RagioneSociale,
            RecordsImported = history.RecordsImported,
            Status = history.Status,
            ErrorMessage = history.ErrorMessage,
            CreatedAt = history.CreatedAt
        });
    }
}
