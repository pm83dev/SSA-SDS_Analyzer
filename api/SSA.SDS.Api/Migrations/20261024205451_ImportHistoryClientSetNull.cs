using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SSA.SDS.Api.Migrations
{
    /// <inheritdoc />
    public partial class ImportHistoryClientSetNull : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_import_histories_clients_client_id",
                table: "import_histories");

            migrationBuilder.AddForeignKey(
                name: "FK_import_histories_clients_client_id",
                table: "import_histories",
                column: "client_id",
                principalTable: "clients",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_import_histories_clients_client_id",
                table: "import_histories");

            migrationBuilder.AddForeignKey(
                name: "FK_import_histories_clients_client_id",
                table: "import_histories",
                column: "client_id",
                principalTable: "clients",
                principalColumn: "Id");
        }
    }
}
