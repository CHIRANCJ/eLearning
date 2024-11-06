﻿using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Kinstonplatform.Migrations
{
    /// <inheritdoc />
    public partial class uppdb : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Rating",
                table: "Enrollments");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Rating",
                table: "Enrollments",
                type: "int",
                nullable: true);
        }
    }
}
