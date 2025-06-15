using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace projetStage.Server.Migrations
{
    /// <inheritdoc />
    public partial class init : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
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
                name: "Prefectures",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(255)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Prefectures", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(255)", nullable: false),
                    Email = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Password = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Role = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Circonscriptions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(255)", nullable: false),
                    PrefectureId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Circonscriptions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Circonscriptions_Prefectures_PrefectureId",
                        column: x => x.PrefectureId,
                        principalTable: "Prefectures",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "DashboardEntries",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    entryId = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    PrefectureId = table.Column<int>(type: "int", nullable: false),
                    CirconscriptionId = table.Column<int>(type: "int", nullable: false),
                    NombreSieges = table.Column<int>(type: "int", nullable: false),
                    NombreBureaux = table.Column<int>(type: "int", nullable: false),
                    NombreListes = table.Column<int>(type: "int", nullable: false),
                    createdAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DashboardEntries", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DashboardEntries_Circonscriptions_CirconscriptionId",
                        column: x => x.CirconscriptionId,
                        principalTable: "Circonscriptions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_DashboardEntries_Prefectures_PrefectureId",
                        column: x => x.PrefectureId,
                        principalTable: "Prefectures",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_DashboardEntries_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Bureaux",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(255)", nullable: false),
                    DashboardEntryId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Bureaux", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Bureaux_DashboardEntries_DashboardEntryId",
                        column: x => x.DashboardEntryId,
                        principalTable: "DashboardEntries",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Listes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    BureauId = table.Column<int>(type: "int", nullable: false),
                    PartiId = table.Column<int>(type: "int", nullable: false),
                    PnAgentListe = table.Column<string>(type: "nvarchar(255)", nullable: true),
                    NumListe = table.Column<int>(type: "int", nullable: false),
                    numVotes = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Listes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Listes_Bureaux_BureauId",
                        column: x => x.BureauId,
                        principalTable: "Bureaux",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Listes_Partis_PartiId",
                        column: x => x.PartiId,
                        principalTable: "Partis",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Resultats",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    BureauxId = table.Column<int>(type: "int", nullable: false),
                    ListeId = table.Column<int>(type: "int", nullable: false),
                    NumInscrits = table.Column<int>(type: "int", nullable: false),
                    NumElect = table.Column<int>(type: "int", nullable: false),
                    numBullVoteNuls = table.Column<int>(type: "int", nullable: false),
                    numVotesExprimes = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Resultats", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Resultats_Bureaux_BureauxId",
                        column: x => x.BureauxId,
                        principalTable: "Bureaux",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Resultats_Listes_ListeId",
                        column: x => x.ListeId,
                        principalTable: "Listes",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_Bureaux_DashboardEntryId",
                table: "Bureaux",
                column: "DashboardEntryId");

            migrationBuilder.CreateIndex(
                name: "IX_Circonscriptions_PrefectureId",
                table: "Circonscriptions",
                column: "PrefectureId");

            migrationBuilder.CreateIndex(
                name: "IX_DashboardEntries_CirconscriptionId",
                table: "DashboardEntries",
                column: "CirconscriptionId");

            migrationBuilder.CreateIndex(
                name: "IX_DashboardEntries_PrefectureId",
                table: "DashboardEntries",
                column: "PrefectureId");

            migrationBuilder.CreateIndex(
                name: "IX_DashboardEntries_UserId",
                table: "DashboardEntries",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Listes_BureauId",
                table: "Listes",
                column: "BureauId");

            migrationBuilder.CreateIndex(
                name: "IX_Listes_PartiId",
                table: "Listes",
                column: "PartiId");

            migrationBuilder.CreateIndex(
                name: "IX_Resultats_BureauxId",
                table: "Resultats",
                column: "BureauxId");

            migrationBuilder.CreateIndex(
                name: "IX_Resultats_ListeId",
                table: "Resultats",
                column: "ListeId");

            migrationBuilder.CreateIndex(
                name: "IX_Users_Email",
                table: "Users",
                column: "Email",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Resultats");

            migrationBuilder.DropTable(
                name: "Listes");

            migrationBuilder.DropTable(
                name: "Bureaux");

            migrationBuilder.DropTable(
                name: "Partis");

            migrationBuilder.DropTable(
                name: "DashboardEntries");

            migrationBuilder.DropTable(
                name: "Circonscriptions");

            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.DropTable(
                name: "Prefectures");
        }
    }
}
