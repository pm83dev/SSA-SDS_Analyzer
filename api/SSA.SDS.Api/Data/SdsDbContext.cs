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
            entity.HasIndex(sc => sc.DataScadenza);
            entity.HasIndex(sc => sc.PdfHash);

            // Molti-a-molti: eliminando un cliente o una scheda si eliminano solo i collegamenti
            entity.HasMany(sc => sc.Clients)
                  .WithMany(c => c.SafetyCards)
                  .UsingEntity<Dictionary<string, object>>(
                      "client_safety_cards",
                      j => j.HasOne<Client>().WithMany().HasForeignKey("client_id").OnDelete(DeleteBehavior.Cascade),
                      j => j.HasOne<SafetyCard>().WithMany().HasForeignKey("safety_card_id").OnDelete(DeleteBehavior.Cascade),
                      j =>
                      {
                          j.ToTable("client_safety_cards");
                          j.HasKey("client_id", "safety_card_id");
                          j.HasIndex("safety_card_id");
                      });
        });

        modelBuilder.Entity<ImportHistory>(entity =>
        {
            entity.ToTable("import_histories");
            entity.HasIndex(ih => ih.ClientId);
            // Lo storico delle importazioni resta anche se il cliente viene eliminato (senza riferimento al cliente)
            entity.HasOne(ih => ih.Client)
                  .WithMany()
                  .HasForeignKey(ih => ih.ClientId)
                  .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<Notification>(entity =>
        {
            entity.ToTable("notifications");
            entity.HasIndex(n => n.ClientId);
            entity.HasOne(n => n.Client).WithMany().HasForeignKey(n => n.ClientId).OnDelete(DeleteBehavior.SetNull);
            // Eliminando una scheda si eliminano anche le sue notifiche di scadenza
            entity.HasOne(n => n.SafetyCard).WithMany().HasForeignKey(n => n.CardId).OnDelete(DeleteBehavior.Cascade);
            entity.HasIndex(n => n.IsRead);
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.ToTable("users");
            entity.HasIndex(u => u.Username).IsUnique();
        });
    }
}
