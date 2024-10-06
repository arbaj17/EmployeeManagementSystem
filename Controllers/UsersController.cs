using EmployeeManagementSystem.Data;
using EmployeeManagementSystem.Helpers;
using EmployeeManagementSystem.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Threading.Tasks;

namespace EmployeeManagementSystem.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : Controller
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;

        public UsersController(ApplicationDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] User user)
        {
            if (user == null)
            {
                return BadRequest("Invalid client request");
            }

            if (string.IsNullOrEmpty(user.FirstName) ||
                string.IsNullOrEmpty(user.LastName) ||
                string.IsNullOrEmpty(user.Email) ||
                string.IsNullOrEmpty(user.Username) ||
                string.IsNullOrEmpty(user.Password))
            {
                var result = "All fields are required.";
                return new ObjectResult(result) { StatusCode = 400 };
            }

            if (user.Password.Length < 6)
            {
                var result = "Password must be at least 6 characters long.";
                return new ObjectResult(result) { StatusCode = 400 };
            }

            var existingUser = _context.Users.SingleOrDefault(u => u.Username == user.Username || u.Email == user.Email);
            if (existingUser != null)
            {
                var result = "Username or Email already exists.";
                return new ObjectResult(result) { StatusCode = 400 };
            }

            user.Password = BCrypt.Net.BCrypt.HashPassword(user.Password);

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return Ok("User registered successfully.");
        }


        [HttpPost("login")]
        public IActionResult Login([FromBody] Login login)
        {
            if (login == null || string.IsNullOrEmpty(login.Username) || string.IsNullOrEmpty(login.Password))
            {
                return BadRequest("Invalid client request");
            }

            var dbUser = _context.Users.SingleOrDefault(u => u.Username == login.Username);

            if (dbUser == null || !BCrypt.Net.BCrypt.Verify(login.Password, dbUser.Password))
            {
                return Unauthorized();
            }

            var token = JwtHelper.GenerateJwtToken(dbUser.Username, _configuration);
            return Ok(new { Token = token });
        }
    }
}
