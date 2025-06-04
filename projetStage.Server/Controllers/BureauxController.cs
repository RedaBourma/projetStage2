using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using projetStage.Server.Dtos;
using projetStage.Server.Models;
using System.Runtime.InteropServices;
using System.Security.Claims;

namespace projetStage.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class BureauxController : ControllerBase
    {
        private readonly AppDbContext context;

        public BureauxController(AppDbContext context)
        {
            this.context = context;
        }

        //save bureau


        [HttpGet("getBureauById/{entryId}")]
        public async Task<IActionResult> GetBureauById(string entryId)
        {
            var isNew = false;
            var userIdClaim = HttpContext.User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int currentUserId))
            {
                return Unauthorized("User ID not found in token for entry update.");
            }

            var dashboardEntry = await context.DashboardEntries
                .Where(de => de.entryId == entryId && de.UserId == currentUserId)
                .FirstOrDefaultAsync();

            if (dashboardEntry == null)
            {
                return NotFound($"Dashboard entry with Id '{entryId}' not found for the current user.");
            }

            var bureaux = await context.Bureaux
                .Where(b => b.DashboardEntryId == dashboardEntry.Id)
                .Include(b => b.Listes)
                .ThenInclude(l => l.Partis)
                .ToListAsync();

            if(!bureaux.Any())
            {
                isNew = true;
            }

            var bureauDetails = bureaux.Select(b => new BureauDetailsDto
            {
                Id = b.Id,
                Name = b.Name,
                DashboardEntryId = b.DashboardEntryId,
                Listes = b.Listes.Select(l => new ListeDto
                {
                    Id = l.Id,
                    PnAgentListe = l.PnAgentListe,
                    NumListe = l.NumListe,
                    Parti = l.Partis != null ? new PartisDto
                    {
                        Id = l.Partis.Id,
                        Name = l.Partis.Name
                    } : null
                }).ToList()
            }).ToList();
            Console.WriteLine("hereee: " + isNew);
            return Ok(new {bureauDetails, isNew});
        }

        [HttpPost("saveBureauAndLists")]
        public async Task<IActionResult> saveBureauxAndLists([FromBody] List<BureauDetailsDto> bureauData)
        {
            var userIdClaim = HttpContext.User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int currentUserId))
            {
                return Unauthorized("User ID not found in token for entry update.");
            }
            if (bureauData == null || !bureauData.Any())
            {
                return BadRequest("Bureau data is required.");
            }

            var dashboardEntry = await context.DashboardEntries
                .Where(d => bureauData.First().DashboardEntryGUID == d.entryId && d.UserId == currentUserId)
                .FirstOrDefaultAsync();

            if (dashboardEntry == null)
            {
                return NotFound($"Dashboard entry with ID '{dashboardEntry?.entryId}' not found or does not belong to the current user.");
            }

            var createdBureaux = new List<Bureaux>();

            foreach (var bureauDto in bureauData)
            {
                if (bureauDto.Id.HasValue && bureauDto.Id.Value > 0)
                {
                    return BadRequest("Bureau ID should not be provided for new bureaux.");
                }

                var newBureau = new Bureaux
                {
                    Name = bureauDto.Name,
                    DashboardEntryId = dashboardEntry.Id,
                };

                int currentListeNumber = 1;

                foreach (var listeDto in bureauDto.Listes)
                {
                    if (listeDto.Id.HasValue && listeDto.Id.Value > 0)
                    {
                        return BadRequest("Liste ID should not be provided for new listes.");
                    }

                    var parti = await context.Partis
                        .FindAsync(listeDto.Parti?.Id);

                    if (parti == null)
                    {
                        return BadRequest($"Parti with ID '{listeDto.Parti?.Id}' not found.");
                    }

                    newBureau.Listes.Add(new Listes
                    {
                        PnAgentListe = listeDto.PnAgentListe,
                        NumListe = currentListeNumber++,                        
                        Partis = parti
                    });
                }
                context.Bureaux.Add(newBureau);
                createdBureaux.Add(newBureau);
            }

            await context.SaveChangesAsync();
            var savedBureauDetails = createdBureaux.Select(b => new BureauDetailsDto
            {
                Name = b.Name,
                DashboardEntryId = b.DashboardEntryId,
                Listes = b.Listes.Select(l => new ListeDto
                {
                    Id = l.Id,
                    PnAgentListe = l.PnAgentListe,
                    NumListe = l.NumListe,
                    Parti = l.Partis != null ? new PartisDto
                    {
                        Id = l.Partis.Id,
                        Name = l.Partis.Name
                    } : null
                }).ToList()
            }).ToList();

            return CreatedAtAction(nameof(GetBureauById), new { entryId = dashboardEntry.entryId }, savedBureauDetails);
        }
    }

}
