using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace projetStage.Server.Migrations
{
    /// <inheritdoc />
    public partial class update1 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "NumElect",
                table: "Resultats",
                newName: "NumElecteurs");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "NumElecteurs",
                table: "Resultats",
                newName: "NumElect");
        }
    }
}
