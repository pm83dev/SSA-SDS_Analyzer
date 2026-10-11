using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace SSA.SDS.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ScenariosController : ControllerBase
{
    private readonly ILogger<ScenariosController> _logger;

    public ScenariosController(ILogger<ScenariosController> logger)
    {
        _logger = logger;
    }

    [HttpGet]
    public IActionResult GetAll()
    {
        return Ok(new { message = "Scenarios endpoint - da implementare" });
    }
}
