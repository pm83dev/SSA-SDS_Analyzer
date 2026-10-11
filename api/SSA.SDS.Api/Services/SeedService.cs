using Microsoft.EntityFrameworkCore;
using SSA.SDS.Api.Data;
using SSA.SDS.Api.Entities;

namespace SSA.SDS.Api.Services;

public class SeedService
{
    private readonly SdsDbContext _context;

    public SeedService(SdsDbContext context) => _context = context;

    public async Task SeedDefaultAdminAsync()
    {
        if (await _context.Users.AnyAsync(u => u.Role == "Admin"))
            return;

        _context.Users.Add(new User
        {
            Username = "admin",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123"),
            Email = "admin@sds.local",
            Role = "Admin",
            IsActive = true
        });

        await _context.SaveChangesAsync();
    }
}
