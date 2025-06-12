using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace projetStage.Server.Migrations
{
    /// <inheritdoc />
    public partial class AddNumVotesToListesTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "numVotes",
                table: "Listes",
                type: "int",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "numVotes",
                table: "Listes");
        }
    }
}
