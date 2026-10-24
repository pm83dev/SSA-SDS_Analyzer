using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SSA.SDS.Api.Migrations
{
    /// <inheritdoc />
    public partial class MergeChemicalProductsIntoSafetyCards : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "composizione",
                table: "safety_cards",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "composizione_cas_sopra",
                table: "safety_cards",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "composizione_cas_sotto",
                table: "safety_cards",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "contiene_diisocianati",
                table: "safety_cards",
                type: "bit",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "cov_percent",
                table: "safety_cards",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "densita",
                table: "safety_cards",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "frasi_h",
                table: "safety_cards",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "pittogrammi",
                table: "safety_cards",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "sds_url",
                table: "safety_cards",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "stato_fisico",
                table: "safety_cards",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "temperatura_ebollizione",
                table: "safety_cards",
                type: "nvarchar(max)",
                nullable: true);

            // 1. Ogni prodotto chimico diventa una scheda di sicurezza (SDS) dello stesso cliente
            migrationBuilder.Sql(@"
INSERT INTO safety_cards
    (client_id, tipologia, titolo, ente_emittitore, data_rilascio, stato,
     frasi_h, pittogrammi, composizione_cas_sopra, composizione_cas_sotto, composizione,
     contiene_diisocianati, stato_fisico, temperatura_ebollizione, cov_percent, densita, sds_url,
     llm_analyzed, created_at, updated_at)
SELECT client_id, 'SDS', product_name, producer, sds_date, 'NotExpired',
       h_phrases, pictogram, composition_cas_above, composition_cas_below, composition,
       has_diisocyanates, physical_state, boiling_point, voc_percent, density, sds_url,
       0, created_at, updated_at
FROM chemical_products;");

            // 2. Le schede già analizzate dall'LLM avevano i dati chimici solo nelle osservazioni:
            //    li ricava dalla risposta LLM salvata e libera le osservazioni generate automaticamente
            migrationBuilder.Sql(@"
UPDATE safety_cards SET
    frasi_h                 = NULLIF(JSON_VALUE(llm_raw_response, '$.frasi_h'), ''),
    pittogrammi             = NULLIF(JSON_VALUE(llm_raw_response, '$.pittogramma'), ''),
    composizione_cas_sopra  = NULLIF(JSON_VALUE(llm_raw_response, '$.composizione_cas_sopra_01'), ''),
    composizione_cas_sotto  = NULLIF(JSON_VALUE(llm_raw_response, '$.composizione_cas_sotto_01'), ''),
    composizione            = NULLIF(JSON_VALUE(llm_raw_response, '$.composizione'), ''),
    stato_fisico            = NULLIF(JSON_VALUE(llm_raw_response, '$.stato_fisico'), ''),
    temperatura_ebollizione = NULLIF(JSON_VALUE(llm_raw_response, '$.teb'), ''),
    cov_percent             = NULLIF(JSON_VALUE(llm_raw_response, '$.cov_percent'), ''),
    densita                 = NULLIF(JSON_VALUE(llm_raw_response, '$.densita'), ''),
    sds_url                 = NULLIF(JSON_VALUE(llm_raw_response, '$.sds_url'), ''),
    contiene_diisocianati   = CASE WHEN osservazioni LIKE '%Contiene diisocianati%' THEN 1 END,
    osservazioni            = NULL
WHERE llm_analyzed = 1 AND llm_raw_response IS NOT NULL AND ISJSON(llm_raw_response) = 1;");

            migrationBuilder.DropTable(
                name: "chemical_products");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "composizione",
                table: "safety_cards");

            migrationBuilder.DropColumn(
                name: "composizione_cas_sopra",
                table: "safety_cards");

            migrationBuilder.DropColumn(
                name: "composizione_cas_sotto",
                table: "safety_cards");

            migrationBuilder.DropColumn(
                name: "contiene_diisocianati",
                table: "safety_cards");

            migrationBuilder.DropColumn(
                name: "cov_percent",
                table: "safety_cards");

            migrationBuilder.DropColumn(
                name: "densita",
                table: "safety_cards");

            migrationBuilder.DropColumn(
                name: "frasi_h",
                table: "safety_cards");

            migrationBuilder.DropColumn(
                name: "pittogrammi",
                table: "safety_cards");

            migrationBuilder.DropColumn(
                name: "sds_url",
                table: "safety_cards");

            migrationBuilder.DropColumn(
                name: "stato_fisico",
                table: "safety_cards");

            migrationBuilder.DropColumn(
                name: "temperatura_ebollizione",
                table: "safety_cards");

            migrationBuilder.CreateTable(
                name: "chemical_products",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    client_id = table.Column<int>(type: "int", nullable: false),
                    boiling_point = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    composition = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    composition_cas_above = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    composition_cas_below = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    density = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    h_phrases = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    has_diisocyanates = table.Column<bool>(type: "bit", nullable: true),
                    physical_state = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    pictogram = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    producer = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    product_name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    sds_date = table.Column<DateTime>(type: "datetime2", nullable: true),
                    sds_url = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    updated_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    voc_percent = table.Column<string>(type: "nvarchar(max)", nullable: true)
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
    }
}
