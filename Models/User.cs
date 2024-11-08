﻿using System.ComponentModel.DataAnnotations;

namespace Kinstonplatform.Models
{
    public class User
    {
        public int UserId { get; set; }

        [Required]
        public string Name { get; set; }

        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        public string PasswordHash { get; set; }

        [Required]
        public string Role { get; set; } // Values: Admin, Professor, Student

        public bool IsActive { get; set; } = true;

        
        public bool IsEnabled { get; set; } = true; // Default value is true
    }
}
