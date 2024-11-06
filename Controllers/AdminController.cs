using Kinstonplatform.Data;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Linq;

namespace Kinstonplatform.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AdminController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AdminController(ApplicationDbContext context)
        {
            _context = context;
        }

        // Get pending approvals for Professors and Students
        [HttpGet("pending-approvals")]
        public IActionResult GetPendingUsers()
        {
            var pendingUsers = _context.Users
                .Where(u => !u.IsActive && (u.Role == "Professor" || u.Role == "Student"))
                .ToList();

            return Ok(pendingUsers);
        }

        // Approve or reject user by ID
        [HttpPut("approve-user/{id}")]
        public IActionResult ApproveUser(int id, [FromQuery] bool approve)
        {
            var user = _context.Users.Find(id);

            if (user == null)
                return NotFound();

            user.IsActive = approve;
            _context.SaveChanges();

            return Ok(approve ? "User approved." : "User rejected.");
        }

        // Enable or disable user by ID
        [HttpPut("toggle-user-status/{id}")]
        public IActionResult ToggleUserStatus(int id, [FromQuery] bool enable)
        {
            var user = _context.Users.Find(id);

            if (user == null)
                return NotFound();

            user.IsEnabled = enable;
            _context.SaveChanges();

            return Ok(enable ? "User enabled." : "User disabled.");
        }
        [HttpPut("toggle-course-status/{id}")]
        public IActionResult ToggleCourseStatus(int id, [FromQuery] bool activated)
        {
            var course = _context.Courses.Find(id);

            if (course == null)
                return NotFound("Course not found.");

            course.Status = activated; // Set the course status based on activation

            _context.SaveChanges();

            return Ok(activated ? "Course activated." : "Course deactivated."); // Update the response messages
        }


        [HttpGet("all-users")]
        public IActionResult GetAllUsers()
        {
            // Fetch all users with roles 'Professor' or 'Student'
            var allUsers = _context.Users
                .Where(u => u.Role == "Professor" || u.Role == "Student")
                .ToList();

            return Ok(allUsers);
        }

    }
}
