using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SSA.SDS.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddNomeFileImportato : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "nome_file_importato",
                table: "safety_cards",
                type: "nvarchar(max)",
                nullable: true);

            // Schede già importate da PDF: il nome originale è nel percorso salvato
            // (pdf/{cliente}/{id}_{timestamp}_{nome file}.pdf)
            migrationBuilder.Sql(@"
UPDATE safety_cards
SET nome_file_importato = SUBSTRING(seg, CHARINDEX('_', seg, CHARINDEX('_', seg) + 1) + 1, 4000)
FROM (SELECT Id AS card_id, RIGHT(pdf_url, CHARINDEX('/', REVERSE(pdf_url)) - 1) AS seg
      FROM safety_cards
      WHERE llm_analyzed = 1 AND pdf_url LIKE '%/%') AS p
WHERE safety_cards.Id = p.card_id AND CHARINDEX('_', p.seg) > 0;");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "nome_file_importato",
                table: "safety_cards");
        }
    }
}
