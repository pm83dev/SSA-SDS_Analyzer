using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SSA.LlmService.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "SafetyDataSheets",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Titolo = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Produttore = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    FrasiH = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    Pittogramma = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    ComposizioneCasSopra01 = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    ComposizioneCasSotto01 = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    Composizione = table.Column<string>(type: "nvarchar(3000)", maxLength: 3000, nullable: false),
                    StatoFisico = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    TEB = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    CovPercent = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Densita = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    SdsUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    DataSds = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CasNumbers = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ChemicalName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ProductIdentifier = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SignalWord = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    EmergencyOverview = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FirstAidMeasures = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FireFightingMeasures = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AccidentalReleaseMeasures = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    HandlingAndStorage = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ExposureControls = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PhysicalChemicalProperties = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    StabilityReactivity = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ToxicologicalInformation = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    EcologicalInformation = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DisposalConsiderations = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TransportInformation = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    RegulatoryInformation = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    OtherInformation = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SafetyDataSheets", x => x.Id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "SafetyDataSheets");
        }
    }
}
