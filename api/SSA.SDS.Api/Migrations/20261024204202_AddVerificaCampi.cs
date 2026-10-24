using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SSA.SDS.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddVerificaCampi : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "campi_da_verificare",
                table: "safety_cards",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "note_verifica",
                table: "safety_cards",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "campi_da_verificare",
                table: "safety_cards");

            migrationBuilder.DropColumn(
                name: "note_verifica",
                table: "safety_cards");
        }
    }
}
