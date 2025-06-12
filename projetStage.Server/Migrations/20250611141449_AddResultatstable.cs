using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace projetStage.Server.Migrations
{
    /// <inheritdoc />
    public partial class AddResultatstable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Resultats",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    numInscrits = table.Column<int>(type: "int", nullable: false),
                    numElecteurs = table.Column<int>(type: "int", nullable: false),
                    numBulletsNuls = table.Column<int>(type: "int", nullable: false),
                    numVotesExprimes = table.Column<int>(type: "int", nullable: false),
                    BureauId = table.Column<int>(type: "int", nullable: true),
                    bureauxId = table.Column<int>(type: "int", nullable: true),
                    ListeId = table.Column<int>(type: "int", nullable: true),
                    listesId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Resultats", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Resultats_Bureaux_bureauxId",
                        column: x => x.bureauxId,
                        principalTable: "Bureaux",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Resultats_Listes_listesId",
                        column: x => x.listesId,
                        principalTable: "Listes",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_Resultats_bureauxId",
                table: "Resultats",
                column: "bureauxId");

            migrationBuilder.CreateIndex(
                name: "IX_Resultats_listesId",
                table: "Resultats",
                column: "listesId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Resultats");
        }
    }
}
