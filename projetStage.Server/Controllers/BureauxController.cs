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


        //[HttpGet("getAllBureauxEntry/{entryId}")]
        //public async Task<IActionResult> getAllBureauxentry(string entryId)
        //{
        //    var userIdClaim = HttpContext.User.FindFirst(ClaimTypes.NameIdentifier);
        //    if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int currentUserId))
        //    {
        //        return Unauthorized("User ID not found in token for entry update.");
        //    }
        //    var dashboardEntry = await context.DashboardEntries
        //        .Where(de => de.entryId == entryId && de.UserId == currentUserId)
        //        .FirstOrDefaultAsync();
        //    if (dashboardEntry == null)
        //    {
        //        return NotFound($"Dashboard entry with Id '{entryId}' not found for the current user.");
        //    }
        //    var bureaux = await context.Bureaux
        //        .Where(b => b.DashboardEntryId == dashboardEntry.Id)
        //        .Include(b => b.Listes)
        //        .ThenInclude(l => l.Partis)
        //        .ToListAsync();
        //    var bureauDetails = bureaux.Select(b => new BureauDetailsDto
        //    {
        //        Id = b.Id,
        //        Name = b.Name,
        //        DashboardEntryId = b.DashboardEntryId,
        //        Listes = b.Listes.Select(l => new ListeDto
        //        {
        //            Id = l.Id,
        //            PnAgentListe = l.PnAgentListe,
        //            NumListe = l.NumListe,
        //            Parti = l.Partis != null ? new PartisDto
        //            {
        //                Id = l.Partis.Id,
        //                Name = l.Partis.Name
        //            } : null
        //        }).ToList()
        //    }).ToList();
        //    return Ok(bureauDetails);
        //}

        [HttpGet("getAllBureauxEntry/{entryId}")]
        public async Task<IActionResult> getAllBureauxentry(string entryId)
        {
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
                }).ToList(),
                NombreSieges = dashboardEntry.NombreSieges
            }).ToList();
            return Ok(bureauDetails);
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

                //int currentListeNumber = 1;

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
                        NumListe = listeDto.NumListe,                        
                        Partis = parti
                    });
                }
                //currentListeNumber++;
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

        [HttpPut("updateBureauAndLists/{entryId}")]
        public async Task<IActionResult> UpdateBureauAndLists(string entryId, [FromBody] List<BureauDetailsDto> bureauxData) 
        {
            var userIdClaim = HttpContext.User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int currentUserId))
            {
                return Unauthorized("User ID not found in token.");
            }

            if (bureauxData == null)
            {
                return BadRequest("No bureaux data provided for update.");
            }

            // Find the DashboardEntry by its string GUID and the current user's ID
            var dashboardEntry = await context.DashboardEntries
                .Where(de => de.entryId == entryId && de.UserId == currentUserId)
                .Select(de => new { de.Id, de.entryId }) // Select only necessary fields to optimize
                .FirstOrDefaultAsync();

            if (dashboardEntry == null)
            {
                return NotFound($"Dashboard entry with ID '{entryId}' not found or does not belong to the current user.");
            }

            // Fetch existing bureaux and their lists for this dashboard entry
            // Include Listes and their Partis for complete graph traversal and updates.
            var existingBureaux = await context.Bureaux
                .Where(b => b.DashboardEntryId == dashboardEntry.Id)
                .Include(b => b.Listes)
                    .ThenInclude(l => l.Partis) // Eager load Partis for mapping
                .ToListAsync();

            // --- Strategy for updates: ---
            // 1. Identify bureaux to delete (exist in DB but not in incoming data)
            var bureauxToDelete = existingBureaux
                .Where(eb => !bureauxData.Any(bd => bd.Id == eb.Id))
                .ToList();

            foreach (var bureau in bureauxToDelete)
            {
                context.Listes.RemoveRange(bureau.Listes); // Delete associated lists first
                context.Bureaux.Remove(bureau);
            }

            // 2. Iterate through incoming bureaux (desired state from frontend)
            foreach (var bureauDto in bureauxData)
            {
                var existingBureau = existingBureaux.FirstOrDefault(eb => eb.Id == bureauDto.Id);

                if (existingBureau == null)
                {
                    // This is a new bureau to add (frontend sent it without an existing ID or with 0)
                    // Ensure that the Id is actually meant to be new (e.g., Id is null or 0)
                    if (bureauDto.Id.HasValue && bureauDto.Id.Value > 0)
                    {
                        // This scenario should ideally not happen if frontend logic is perfect,
                        // but it catches cases where a new item mistakenly gets an ID.
                        return BadRequest($"Cannot add bureau with existing ID '{bureauDto.Id}'.");
                    }

                    var newBureau = new Bureaux
                    {
                        Name = bureauDto.Name,
                        DashboardEntryId = dashboardEntry.Id,
                    };

                    foreach (var listeDto in bureauDto.Listes)
                    {
                        if (listeDto.Id.HasValue && listeDto.Id.Value > 0)
                        {
                            return BadRequest($"Cannot add list with existing ID '{listeDto.Id}' to a new bureau.");
                        }

                        var parti = await context.Partis.FindAsync(listeDto.PartiId);
                        if (parti == null) return BadRequest($"Parti with ID {listeDto.PartiId} not found for new list.");

                        newBureau.Listes.Add(new Listes
                        {
                            PnAgentListe = listeDto.PnAgentListe,
                            NumListe = listeDto.NumListe,
                            PartiId = listeDto.PartiId,
                            Partis = parti
                        });
                    }
                    context.Bureaux.Add(newBureau);
                }
                else
                {
                    // This is an existing bureau to update
                    existingBureau.Name = bureauDto.Name;
                    // Note: DashboardEntryId should not change during an update of Bureaux

                    // --- Update associated Lists for this bureau ---
                    // Create a mutable copy of existing lists
                    var existingListsForBureau = existingBureau.Listes.ToList();

                    // Identify lists to delete (exist in DB but not in incoming data)
                    var listsToDelete = existingListsForBureau
                        .Where(el => !bureauDto.Listes.Any(ld => ld.Id == el.Id))
                        .ToList();
                    context.Listes.RemoveRange(listsToDelete);

                    // Iterate through incoming lists (desired state for this bureau)
                    foreach (var listeDto in bureauDto.Listes)
                    {
                        var existingListe = existingListsForBureau.FirstOrDefault(el => el.Id == listeDto.Id);

                        if (existingListe == null)
                        {
                            // This is a new list for this existing bureau
                            if (listeDto.Id.HasValue && listeDto.Id.Value > 0)
                            {
                                return BadRequest($"Cannot add list with existing ID '{listeDto.Id}' to an existing bureau.");
                            }

                            var parti = await context.Partis.FindAsync(listeDto.PartiId);
                            if (parti == null) return BadRequest($"Parti with ID {listeDto.PartiId} not found for new list.");

                            existingBureau.Listes.Add(new Listes
                            {
                                PnAgentListe = listeDto.PnAgentListe,
                                NumListe = listeDto.NumListe,
                                PartiId = listeDto.PartiId,
                                Partis = parti
                            });
                        }
                        else
                        {
                            // Update existing list
                            existingListe.PnAgentListe = listeDto.PnAgentListe;
                            existingListe.NumListe = listeDto.NumListe;
                            existingListe.PartiId = listeDto.PartiId;
                            // Optionally, if Parti is not loaded, you might need to load it here
                            // existingListe.Partis = await context.Partis.FindAsync(listeDto.PartiId);
                            context.Entry(existingListe).State = EntityState.Modified;
                        }
                    }
                    context.Entry(existingBureau).State = EntityState.Modified;
                }
            }

            try
            {
                await context.SaveChangesAsync();
                return Ok(new { message = "Bureaux and Lists updated successfully.", entryId = entryId });
            }
            catch (DbUpdateConcurrencyException)
            {
                // Handle concurrency issues if multiple users could edit simultaneously
                return Conflict("Concurrency conflict: The data was modified by another user.");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error updating bureaux and lists: {ex.Message}");
                // Log the full exception details for debugging
                return StatusCode(500, "An internal server error occurred while updating bureaux and lists.");
            }

        }
    }

}
