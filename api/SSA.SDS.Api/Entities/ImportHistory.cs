using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SSA.SDS.Api.Entities;

public class ImportHistory
{
    [Key]
    public int Id { get; set; }

    [Required]
    [Column("file_name")]
    public string FileName { get; set; } = string.Empty;

    [Required]
    [Column("file_type")]
    public string FileType { get; set; } = string.Empty;

    [Column("client_id")]
    public int? ClientId { get; set; }

    [Column("records_imported")]
    public int RecordsImported { get; set; }

    [Required]
    [Column("status")]
    public string Status { get; set; } = string.Empty;

    [Column("error_message")]
    public string? ErrorMessage { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [ForeignKey("ClientId")]
    public Client? Client { get; set; }
}
