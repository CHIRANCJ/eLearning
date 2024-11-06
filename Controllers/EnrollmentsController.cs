using iText.Layout;
using iText.Kernel.Pdf;
using iText.Layout.Element;
using Kinstonplatform.Data;
using Kinstonplatform.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.IO;
using System.Linq;

namespace Kinstonplatform.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EnrollmentsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public EnrollmentsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        public IActionResult EnrollInCourse([FromBody] Enrollment enrollment)
        {
            if (enrollment == null)
                return BadRequest("Enrollment details are required.");

            // Check if already enrolled in another course
            var existingEnrollment = _context.Enrollments
                .Any(e => e.StudentId == enrollment.StudentId && e.CourseId == enrollment.CourseId);
            if (existingEnrollment)
                return BadRequest("Already enrolled in this course.");

            _context.Enrollments.Add(enrollment);
            _context.SaveChanges();

            // Increment enrollment count in Course
            var course = _context.Courses.Find(enrollment.CourseId);
            if (course != null)
            {
                course.EnrollmentCount++;
                _context.SaveChanges();
            }

            return CreatedAtAction(nameof(GetMyEnrollments), new { id = enrollment.EnrollmentId }, enrollment);
        }

        [HttpGet("my")]
        public ActionResult<IEnumerable<Enrollment>> GetMyEnrollments(int studentId)
        {
            return _context.Enrollments.Where(e => e.StudentId == studentId).ToList();
        }

        // New method to generate a PDF with course enrollment details
        [HttpGet("{professorId}/course-enrollments/pdf")]
        public IActionResult GenerateCourseEnrollmentPdf(int professorId)
        {
            var courses = _context.Courses
                .Where(c => c.ProfessorId == professorId)
                .Select(c => new
                {
                    c.CourseId,
                    c.Title,
                    c.Description,
                    c.StartDate,
                    c.EndDate,
                    c.Price,
                    c.EnrollmentCount,
                    c.IsApproved
                })
                .ToList();

            if (!courses.Any())
            {
                return NotFound("No courses found for the professor.");
            }

            using (var memoryStream = new MemoryStream())
            {
                // Creating the PDF writer and document
                var writer = new PdfWriter(memoryStream);
                var pdf = new PdfDocument(writer);
                var document = new Document(pdf);

                // Adding header
                document.Add(new Paragraph("Course Enrollment Status")
                    .SetFontSize(18)
                    .SetBold());

                // Adding course details
                foreach (var course in courses)
                {
                    document.Add(new Paragraph($"Course Title: {course.Title}"));
                    document.Add(new Paragraph($"Description: {course.Description}"));
                    document.Add(new Paragraph($"Start Date: {course.StartDate.ToShortDateString()}"));
                    document.Add(new Paragraph($"End Date: {course.EndDate.ToShortDateString()}"));
                    document.Add(new Paragraph($"Price: ${course.Price}"));
                    document.Add(new Paragraph($"Enrollment Count: {course.EnrollmentCount}"));
                    document.Add(new Paragraph($"Approved: {(course.IsApproved ? "Yes" : "No")}\n"));
                }

                // Closing the document
                document.Close();

                // Returning the PDF file as a response
                byte[] pdfBytes = memoryStream.ToArray();
                return File(pdfBytes, "application/pdf", "CourseEnrollments.pdf");
            }
        }
    }
}
