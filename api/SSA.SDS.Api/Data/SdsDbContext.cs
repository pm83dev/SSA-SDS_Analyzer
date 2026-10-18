using Microsoft.EntityFrameworkCore;
using SSA.SDS.Api.Entities;

namespace SSA.SDS.Api.Data;

public class SdsDbContext : DbContext
{
    public SdsDbContext(DbContextOptions<SdsDbContext> options) : base(options) { }

    public DbSet<Client> Clients => Set<Client>();
    public DbSet<SafetyCard> SafetyCards => Set<SafetyCard>();
    public DbSet<ImportHistory> ImportHistories => Set<ImportHistory>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<User> Users => Set<User>();
    public DbSet<ChemicalProduct> ChemicalProducts => Set<ChemicalProduct>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Client>(entity =>
        {
            entity.ToTable("clients");
            entity.HasIndex(c => c.CodiceFiscale).IsUnique();
        });

        modelBuilder.Entity<SafetyCard>(entity =>
        {
            entity.ToTable("safety_cards");
            entity.HasIndex(sc => sc.ClientId);
            entity.HasIndex(sc => sc.DataScadenza);
        });

        modelBuilder.Entity<ImportHistory>(entity =>
        {
            entity.ToTable("import_histories");
            entity.HasIndex(ih => ih.ClientId);
        });

        modelBuilder.Entity<Notification>(entity =>
        {
            entity.ToTable("notifications");
            entity.HasIndex(n => n.ClientId);
            entity.HasIndex(n => n.IsRead);
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.ToTable("users");
            entity.HasIndex(u => u.Username).IsUnique();
        });

        modelBuilder.Entity<ChemicalProduct>(entity =>
        {
            entity.ToTable("chemical_products");
            entity.HasIndex(cp => cp.ClientId);
        });
    }
}
