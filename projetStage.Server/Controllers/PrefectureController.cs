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
    public class PrefectureController : ControllerBase
    {

        private readonly AppDbContext context;

        public PrefectureController(AppDbContext context)
        {
            this.context = context;
        }

        [HttpGet("getprefectures")]
        public async Task<IActionResult> GetPrefectures()
        {
            try
            {
                var prefectures = await context.Prefectures
                    .Include(p => p.Circonscriptions)
                    .Select(p => new PrefectureDto
                    {
                        Id = p.Id,
                        Name = p.Name,
                        Circonscriptions = p.Circonscriptions.Select(c => new CirconscriptionDto
                        {
                            Id = c.Id,
                            Name = c.Name,
                            PrefectureId = c.PrefectureId
                        }).ToList()
                    })
                    .ToListAsync();
                return Ok(prefectures);
            }
            catch (Exception ex)
            {
                return NotFound("An error occurred while fetching prefectures.");
            }
        }
    }
}
