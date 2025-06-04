using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace projetStage.Server.Migrations
{
    /// <inheritdoc />
    public partial class FixListesForeignKeys : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Listes_Bureaux_BureauxId",
                table: "Listes");

            migrationBuilder.DropForeignKey(
                name: "FK_Listes_Partis_PartisId",
                table: "Listes");

            migrationBuilder.DropIndex(
                name: "IX_Listes_BureauxId",
                table: "Listes");

            migrationBuilder.DropIndex(
                name: "IX_Listes_PartisId",
                table: "Listes");

            migrationBuilder.DropColumn(
                name: "BureauxId",
                table: "Listes");

            migrationBuilder.DropColumn(
                name: "PartisId",
                table: "Listes");

            migrationBuilder.RenameColumn(
                name: "NumBureau",
                table: "Listes",
                newName: "BureauId");

            migrationBuilder.CreateIndex(
                name: "IX_Listes_BureauId",
                table: "Listes",
                column: "BureauId");

            migrationBuilder.CreateIndex(
                name: "IX_Listes_PartiId",
                table: "Listes",
                column: "PartiId");

            migrationBuilder.AddForeignKey(
                name: "FK_Listes_Bureaux_BureauId",
                table: "Listes",
                column: "BureauId",
                principalTable: "Bureaux",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Listes_Partis_PartiId",
                table: "Listes",
                column: "PartiId",
                principalTable: "Partis",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Listes_Bureaux_BureauId",
                table: "Listes");

            migrationBuilder.DropForeignKey(
                name: "FK_Listes_Partis_PartiId",
                table: "Listes");

            migrationBuilder.DropIndex(
                name: "IX_Listes_BureauId",
                table: "Listes");

            migrationBuilder.DropIndex(
                name: "IX_Listes_PartiId",
                table: "Listes");

            migrationBuilder.RenameColumn(
                name: "BureauId",
                table: "Listes",
                newName: "NumBureau");

            migrationBuilder.AddColumn<int>(
                name: "BureauxId",
                table: "Listes",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "PartisId",
                table: "Listes",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Listes_BureauxId",
                table: "Listes",
                column: "BureauxId");

            migrationBuilder.CreateIndex(
                name: "IX_Listes_PartisId",
                table: "Listes",
                column: "PartisId");

            migrationBuilder.AddForeignKey(
                name: "FK_Listes_Bureaux_BureauxId",
                table: "Listes",
                column: "BureauxId",
                principalTable: "Bureaux",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Listes_Partis_PartisId",
                table: "Listes",
                column: "PartisId",
                principalTable: "Partis",
                principalColumn: "Id");
        }
    }
}
