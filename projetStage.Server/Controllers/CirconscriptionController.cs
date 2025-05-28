using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace projetStage.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class CirconscriptionController : ControllerBase
    {
        private readonly AppDbContext context;

        public CirconscriptionController(AppDbContext context)
        {
            this.context = context;
        }

        [HttpGet("GetCirconscriptionById")]
        public async Task<IActionResult> GetCirconscriptionById([FromQuery] int preId)
        {
            //Console.WriteLine($"\n--- Debugging CirconscriptionController ---");
            //Console.WriteLine($"Received preId: {preId}");
            try
            {
                if(context.Circonscriptions == null)
                {
                    return StatusCode(500,"Circonscription data not found.");
                }

                
                // Log the total count of circonscriptions before filtering (optional, but helpful)
                var totalCirconscriptionsCount = await context.Circonscriptions.CountAsync();
                //Console.WriteLine($"Total circonscriptions in DB: {totalCirconscriptionsCount}");

                var circonscription = await context.Circonscriptions
                    .Where(c => c.PrefectureId == preId)
                    .ToListAsync();

                 //Console.WriteLine($"Found {circonscription.Count} circonscriptions for preId: {preId}");
                if (circonscription == null || !circonscription.Any())
                {
                    return NotFound("No circonscription found for the given Prefecture ID.");
                }
                return Ok(circonscription);
            }
            catch (Exception ex)
            {
                //Console.WriteLine($"Error fetching circonscriptions: {ex.Message}");
                // Log the full exception details on the server for deeper analysis, but don't return to client.
                //Console.WriteLine($"Stack Trace: {ex.StackTrace}");
                return StatusCode(500,"An error occurred while fetching the circonscription." + ex);
            }
        }

    }
}
