using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace EmployeeManagementSystem.Helpers
{
    public static class JwtHelper
    {
        public static string GenerateJwtToken(string username, IConfiguration configuration)
        {
                var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(configuration["Jwt:Key"]));
                var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

                var token = new JwtSecurityToken(
                    issuer: configuration["Jwt:Issuer"],
                    audience: configuration["Jwt:Audience"],
                    claims: new[] { new Claim(ClaimTypes.Name, username) },
                    expires: DateTime.Now.AddMinutes(30),
                    signingCredentials: credentials
                );

                return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}

