using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace projetStage.Server.Migrations
{
    /// <inheritdoc />
    public partial class init2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "numVotesExprimes",
                table: "Resultats",
                newName: "NumVotesExprimes");

            migrationBuilder.RenameColumn(
                name: "numBullVoteNuls",
                table: "Resultats",
                newName: "NumBullVoteNuls");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "NumVotesExprimes",
                table: "Resultats",
                newName: "numVotesExprimes");

            migrationBuilder.RenameColumn(
                name: "NumBullVoteNuls",
                table: "Resultats",
                newName: "numBullVoteNuls");
        }
    }
}
