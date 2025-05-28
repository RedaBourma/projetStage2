using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace projetStage.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class UserInfoController : ControllerBase
    {

        [HttpGet("me")]
        public IActionResult GetCurentUserInfo()
        {
            var userEmail = HttpContext.User.FindFirst(ClaimTypes.Email)?.Value;
            var userName = HttpContext.User.FindFirst(ClaimTypes.Name)?.Value;
            var userId = HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userEmail) || string.IsNullOrEmpty(userName) || string.IsNullOrEmpty(userId))
            {
                return Unauthorized("User information not found.");
            }
            return Ok(new
            {
                Id = userId,
                Email = userEmail,
                Name = userName
            });

        }
    }
}
