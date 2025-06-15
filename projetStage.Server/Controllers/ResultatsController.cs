using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using projetStage.Server.Dtos;
using projetStage.Server.Models;

namespace projetStage.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ResultatsController : ControllerBase
    {
        private readonly AppDbContext context;
        public ResultatsController(AppDbContext context)
        {
            this.context = context;
        }
        [HttpGet("GetResultats/{bureauId}")]
        public async Task<IActionResult> GetResultatsByBureauxId(int bureauId)
        {
            try
            {
                var resultatsEntities = await context.Resultats
                    .Where(r => r.BureauxId == bureauId)
                    .ToListAsync();
                if (resultatsEntities == null || !resultatsEntities.Any())
                {
                    return NotFound($"No resultats found for Bureaux ID {bureauId}.");
                }
                var resultatsDtos = resultatsEntities.Select(r => new ResultatsDto
                {
                    Id = r.Id,
                    BureauxId = r.BureauxId,
                    ListeId = r.ListeId,
                    NumInscrits = r.NumInscrits,
                    NumElecteurs = r.NumElecteurs, 
                    NumBullVoteNuls = r.NumBullVoteNuls,
                    NumVotesExprimes = r.NumVotesExprimes
                }).ToList();
                return Ok(resultatsEntities);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Error retrieving data: {ex.Message}");
            }
        }

        [HttpPost("bulk")]
        public async Task<IActionResult> PostMultipleResultats([FromBody] List<ResultatsDto> results)
        {
            if (results == null || !results.Any())
            {
                return BadRequest("No results provided.");
            }
            try
            {
                var resultatsEntities = results.Select(r => new Resultats
                {
                    BureauxId = (int)r.BureauxId,
                    ListeId = (int)r.ListeId,
                    NumInscrits = r.NumInscrits,
                    NumElecteurs = r.NumElecteurs,
                    NumBullVoteNuls = r.NumBullVoteNuls,
                    NumVotesExprimes = r.NumVotesExprimes
                }).ToList();
                context.Resultats.AddRange(resultatsEntities);
                await context.SaveChangesAsync();
                return Ok(resultatsEntities);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Error saving data: {ex.Message}");
            }
        }
          
    }
}
