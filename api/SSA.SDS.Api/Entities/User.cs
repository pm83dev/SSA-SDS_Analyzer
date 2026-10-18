using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SSA.SDS.Api.Entities;

public class User
{
    [Key]
    public int Id { get; set; }

    [Required]
    [Column("username")]
    public string Username { get; set; } = string.Empty;

    [Required]
    [Column("password_hash")]
    public string PasswordHash { get; set; } = string.Empty;

    [Column("email")]
    public string? Email { get; set; }

    [Required]
    [Column("role")]
    public string Role { get; set; } = "Operator";

    [Column("is_active")]
    public bool IsActive { get; set; } = true;

    [Column("last_login")]
    public DateTime? LastLogin { get; set; }

    [Column("refresh_token")]
    public string? RefreshToken { get; set; }

    [Column("refresh_token_expires")]
    public DateTime? RefreshTokenExpires { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
