using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SSA.SDS.Api.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "clients",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ragione_sociale = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    codice_fiscale = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    indirizzo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    citta = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    provincia = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    cap = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    telefono = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    email = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    contatto = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    note = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    updated_at = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_clients", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "users",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    username = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    password_hash = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    email = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    role = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    is_active = table.Column<bool>(type: "bit", nullable: false),
                    last_login = table.Column<DateTime>(type: "datetime2", nullable: true),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    updated_at = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_users", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "import_histories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    file_name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    file_type = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    client_id = table.Column<int>(type: "int", nullable: true),
                    records_imported = table.Column<int>(type: "int", nullable: false),
                    status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    error_message = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_import_histories", x => x.Id);
                    table.ForeignKey(
                        name: "FK_import_histories_clients_client_id",
                        column: x => x.client_id,
                        principalTable: "clients",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "safety_cards",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    client_id = table.Column<int>(type: "int", nullable: false),
                    tipologia = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    titolo = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    numero_protocollo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ente_emittitore = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    data_rilascio = table.Column<DateTime>(type: "datetime2", nullable: true),
                    data_scadenza = table.Column<DateTime>(type: "datetime2", nullable: true),
                    validita_mesi = table.Column<int>(type: "int", nullable: true),
                    stato = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    frequenza_controllo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    osservazioni = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    pdf_url = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    llm_analyzed = table.Column<bool>(type: "bit", nullable: false),
                    llm_raw_response = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    updated_at = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_safety_cards", x => x.Id);
                    table.ForeignKey(
                        name: "FK_safety_cards_clients_client_id",
                        column: x => x.client_id,
                        principalTable: "clients",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "notifications",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    client_id = table.Column<int>(type: "int", nullable: false),
                    card_id = table.Column<int>(type: "int", nullable: true),
                    type = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    message = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    is_read = table.Column<bool>(type: "bit", nullable: false),
                    sent_date = table.Column<DateTime>(type: "datetime2", nullable: true),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_notifications", x => x.Id);
                    table.ForeignKey(
                        name: "FK_notifications_clients_client_id",
                        column: x => x.client_id,
                        principalTable: "clients",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_notifications_safety_cards_card_id",
                        column: x => x.card_id,
                        principalTable: "safety_cards",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_clients_codice_fiscale",
                table: "clients",
                column: "codice_fiscale",
                unique: true,
                filter: "[codice_fiscale] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_import_histories_client_id",
                table: "import_histories",
                column: "client_id");

            migrationBuilder.CreateIndex(
                name: "IX_notifications_card_id",
                table: "notifications",
                column: "card_id");

            migrationBuilder.CreateIndex(
                name: "IX_notifications_client_id",
                table: "notifications",
                column: "client_id");

            migrationBuilder.CreateIndex(
                name: "IX_notifications_is_read",
                table: "notifications",
                column: "is_read");

            migrationBuilder.CreateIndex(
                name: "IX_safety_cards_client_id",
                table: "safety_cards",
                column: "client_id");

            migrationBuilder.CreateIndex(
                name: "IX_safety_cards_data_scadenza",
                table: "safety_cards",
                column: "data_scadenza");

            migrationBuilder.CreateIndex(
                name: "IX_users_username",
                table: "users",
                column: "username",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "import_histories");

            migrationBuilder.DropTable(
                name: "notifications");

            migrationBuilder.DropTable(
                name: "users");

            migrationBuilder.DropTable(
                name: "safety_cards");

            migrationBuilder.DropTable(
                name: "clients");
        }
    }
}
