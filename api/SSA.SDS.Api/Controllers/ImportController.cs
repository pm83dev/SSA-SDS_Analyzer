using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace SSA.SDS.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ImportController : ControllerBase
{
    private readonly ILogger<ImportController> _logger;

    public ImportController(ILogger<ImportController> logger)
    {
        _logger = logger;
    }

    [HttpPost("excel")]
    public IActionResult ImportExcel(IFormFile file)
    {
        _logger.LogInformation("Import Excel received: {FileName}", file?.FileName);
        return Ok(new { message = "Import Excel - da implementare" });
    }

    [HttpPost("pdf")]
    public async Task<IActionResult> ImportPdf(IFormFile file)
    {
        _logger.LogInformation("Import PDF received: {FileName}", file?.FileName);
        return Ok(new { message = "Import PDF - da implementare" });
    }
}
