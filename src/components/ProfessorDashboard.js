import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaPlus, FaSignOutAlt } from 'react-icons/fa';
import './ProfessorDashboard.css'; // Ensure to import the new CSS file

const ProfessorDashboard = () => {
    const username = localStorage.getItem('username');
    const userId = localStorage.getItem('userId');
    // const email = localStorage.getItem('email');
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('create');
    const [courseCreated, setCourseCreated] = useState(false);
    const [courses, setCourses] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [course, setCourse] = useState({
        title: '',
        description: '',
        startDate: '',
        endDate: '',
        price: '',
        modules: [{ title: '', content: '', order: 1 }],
    });

    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
    };

    const handleCreateCourse = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5145/api/Courses', {
                title: course.title,
                description: course.description,
                professorId: userId,
                startDate: course.startDate,
                endDate: course.endDate,
                price: course.price,
                modules: course.modules,
            });
            setCourseCreated(true);
            alert('Course created successfully!');
        } catch (error) {
            console.error('Error creating course:', error);
        }
    };

    const handleAddModule = () => {
        setCourse({
            ...course,
            modules: [...course.modules, { title: '', content: '', order: course.modules.length + 1 }],
        });
    };

    const handleModuleChange = (index, field, value) => {
        const updatedModules = [...course.modules];
        updatedModules[index][field] = value;
        setCourse({ ...course, modules: updatedModules });
    };

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const response = await axios.get('http://localhost:5145/api/Courses');
                const approvedCourses = response.data.filter(course => course.isApproved && course.professorId === parseInt(userId));
                setCourses(approvedCourses);
            } catch (error) {
                console.error('Error fetching courses:', error);
            }
        };

        const fetchReviews = async () => {
            try {
                const reviewResponse = await axios.get(`http://localhost:5145/api/Reviews/professor/${userId}`);
                setReviews(reviewResponse.data);
            } catch (error) {
                console.error('Error fetching reviews:', error);
            }
        };

        fetchCourses();
        fetchReviews();
    }, [userId]);

    return (
        <div className="dashboard-container">
            <h2 className="dashboard-heading">Professor Dashboard</h2>
            <p className="dashboard-welcome">Welcome, {username}</p>

            <div className="dashboard-header">
                <div className="dashboard-tabs">
                    <button onClick={() => setActiveTab('myCourses')} className={`dashboard-tab ${activeTab === 'myCourses' ? 'active' : ''}`}>Courses Created</button>
                    <button onClick={() => setActiveTab('create')} className={`dashboard-tab ${activeTab === 'create' ? 'active' : ''}`}>Add Course</button>
                    <button onClick={() => setActiveTab('reviews')} className={`dashboard-tab ${activeTab === 'reviews' ? 'active' : ''}`}> Enrollment Status</button>
                </div>
                <button className="dashboard-logout" onClick={handleLogout}><FaSignOutAlt /> </button>
            </div>

            {/* Create Course Tab */}
            {activeTab === 'create' && (
                <div className="dashboard-tab-content">
                    {!courseCreated ? (
                        <div>
                            <h3 className="dashboard-subheading">Build a Course</h3>
                            <form onSubmit={handleCreateCourse} className="dashboard-form">
                                <input
                                    type="text"
                                    placeholder="Course Title"
                                    value={course.title}
                                    onChange={(e) => setCourse({ ...course, title: e.target.value })}
                                    required
                                    className="dashboard-input"
                                />
                                <textarea
                                    placeholder="Course Description"
                                    value={course.description}
                                    onChange={(e) => setCourse({ ...course, description: e.target.value })}
                                    required
                                    className="dashboard-textarea"
                                />
                                <input
                                    type="date"
                                    placeholder="Start Date"
                                    value={course.startDate}
                                    onChange={(e) => setCourse({ ...course, startDate: e.target.value })}
                                    required
                                    className="dashboard-input"
                                />
                                <input
                                    type="date"
                                    placeholder="End Date"
                                    value={course.endDate}
                                    onChange={(e) => setCourse({ ...course, endDate: e.target.value })}
                                    required
                                    className="dashboard-input"
                                />
                                <input
                                    type="number"
                                    placeholder="Price"
                                    value={course.price}
                                    onChange={(e) => setCourse({ ...course, price: e.target.value })}
                                    required
                                    className="dashboard-input"
                                />

                                <h4 className="dashboard-module-heading">Modules</h4>
                                {course.modules.map((module, index) => (
                                    <div key={index} className="dashboard-module-container">
                                        <input
                                            type="text"
                                            placeholder={`Module ${index + 1} Title`}
                                            value={module.title}
                                            onChange={(e) => handleModuleChange(index, 'title', e.target.value)}
                                            required
                                            className="dashboard-module-input"
                                        />
                                        <textarea
                                            placeholder={`Module ${index + 1} Content`}
                                            value={module.content}
                                            onChange={(e) => handleModuleChange(index, 'content', e.target.value)}
                                            required
                                            className="dashboard-module-textarea"
                                        />
                                    </div>
                                ))}
 <div className="dashboard-button-container">
    <button type="button" onClick={handleAddModule} className="dashboard-add-button">
        <FaPlus />Add More {/* Using the plus icon */}
    </button>
    <button type="submit" className="dashboard-submit-button">Publish Course</button>
</div>

                            </form>
                        </div>
                    ) : (
                        <div>
                            <h3 className="dashboard-subheading">Course Created Successfully!</h3>
                        </div>
                    )}
                </div>
            )}

            {/* My Courses Tab */}
            {activeTab === 'myCourses' && (
                <div className="dashboard-tab-content">
                    <h3 className="dashboard-subheading"> Live Courses</h3>
                    {courses.length > 0 ? (
                        <ul className="dashboard-course-list">
                            {courses.map((course) => (
                                <li key={course.courseId} className="dashboard-course-item">
                                    <h4>{course.title}</h4>
                                    <p>{course.description}</p>
                                    <p><strong>Start Date :</strong> {course.startDate}</p>
                                    <p><strong>End Date:</strong> {course.endDate}</p>
                                    {/* <p><strong>Price:</strong> ${course.price}</p> */}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>No courses Available.</p>
                    )}
                </div>
            )}

            {/* Course Reviews Tab */}
            {activeTab === 'reviews' && (
                <div className="dashboard-tab-content">
                    <h3 className="dashboard-subheading">Course Enrollments</h3>
                    {reviews.length > 0 ? (
                        <ul className="dashboard-course-list">
                            {reviews.map((review) => (
                                <li key={review.courseId} className="dashboard-course-item">
                                    <h4>Course Title: {review.courseTitle}</h4>
                                    <p>Students Enrolled: {review.studentCount}</p>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>No Enrollments yet.</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default ProfessorDashboard;
