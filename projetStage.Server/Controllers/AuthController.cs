using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using projetStage.Server.Models;
using projetStage.Server.utils;
using System.ComponentModel.DataAnnotations;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace projetStage.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [AllowAnonymous] 
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext context;
        private readonly IConfiguration configuration;

        public AuthController(AppDbContext context, IConfiguration configuration)
        {
            this.context = context;
            this.configuration = configuration;
        }

        public class RegisterRequest
        {
            public string UserName { get; set; }
            [Required]
            public string Email { get; set; }
            [Required]
            public string Password { get; set; }
        }

        public class LoginRequest
        {
            [Required]
            public string Email { get; set; }
            [Required]
            public string Password { get; set; }
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            if (await context.Users.AnyAsync(u => u.Email == request.Email))
            {
                return Conflict("Username already exists");
            }

            var user = new User
            {
                Name = request.UserName,
                Email = request.Email,
                Password = PasswordHasher.HashPassword(request.Password),
            };
            context.Users.Add(user);

            await context.SaveChangesAsync();

            return Ok("Registration succesful.");

        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var user = await context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);

            if (user == null || !PasswordHasher.VerifyPassword(request.Password, user.Password))
            {
                return Unauthorized("Invalid credentials.");
            }

            var issuer = configuration["JwtSettings:Issuer"];
            var audience = configuration["JwtSettings:Audience"];
            var secretKey = configuration["JwtSettings:Secret"];
            var expirationMinutes = configuration.GetValue<int>("JwtSettings:ExpirationMinutes");


            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Email),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Name),
                new Claim(ClaimTypes.Email, user.Email),
            };

            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(expirationMinutes),
                signingCredentials: credentials
            );  

            var encodedToken = new JwtSecurityTokenHandler().WriteToken(token);

            return Ok(new { token = encodedToken });
        }

    }
}
