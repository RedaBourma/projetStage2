using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace projetStage.Server.Migrations
{
    /// <inheritdoc />
    public partial class AddBureauAndPartiRelationshipsToListes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Bureaux",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(255)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Bureaux", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Partis",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(255)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Partis", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Listes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    NumBureau = table.Column<int>(type: "int", nullable: false),
                    BureauxId = table.Column<int>(type: "int", nullable: true),
                    PartiId = table.Column<int>(type: "int", nullable: false),
                    PartisId = table.Column<int>(type: "int", nullable: true),
                    PnAgentListe = table.Column<string>(type: "nvarchar(255)", nullable: true),
                    NumListe = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Listes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Listes_Bureaux_BureauxId",
                        column: x => x.BureauxId,
                        principalTable: "Bureaux",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Listes_Partis_PartisId",
                        column: x => x.PartisId,
                        principalTable: "Partis",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_Listes_BureauxId",
                table: "Listes",
                column: "BureauxId");

            migrationBuilder.CreateIndex(
                name: "IX_Listes_PartisId",
                table: "Listes",
                column: "PartisId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Listes");

            migrationBuilder.DropTable(
                name: "Bureaux");

            migrationBuilder.DropTable(
                name: "Partis");
        }
    }
}
