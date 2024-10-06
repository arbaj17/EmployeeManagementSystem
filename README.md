# Employee Management System

## Setup Instructions

1. Clone the repository to your local machine.
2. Create a file named `appsettings.json` in the root of the project.
3. Use the following template for your `appsettings.json`:

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=EmployeeDb;User=root;Password=your_password_here;"
  },
  "Jwt": {
    "Key": "ThisIsAReallySecureKeyThatIs32CharLen!",
    "Issuer": "EmployeeManagementSystem",
    "Audience": "EmployeeManagementSystem",
    "Subject": "JWTToken",
    "ExpireMinutes": 30
  },
  "AllowedHosts": "*"
}
