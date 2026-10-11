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
    Task<LoginResponse?> RefreshTokenAsync(string refreshToken, string? refreshTokenSecret);
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
        _context.Users.Update(user);
        await _context.SaveChangesAsync();

        var accessToken = GenerateJwtToken(user);
        var refreshToken = GenerateRefreshToken();

        return new LoginResponse
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            ExpiresAt = DateTime.UtcNow.AddHours(2),
            Role = user.Role
        };
    }

    public async Task<LoginResponse?> RefreshTokenAsync(string refreshToken, string? tokenSecret)
    {
        if (string.IsNullOrEmpty(refreshToken))
            return null;

        var user = await _context.Users.FirstOrDefaultAsync(u => u.IsActive);
        if (user == null)
            return null;

        return new LoginResponse
        {
            AccessToken = GenerateJwtToken(user),
            RefreshToken = GenerateRefreshToken(),
            ExpiresAt = DateTime.UtcNow.AddHours(2),
            Role = user.Role
        };
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

    private string GenerateJwtToken(User user)
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
            expires: DateTime.UtcNow.AddHours(2),
            signingCredentials: new SigningCredentials(
                new SymmetricSecurityKey(key),
                SecurityAlgorithms.HmacSha256Signature)
        );

        return tokenHandler.WriteToken(token);
    }

    private string GenerateRefreshToken()
    {
        var randomBytes = new byte[32];
        using var rng = System.Security.Cryptography.RandomNumberGenerator.Create();
        rng.GetBytes(randomBytes);
        return Convert.ToBase64String(randomBytes);
    }
}
