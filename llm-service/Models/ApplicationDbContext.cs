using Microsoft.EntityFrameworkCore;

namespace SSA.LlmService.Models;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    public DbSet<SafetyDataSheet> SafetyDataSheets { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<SafetyDataSheet>(entity =>
        {
            entity.HasKey(e => e.Id);
            
            entity.Property(e => e.Titolo)
                .IsRequired()
                .HasMaxLength(500);
                
            entity.Property(e => e.Produttore)
                .HasMaxLength(500);
                
            entity.Property(e => e.FrasiH)
                .HasMaxLength(1000);
                
            entity.Property(e => e.Pittogramma)
                .HasMaxLength(500);
                
            entity.Property(e => e.ComposizioneCasSopra01)
                .HasMaxLength(2000);
                
            entity.Property(e => e.ComposizioneCasSotto01)
                .HasMaxLength(2000);
                
            entity.Property(e => e.Composizione)
                .HasMaxLength(3000);
                
            entity.Property(e => e.StatoFisico)
                .HasMaxLength(200);
                
            entity.Property(e => e.TEB)
                .HasMaxLength(100);
                
            entity.Property(e => e.CovPercent)
                .HasMaxLength(100);
                
            entity.Property(e => e.Densita)
                .HasMaxLength(100);
                
            entity.Property(e => e.SdsUrl)
                .HasMaxLength(500);
        });
    }
}