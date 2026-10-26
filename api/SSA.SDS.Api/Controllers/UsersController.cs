using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SSA.SDS.Api.Data;
using SSA.SDS.Api.DTOs;
using SSA.SDS.Api.Entities;

namespace SSA.SDS.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class UsersController : ControllerBase
{
    private readonly SdsDbContext _context;
    private readonly ILogger<UsersController> _logger;

    public UsersController(SdsDbContext context, ILogger<UsersController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var users = await _context.Users
            .OrderBy(u => u.Username)
            .Select(u => UserDto.From(u))
            .ToListAsync();
        return Ok(users);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null)
            return NotFound(new { message = "Utente non trovato" });
        return Ok(UserDto.From(user));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateUserDto request)
    {
        if (string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Password))
            return BadRequest(new { message = "Username e password sono obbligatori" });

        if (await _context.Users.AnyAsync(u => u.Username == request.Username))
            return Conflict(new { message = "Username già esistente" });

        var user = new User
        {
            Username = request.Username,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Email = request.Email,
            Role = request.Role ?? "Operator",
            IsActive = true
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();
        _logger.LogInformation("Nuovo utente creato: {Username} (ruolo: {Role})", user.Username, user.Role);
        return Ok(new { message = "Utente creato con successo", userId = user.Id });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateUserDto request)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null)
            return NotFound(new { message = "Utente non trovato" });

        if (request.Email != null) user.Email = request.Email;
        if (request.Role != null) user.Role = request.Role;
        if (request.IsActive.HasValue) user.IsActive = request.IsActive.Value;
        if (!string.IsNullOrWhiteSpace(request.Password))
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

        user.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        _logger.LogInformation("Utente aggiornato: {Username}", user.Username);
        return Ok(new { message = "Utente aggiornato con successo" });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null)
            return NotFound(new { message = "Utente non trovato" });

        // Non permettere di eliminare sé stessi
        var currentUserId = int.Parse(User.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier")?.Value ?? "0");
        if (user.Id == currentUserId)
            return BadRequest(new { message = "Non puoi eliminare il tuo stesso account" });

        // Disabilita invece di eliminare (per mantenere l'audit)
        user.IsActive = false;
        user.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        _logger.LogInformation("Utente disabilitato: {Username}", user.Username);
        return Ok(new { message = "Utente disabilitato con successo" });
    }
}