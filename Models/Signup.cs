﻿namespace Kinstonplatform.Models
{
    public class Signup
    {
        public string Name { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
        public string Role { get; set; } // This should be "admin", "professor", or "student"
    }
}
