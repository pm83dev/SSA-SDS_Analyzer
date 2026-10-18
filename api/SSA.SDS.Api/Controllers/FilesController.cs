using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SSA.SDS.Api.Services;

namespace SSA.SDS.Api.Controllers;

[ApiController]
[Route("api/files")]
[Authorize]
public class FilesController : ControllerBase
{
    private readonly IFileStorageService _fileStorage;

    public FilesController(IFileStorageService fileStorage)
    {
        _fileStorage = fileStorage;
    }

    [HttpGet("{**relativePath}")]
    public IActionResult Download(string relativePath)
    {
        var fullPath = _fileStorage.GetFilePath(relativePath);
        if (fullPath == null)
            return NotFound(new { message = "File non trovato" });

        return PhysicalFile(fullPath, "application/pdf", Path.GetFileName(fullPath));
    }
}
