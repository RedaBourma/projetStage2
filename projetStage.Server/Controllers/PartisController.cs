using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using projetStage.Server.Dtos;

namespace projetStage.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class PartisController : ControllerBase
    {
        private readonly AppDbContext context;

        public PartisController(AppDbContext context)
        {
            this.context = context;
        }

        [HttpGet("getPartis")]
        public async Task<IActionResult> GetPartis()
        {
            if(context.Partis == null)
            {
                return NotFound("Partis not found.");
            }

            var partis = await context.Partis
                .Select(p => new PartisDto
                {
                    Id = p.Id,
                    Name = p.Name,
                }).ToListAsync();
            if (partis == null || !partis.Any())
            {
                return NotFound("No partis found.");
            }

            Console.WriteLine($"Returned {partis.Count} partis");

            return Ok(partis);
        }
    }
}
