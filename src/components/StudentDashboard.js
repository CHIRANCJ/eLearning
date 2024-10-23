import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import jsPDF from 'jspdf';

const StudentDashboard = () => {
    const [studentDetails, setStudentDetails] = useState(null);
    const [courses, setCourses] = useState([]);
    const [myCourses, setMyCourses] = useState([]);
    const [completedCourses, setCompletedCourses] = useState([]);
    const [purchaseStatus, setPurchaseStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
    const [currentCourseId, setCurrentCourseId] = useState(null);
    const [currentCourseModules, setCurrentCourseModules] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchStudentDetails = async () => {
            try {
                const email = localStorage.getItem('email');
                const userId = localStorage.getItem('userId');
                const studentResponse = await axios.get(`http://localhost:5145/api/Students/details/${email}`);
                setStudentDetails(studentResponse.data);
            } catch (err) {
                console.error("Error fetching student details:", err);
            } finally {
                setLoading(false);
            }
        };

        const fetchCourses = async () => {
            try {
                const courseResponse = await axios.get('http://localhost:5145/api/Courses/approved');
                setCourses(courseResponse.data);
            } catch (err) {
                console.error("Error fetching courses:", err);
            }
        };

        fetchStudentDetails();
        fetchCourses();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        localStorage.removeItem('email');
        navigate('/');
    };

    const handleBuyCourse = async (courseId) => {
        const enrollment = { StudentId: studentDetails.userId, CourseId: courseId };
        try {
            await axios.post('http://localhost:5145/api/Enrollments', enrollment);
            setMyCourses((prev) => [...prev, { courseId }]);
           // setPurchaseStatus(`You have successfully purchased the course with ID: ${courseId}`);
        } catch (err) {
            console.error("Error enrolling in the course:", err);
        }
    };

    const handleModuleNavigation = async (courseId) => {
        setCurrentCourseId(courseId);
        setCurrentModuleIndex(0);
        try {
            const modulesResponse = await axios.get(`http://localhost:5145/api/Modules/course/${courseId}`);
            setCurrentCourseModules(modulesResponse.data);
        } catch (err) {
            console.error("Error fetching modules:", err);
        }
    };

    const handleNextModule = () => {
        setCurrentModuleIndex((prevIndex) => prevIndex + 1);
    };

    const handleFinishCourse = async (courseId) => {
        const completedCourse = myCourses.find(course => course.courseId === courseId);
        if (completedCourse) {
            setCompletedCourses((prev) => [...prev, completedCourse]);
            setMyCourses((prev) => prev.filter(course => course.courseId !== courseId));
            setCurrentCourseId(null);
            setCurrentModuleIndex(0);
            setCurrentCourseModules([]);
        }
    };

    const generateCertificate = (course) => {
        const doc = new jsPDF();
        const date = new Date().toLocaleString();
    
        doc.text("E-Learning Platform", 20, 20);
        doc.text(`Date: ${date}`, 20, 30);
        doc.text("Congratulations!", 20, 50);
        doc.text(`You have successfully completed the course`, 20, 70);
        doc.text("Thank you for choosing Kinston University.", 20, 90);
        
        doc.save(`Completion_Certificate.pdf`);
    };
    

    if (loading) {
        return <p style={styles.loadingText}>Loading student details and courses...</p>;
    }

    return (
        <div style={styles.dashboardContainer}>
            <h2 style={styles.heading}>Student Dashboard</h2>

            {studentDetails ? (
                <div style={styles.studentInfo}>
                    <p style={styles.infoText}>Welcome, {studentDetails.name}</p>
                    <p style={styles.infoText}> Your Email: {studentDetails.email}</p>

                </div>
            ) : (
                <p style={styles.infoText}>No student details found.</p>
            )}

            <button style={styles.logoutButton} onClick={handleLogout}>Logout</button>

            <h3 style={styles.subHeading}>Available Courses</h3>
            {courses.length > 0 ? (
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.tableHeader}>Course Name</th>
                            
                            <th style={styles.tableHeader}>Start Date</th>
                            <th style={styles.tableHeader}>End Date</th>
                            <th style={styles.tableHeader}>Price</th>
                            <th style={styles.tableHeader}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {courses.map((course) => (
                            <tr key={course.courseId}>
                                <td style={styles.tableData}>{course.title}</td>
                                
                                <td style={styles.tableData}>{new Date(course.startDate).toLocaleDateString()}</td>
                                <td style={styles.tableData}>{new Date(course.endDate).toLocaleDateString()}</td>
                                <td style={styles.tableData}>{course.price}</td>
                                <td style={styles.tableData}>
                                    <button style={styles.enrollButton} onClick={() => handleBuyCourse(course.courseId)}>
                                        Enroll & Buy
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p style={styles.infoText}>No approved courses available at the moment.</p>
            )}

            {purchaseStatus && <p style={styles.statusMessage}>{purchaseStatus}</p>}

            <h3 style={styles.subHeading}>My Courses</h3>
            {myCourses.length > 0 ? (
                <ul style={styles.courseList}>
                    {myCourses.map((course) => (
                        <li key={course.courseId} style={styles.courseItem}>
                            <button style={styles.courseButton} onClick={() => handleModuleNavigation(course.courseId)}>
                                Course : {course.courseId}
                            </button>
                        </li>
                    ))}
                </ul>
            ) : (
                <p style={styles.infoText}>No courses enrolled.</p>
            )}

            {currentCourseId && currentCourseModules.length > 0 && (
                <div style={styles.moduleContainer}>
                    <h3 style={styles.subHeading}>Course Modules</h3>
                    {currentModuleIndex < currentCourseModules.length ? (
                        <>
                            <h4 style={styles.moduleTitle}>Module {currentModuleIndex + 1}</h4>
                            <p style={styles.moduleContent}>{currentCourseModules[currentModuleIndex].content}</p>
                            <button style={styles.moduleButton} onClick={handleNextModule} disabled={currentModuleIndex >= currentCourseModules.length - 1}>
                                Mark as Completed 
                            </button>
                            {currentModuleIndex === currentCourseModules.length - 1 && (
                                <button style={styles.finishButton} onClick={() => handleFinishCourse(currentCourseId)}>
                                    Finish Course
                                </button>
                            )}
                        </>
                    ) : (
                        <p style={styles.infoText}>You have completed all modules .</p>
                    )}
                </div>
            )}

            <h3 style={styles.subHeading}>Completed Courses</h3>
            {completedCourses.length > 0 ? (
                <ul style={styles.courseList}>
                    {completedCourses.map((course) => (
                        <li key={course.courseId} style={styles.courseItem}>
                            <span>Course ID: {course.courseId}</span>
                            <button style={styles.certificateButton} onClick={() => generateCertificate(course)}>Download Certificate</button>
                        </li>
                    ))}
                </ul>
            ) : (
                <p style={styles.infoText}>No completed courses.</p>
            )}
        </div>
    );
};

const styles = {
    dashboardContainer: {
        padding: '20px',
        backgroundColor: '#f5f5f5',
        borderRadius: '8px',
        maxWidth: '1200px',
        margin: '20px auto',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
    },
    heading: {
        color: '#333',
        fontSize: '28px',
        marginBottom: '20px'
    },
    subHeading: {
        color: '#444',
        fontSize: '22px',
        marginTop: '30px',
        marginBottom: '15px'
    },
    studentInfo: {
        marginBottom: '20px',
        padding: '10px',
        backgroundColor: '#fff',
        borderRadius: '6px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
    },
    infoText: {
        fontSize: '16px',
        color: '#555',
        marginBottom: '8px'
    },
    logoutButton: {
        padding: '10px 15px',
        backgroundColor: '#d9534f',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        marginBottom: '20px'
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        marginBottom: '20px'
    },
    tableHeader: {
        backgroundColor: '#f2f2f2',
        padding: '10px',
        fontSize: '16px',
        textAlign: 'left',
        color: '#333'
    },
    tableData: {
        padding: '10px',
        fontSize: '15px',
        borderBottom: '1px solid #ddd',
        color: '#555'
    },
    enrollButton: {
        padding: '8px 12px',
        backgroundColor: '#5cb85c',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer'
    },
    courseList: {
        listStyle: 'none',
        padding: 0
    },
    courseItem: {
        padding: '10px',
        backgroundColor: '#fff',
        borderRadius: '6px',
        marginBottom: '10px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
    },
    courseButton: {
        padding: '8px 12px',
        backgroundColor: '#0275d8',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer'
    },
    moduleContainer: {
        padding: '20px',
        backgroundColor: '#fff',
        borderRadius: '6px',
        marginBottom: '20px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
    },
    moduleTitle: {
        fontSize: '18px',
        marginBottom: '10px',
        color: '#444'
    },
    moduleContent: {
        fontSize: '16px',
        marginBottom: '20px',
        color: '#555'
    },
    moduleButton: {
        padding: '8px 12px',
        backgroundColor: '#0275d8',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        marginRight: '10px'
    },
    finishButton: {
        padding: '8px 12px',
        backgroundColor: '#5cb85c',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer'
    },
    certificateButton: {
        padding: '8px 12px',
        backgroundColor: '#5cb85c',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        marginLeft: '10px'
    },
    statusMessage: {
        fontSize: '16px',
        color: '#5cb85c',
        marginBottom: '20px'
    }
};

export default StudentDashboard;
