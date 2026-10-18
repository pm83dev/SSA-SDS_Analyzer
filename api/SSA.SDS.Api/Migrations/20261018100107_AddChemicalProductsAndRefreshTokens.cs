using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SSA.SDS.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddChemicalProductsAndRefreshTokens : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "refresh_token",
                table: "users",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "refresh_token_expires",
                table: "users",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "days_remaining",
                table: "safety_cards",
                type: "int",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "chemical_products",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    client_id = table.Column<int>(type: "int", nullable: false),
                    product_name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    producer = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    h_phrases = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    pictogram = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    composition_cas_above = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    composition_cas_below = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    composition = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    has_diisocyanates = table.Column<bool>(type: "bit", nullable: true),
                    physical_state = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    boiling_point = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    voc_percent = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    density = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    sds_url = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    sds_date = table.Column<DateTime>(type: "datetime2", nullable: true),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    updated_at = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_chemical_products", x => x.Id);
                    table.ForeignKey(
                        name: "FK_chemical_products_clients_client_id",
                        column: x => x.client_id,
                        principalTable: "clients",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_chemical_products_client_id",
                table: "chemical_products",
                column: "client_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "chemical_products");

            migrationBuilder.DropColumn(
                name: "refresh_token",
                table: "users");

            migrationBuilder.DropColumn(
                name: "refresh_token_expires",
                table: "users");

            migrationBuilder.DropColumn(
                name: "days_remaining",
                table: "safety_cards");
        }
    }
}
