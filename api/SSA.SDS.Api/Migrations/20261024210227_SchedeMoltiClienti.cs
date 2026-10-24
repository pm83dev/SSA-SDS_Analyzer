using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SSA.SDS.Api.Migrations
{
    /// <inheritdoc />
    public partial class SchedeMoltiClienti : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_notifications_clients_client_id",
                table: "notifications");

            migrationBuilder.DropForeignKey(
                name: "FK_notifications_safety_cards_card_id",
                table: "notifications");

            migrationBuilder.DropForeignKey(
                name: "FK_safety_cards_clients_client_id",
                table: "safety_cards");

            migrationBuilder.AddColumn<string>(
                name: "pdf_hash",
                table: "safety_cards",
                type: "nvarchar(64)",
                maxLength: 64,
                nullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "client_id",
                table: "notifications",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.CreateTable(
                name: "client_safety_cards",
                columns: table => new
                {
                    client_id = table.Column<int>(type: "int", nullable: false),
                    safety_card_id = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_client_safety_cards", x => new { x.client_id, x.safety_card_id });
                    table.ForeignKey(
                        name: "FK_client_safety_cards_clients_client_id",
                        column: x => x.client_id,
                        principalTable: "clients",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_client_safety_cards_safety_cards_safety_card_id",
                        column: x => x.safety_card_id,
                        principalTable: "safety_cards",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_safety_cards_pdf_hash",
                table: "safety_cards",
                column: "pdf_hash");

            migrationBuilder.CreateIndex(
                name: "IX_client_safety_cards_safety_card_id",
                table: "client_safety_cards",
                column: "safety_card_id");

            // Ogni scheda mantiene il cliente a cui era collegata: il collegamento passa nella tabella ponte
            migrationBuilder.Sql(@"
INSERT INTO client_safety_cards (client_id, safety_card_id)
SELECT client_id, Id FROM safety_cards;");

            // Solo dopo aver copiato i collegamenti si toglie la colonna client_id dalle schede
            migrationBuilder.DropIndex(
                name: "IX_safety_cards_client_id",
                table: "safety_cards");

            migrationBuilder.DropColumn(
                name: "client_id",
                table: "safety_cards");

            migrationBuilder.AddForeignKey(
                name: "FK_notifications_clients_client_id",
                table: "notifications",
                column: "client_id",
                principalTable: "clients",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_notifications_safety_cards_card_id",
                table: "notifications",
                column: "card_id",
                principalTable: "safety_cards",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_notifications_clients_client_id",
                table: "notifications");

            migrationBuilder.DropForeignKey(
                name: "FK_notifications_safety_cards_card_id",
                table: "notifications");

            migrationBuilder.DropTable(
                name: "client_safety_cards");

            migrationBuilder.DropIndex(
                name: "IX_safety_cards_pdf_hash",
                table: "safety_cards");

            migrationBuilder.DropColumn(
                name: "pdf_hash",
                table: "safety_cards");

            migrationBuilder.AddColumn<int>(
                name: "client_id",
                table: "safety_cards",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AlterColumn<int>(
                name: "client_id",
                table: "notifications",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_safety_cards_client_id",
                table: "safety_cards",
                column: "client_id");

            migrationBuilder.AddForeignKey(
                name: "FK_notifications_clients_client_id",
                table: "notifications",
                column: "client_id",
                principalTable: "clients",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_notifications_safety_cards_card_id",
                table: "notifications",
                column: "card_id",
                principalTable: "safety_cards",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_safety_cards_clients_client_id",
                table: "safety_cards",
                column: "client_id",
                principalTable: "clients",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
