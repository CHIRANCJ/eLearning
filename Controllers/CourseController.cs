using Kinstonplatform.Data;
using Kinstonplatform.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Linq;

namespace Kinstonplatform.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    //[Authorize(Roles = "Admin,Professor")] 
    public class CoursesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public CoursesController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/courses
        [HttpGet]
        public ActionResult<IEnumerable<Course>> GetCourses()
        {
            // Return all approved courses
            var courses = _context.Courses.Where(c => c.IsApproved).ToList();
            return Ok(courses);
        }

        // POST: api/courses
        [HttpPost]
      // [Authorize(Roles = "Professor")] 
        public IActionResult CreateCourseWithModules([FromBody] ModuleAddition request)
        {
            if (request == null)
                return BadRequest("Course and module details are required.");

            // Create a new Course
            var course = new Course
            {
                Title = request.Title,
                Description = request.Description,
                ProfessorId = request.ProfessorId, // Assigning the Professor who is creating the course
                StartDate = request.StartDate,
                EndDate = request.EndDate,
                Price = request.Price,
                IsApproved = false, // Course pending approval
                EnrollmentCount = 0
            };

            _context.Courses.Add(course);
            _context.SaveChanges();

            // Add the provided modules to the course
            foreach (var module in request.Modules)
            {
                var newModule = new Module
                {
                    Title = module.Title,
                    Content = module.Content,
                    CourseId = course.CourseId, // Linking to the newly created course
                    Order = module.Order // Optional: Use if you want to enforce ordering of modules
                };
                _context.Modules.Add(newModule);
            }

            _context.SaveChanges();

            return CreatedAtAction(nameof(GetCourses), new { id = course.CourseId }, course);
        }

        // POST: api/courses/approve/{id}
        [HttpPost("approve/{id}")]
    //    [Authorize(Roles = "Admin")] // Only Admin can approve a course
        public IActionResult ApproveCourse(int id)
        {
            var course = _context.Courses.Find(id);
            if (course == null)
                return NotFound("Course not found.");

            course.IsApproved = true;
            _context.SaveChanges();

            return Ok("Course approved successfully.");
        }

        // POST: api/courses/reject/{id}
        [HttpPost("reject/{id}")]
       // [Authorize(Roles = "Admin")] 
        public IActionResult RejectCourse(int id)
        {
            var course = _context.Courses.Find(id);
            if (course == null)
                return NotFound("Course not found.");

            _context.Courses.Remove(course);
            _context.SaveChanges();

            return Ok("Course rejected and deleted successfully.");
        }

        // GET: api/courses/{courseId}/modules
        [HttpGet("{courseId}/modules")]
   //     [Authorize]
        public ActionResult<IEnumerable<Module>> GetModules(int courseId)
        {
            var modules = _context.Modules.Where(m => m.CourseId == courseId).ToList();
            return Ok(modules);
        }

        // GET: api/courses/pending
        [HttpGet("pending")]
        public IActionResult GetPendingCourses()
        {
            var pendingCourses = _context.Courses
                                         .Where(c => !c.IsApproved) // Fetch courses where IsApproved is false or 0
                                         .ToList();
            return Ok(pendingCourses);
        }



        // Fetch approved courses (IsApproved == 1)
        [HttpGet("approved")]
        public IActionResult GetApprovedCourses()
        {
            var approvedCourses = _context.Courses
                .Where(c => c.IsApproved == true)
                .Select(c => new
                {
                    c.CourseId,
                    c.Title,
                    c.StartDate,
                    c.EndDate,
                    c.Price
                })
                .ToList();

            return Ok(approvedCourses);
        }
      
    }
}