using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace projetStage.Server.Migrations
{
    /// <inheritdoc />
    public partial class AddDashboardEntryLinkToBureaux : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "DashboardEntryId",
                table: "Bureaux",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_Bureaux_DashboardEntryId",
                table: "Bureaux",
                column: "DashboardEntryId");

            migrationBuilder.AddForeignKey(
                name: "FK_Bureaux_DashboardEntries_DashboardEntryId",
                table: "Bureaux",
                column: "DashboardEntryId",
                principalTable: "DashboardEntries",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Bureaux_DashboardEntries_DashboardEntryId",
                table: "Bureaux");

            migrationBuilder.DropIndex(
                name: "IX_Bureaux_DashboardEntryId",
                table: "Bureaux");

            migrationBuilder.DropColumn(
                name: "DashboardEntryId",
                table: "Bureaux");
        }
    }
}
