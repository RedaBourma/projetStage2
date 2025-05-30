using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using projetStage.Server.Models;
using System.Security.Claims;

namespace projetStage.Server.Controllers
{

    [ApiController] 
    [Route("api/[controller]")]
    [Authorize]
    public class DashboardController : ControllerBase
    {
        private readonly AppDbContext context;

        public DashboardController(AppDbContext context)
        {
            this.context = context;
        }

        [HttpPost("initializeentry")]
        public async Task<IActionResult> InitializeEntry([FromBody] DashboardDto de)
        {

            var userIdClaim = HttpContext.User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int currentUserId))
            {
                return Unauthorized("User ID not found in token for entry initialization.");
            }

            // Load required navigation properties
            var user = await context.Users.FindAsync(currentUserId);
            var prefecture = await context.Prefectures.FindAsync(de.PrefectureId);
            var circonscription = await context.Circonscriptions.FindAsync(de.CirconscriptionId);

            if (user == null || prefecture == null || circonscription == null)
            {
                Console.WriteLine("here");
                return BadRequest("Invalid User, Prefecture, or Circonscription ID");
            }

            string newEntryGuid = Guid.NewGuid().ToString();

            var newEntry = new DashboardEntry
            {
                entryId = newEntryGuid,
                UserId = currentUserId,
                PrefectureId = de.PrefectureId,
                Prefecture = prefecture,
                CirconscriptionId = de.CirconscriptionId,
                Circonscription = circonscription,
                NombreSieges = de.NombreSieges,
                NombreBureaux = de.NombreBureaux,
                NombreListes = de.NombreListes,
                createdAt = DateTime.UtcNow
            };

            context.DashboardEntries.Add(newEntry);
            await context.SaveChangesAsync();

            Console.WriteLine($"\n\nNew Dashboard Entry Created - GUID: {newEntry.entryId}, DB ID: {newEntry.Id}, User ID: {newEntry.UserId}");

            return Ok(new { id = newEntry.entryId });
        }


        [HttpGet("entries")]
        public async Task<IActionResult> GetDashboardEntriesForCurrentUser()
        {

            var userIdClaim = HttpContext.User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null|| !int.TryParse(userIdClaim.Value, out int currentUserId))
            {
                return Unauthorized("User Id not found in token.");
            }

            var dashboardentries = await context.DashboardEntries
                .Where(de => de.UserId == currentUserId)
                .Include(de => de.Prefecture)
                .Include(de => de.Circonscription)
                .OrderByDescending(de => de.createdAt)
                .ToListAsync();

            if (dashboardentries == null || !dashboardentries.Any())
            {
                return NotFound("No dashboard entries found for the current user.");
            }

            var dashboardDtos = dashboardentries.Select(de => new DashboardDto
            {
                Id = de.Id,
                EntryId = de.entryId,
                PrefectureId = de.PrefectureId,
                PrefectureName = de.Prefecture.Name,
                CirconscriptionId = de.CirconscriptionId,
                CirconscriptionName = de.Circonscription.Name,
                NombreSieges = de.NombreSieges,
                NombreBureaux = de.NombreBureaux,
                NombreListes = de.NombreListes,
                CreatedAt = de.createdAt,
                UpdatedAt = de.UpdatedAt
            }).ToList();

            return Ok(dashboardDtos);
        }

        [HttpPut("updateentry/{entryId}")]
        public async Task<IActionResult> UpdateDashboardEntry(string entryId, [FromBody] DashboardDto updatedEntry)
        {
            var userIdClaim = HttpContext.User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int currentUserId))
            {
                return Unauthorized("User ID not found in token for entry update.");
            }
            var existingEntry = await context.DashboardEntries
                .Include(de => de.Prefecture)
                .Include(de => de.Circonscription)
                .FirstOrDefaultAsync(de => de.entryId == entryId && de.UserId == currentUserId);
            if (existingEntry == null)
            {
                return NotFound("Dashboard entry not found or does not belong to the current user.");
            }
            existingEntry.PrefectureId = updatedEntry.PrefectureId;
            existingEntry.CirconscriptionId = updatedEntry.CirconscriptionId;
            existingEntry.NombreSieges = updatedEntry.NombreSieges;
            existingEntry.NombreBureaux = updatedEntry.NombreBureaux;
            existingEntry.NombreListes = updatedEntry.NombreListes;
            existingEntry.UpdatedAt = DateTime.UtcNow;
            context.DashboardEntries.Update(existingEntry);
            await context.SaveChangesAsync();
            return Ok(new { id = existingEntry.entryId });
        }

        [HttpGet("getentry/{entryId}")]
        public async Task<IActionResult> GetEntryInfo(string entryId)
        {
            var userIdClaim = HttpContext.User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int currentUserId))
            {
                return Unauthorized("User ID not found in token for entry retrieval.");
            }
            var entry = await context.DashboardEntries
                .Include(de => de.Prefecture)
                .Include(de => de.Circonscription)
                .FirstOrDefaultAsync(de => de.entryId == entryId && de.UserId == currentUserId);
            if (entry == null)
            {
                return NotFound("Dashboard entry not found or does not belong to the current user.");
            }
            var dashboardDto = new DashboardDto
            {
                Id = entry.Id,
                EntryId = entry.entryId,
                PrefectureId = entry.PrefectureId,
                PrefectureName = entry.Prefecture.Name,
                CirconscriptionId = entry.CirconscriptionId,
                CirconscriptionName = entry.Circonscription.Name,
                NombreSieges = entry.NombreSieges,
                NombreBureaux = entry.NombreBureaux,
                NombreListes = entry.NombreListes,
                CreatedAt = entry.createdAt,
                UpdatedAt = entry.UpdatedAt
            };
            return Ok(dashboardDto);
        }

    }
    
    public class DashboardDto
    {
        public int? Id { get; set; }
        public string? EntryId { get; set; }
        public int PrefectureId { get; set; }
        public string? PrefectureName { get; set; }
        public int CirconscriptionId { get; set; }
        public string? CirconscriptionName { get; set; }
        public int NombreSieges { get; set; }
        public int NombreBureaux { get; set; }
        public int NombreListes { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
