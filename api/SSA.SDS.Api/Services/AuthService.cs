using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using SSA.SDS.Api.Data;
using SSA.SDS.Api.DTOs;
using SSA.SDS.Api.Entities;

namespace SSA.SDS.Api.Services;

public interface IAuthService
{
    Task<LoginResponse?> LoginAsync(string username, string password);
    Task<LoginResponse?> RefreshTokenAsync(string refreshToken);
    Task<User?> RegisterAsync(string username, string password, string email, string role);
    Task<User?> GetUserByUsernameAsync(string username);
    Task<User?> GetUserByIdAsync(int id);
}

public class AuthService : IAuthService
{
    private readonly SdsDbContext _context;
    private readonly IConfiguration _configuration;
    private readonly ILogger<AuthService> _logger;

    public AuthService(SdsDbContext context, IConfiguration configuration, ILogger<AuthService> logger)
    {
        _context = context;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<LoginResponse?> LoginAsync(string username, string password)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Username == username && u.IsActive);

        if (user == null || !BCrypt.Net.BCrypt.Verify(password, user.PasswordHash))
            return null;

        user.LastLogin = DateTime.UtcNow;
        ApplyRefreshToken(user);
        await _context.SaveChangesAsync();

        return BuildResponse(user);
    }

    public async Task<LoginResponse?> RefreshTokenAsync(string refreshToken)
    {
        if (string.IsNullOrWhiteSpace(refreshToken))
            return null;

        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.IsActive && u.RefreshToken == refreshToken);

        if (user == null)
        {
            _logger.LogWarning("Refresh token non valido");
            return null;
        }

        if (user.RefreshTokenExpires == null || user.RefreshTokenExpires < DateTime.UtcNow)
        {
            _logger.LogWarning("Refresh token scaduto per utente {Username}", user.Username);
            user.RefreshToken = null;
            user.RefreshTokenExpires = null;
            await _context.SaveChangesAsync();
            return null;
        }

        ApplyRefreshToken(user);
        await _context.SaveChangesAsync();

        return BuildResponse(user);
    }

    public async Task<User?> RegisterAsync(string username, string password, string email, string role)
    {
        if (await _context.Users.AnyAsync(u => u.Username == username))
            return null;

        var user = new User
        {
            Username = username,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
            Email = email,
            Role = role,
            IsActive = true
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();
        return user;
    }

    public async Task<User?> GetUserByUsernameAsync(string username)
        => await _context.Users.FirstOrDefaultAsync(u => u.Username == username);

    public async Task<User?> GetUserByIdAsync(int id)
        => await _context.Users.FindAsync(id);

    private LoginResponse BuildResponse(User user)
    {
        var expiresAt = DateTime.UtcNow.AddHours(GetExpirationHours());
        return new LoginResponse
        {
            AccessToken = GenerateJwtToken(user, expiresAt),
            RefreshToken = user.RefreshToken ?? string.Empty,
            ExpiresAt = expiresAt,
            Role = user.Role
        };
    }

    private void ApplyRefreshToken(User user)
    {
        var randomBytes = new byte[32];
        using var rng = System.Security.Cryptography.RandomNumberGenerator.Create();
        rng.GetBytes(randomBytes);
        user.RefreshToken = Convert.ToBase64String(randomBytes);
        user.RefreshTokenExpires = DateTime.UtcNow.AddDays(7);
    }

    private int GetExpirationHours()
    {
        var hours = _configuration.GetValue<int?>("Jwt:ExpirationHours");
        return hours == null || hours <= 0 ? 2 : hours.Value;
    }

    private string GenerateJwtToken(User user, DateTime expiresAt)
    {
        var jwtSettings = _configuration.GetSection("Jwt");
        var secretKey = jwtSettings["SecretKey"];
        if (string.IsNullOrEmpty(secretKey))
            throw new InvalidOperationException("JWT SecretKey not configured");

        var issuer = jwtSettings["Issuer"] ?? "SSA-SDS";
        var audience = jwtSettings["Audience"] ?? "SSA-SDS-Client";

        var key = System.Text.Encoding.UTF8.GetBytes(secretKey);
        var claims = new[]
        {
            new System.Security.Claims.Claim(System.Security.Claims.ClaimTypes.NameIdentifier, user.Id.ToString()),
            new System.Security.Claims.Claim(System.Security.Claims.ClaimTypes.Name, user.Username),
            new System.Security.Claims.Claim("role", user.Role),
            new System.Security.Claims.Claim("email", user.Email ?? string.Empty)
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: expiresAt,
            signingCredentials: new SigningCredentials(
                new SymmetricSecurityKey(key),
                SecurityAlgorithms.HmacSha256Signature)
        );

        return tokenHandler.WriteToken(token);
    }
}
