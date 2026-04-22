using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Loyalty.Migrations
{
    /// <inheritdoc />
    public partial class SupportConversationThreads : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AdminReply",
                table: "SupportRequests");

            migrationBuilder.DropColumn(
                name: "RepliedAt",
                table: "SupportRequests");

            migrationBuilder.RenameColumn(
                name: "Message",
                table: "SupportRequests",
                newName: "Status");

            migrationBuilder.RenameColumn(
                name: "IsRead",
                table: "SupportRequests",
                newName: "IsReadByCustomer");

            migrationBuilder.AddColumn<bool>(
                name: "IsReadByAdmin",
                table: "SupportRequests",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "LastUpdatedAt",
                table: "SupportRequests",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.CreateTable(
                name: "SupportMessages",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SupportRequestId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SenderType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Content = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SupportMessages", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SupportMessages_SupportRequests_SupportRequestId",
                        column: x => x.SupportRequestId,
                        principalTable: "SupportRequests",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_SupportMessages_SupportRequestId",
                table: "SupportMessages",
                column: "SupportRequestId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "SupportMessages");

            migrationBuilder.DropColumn(
                name: "IsReadByAdmin",
                table: "SupportRequests");

            migrationBuilder.DropColumn(
                name: "LastUpdatedAt",
                table: "SupportRequests");

            migrationBuilder.RenameColumn(
                name: "Status",
                table: "SupportRequests",
                newName: "Message");

            migrationBuilder.RenameColumn(
                name: "IsReadByCustomer",
                table: "SupportRequests",
                newName: "IsRead");

            migrationBuilder.AddColumn<string>(
                name: "AdminReply",
                table: "SupportRequests",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "RepliedAt",
                table: "SupportRequests",
                type: "datetime2",
                nullable: true);
        }
    }
}
