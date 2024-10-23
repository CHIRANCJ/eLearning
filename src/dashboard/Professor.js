import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Box, Card, CardContent, Button, CircularProgress, Grid, Alert,
  TextField, Dialog, DialogActions, DialogContent, DialogTitle, IconButton
} from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';

const ProfessorDashboard = () => {
  const [professorName, setProfessorName] = useState('');
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newCourse, setNewCourse] = useState({ title: '', description: '', currentBatchStartDate: '', currentBatchEndDate: '' });
  const [openCourseDialog, setOpenCourseDialog] = useState(false);
  const [moduleTitle, setModuleTitle] = useState('');
  const navigate = useNavigate();

  // Helper function to get token and handle token errors
  const getToken = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Token is missing. Please log in.');
      return null;
    }
    return token;
  };

  // Fetch professor's name and courses
  useEffect(() => {
    const token = getToken();
    if (!token) return;

    setError(''); // Clear previous errors

    // Fetch professor details
    axios.get('http://localhost:5116/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(response => {
        setProfessorName(response.data.name); // Assuming the professor's name is in the 'name' field
      })
      .catch(error => {
        setError('Error fetching professor details.');
        handleAuthError(error);
      });

    // Fetch professor's courses
    axios.get('http://localhost:5116/api/professor/courses', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(response => {
        setCourses(response.data);
        setLoading(false);
      })
      .catch(error => {
        handleAuthError(error);
        setLoading(false);
      });
  }, []);

  // Handle authentication errors
  const handleAuthError = (error) => {
    if (error.response && error.response.status === 401) {
      // setError('Session expired. Please log in again.');
      // localStorage.removeItem('token');
      // navigate('/login');
    } else {
     // setError('Error: ' + error.message);
    }
  };

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login'); // Redirect to login page after logging out
  };

  // Create a new course
  const handleCreateCourse = () => {
    const token = getToken();
    if (!token) return;

    axios.post('http://localhost:5116/api/professor/courses', newCourse, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(response => {
        setOpenCourseDialog(false); // Close dialog
        setCourses([...courses, response.data]); // Add new course to the list
      })
      .catch(error => setError('Error creating course: ' + error.message));
  };

  // Add a module to a course
  const handleAddModule = (courseId) => {
    const token = getToken();
    if (!token) return;

    axios.post(`http://localhost:5116/api/professor/courses/${courseId}/modules`, { title: moduleTitle }, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(response => {
        // Add the new module to the corresponding course
        setCourses(courses.map(course =>
          course.id === courseId ? { ...course, modules: [...course.modules, response.data] } : course
        ));
        setModuleTitle(''); // Clear the input field
      })
      .catch(error => setError('Error adding module: ' + error.message));
  };

  // Delete a module from a course
  const handleDeleteModule = (courseId, moduleId) => {
    const token = getToken();
    if (!token) return;

    axios.delete(`http://localhost:5116/api/professor/courses/${courseId}/modules/${moduleId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(response => {
        // Remove the deleted module from the corresponding course
        setCourses(courses.map(course =>
          course.id === courseId ? { ...course, modules: course.modules.filter(m => m.id !== moduleId) } : course
        ));
      })
      .catch(error => setError('Error deleting module: ' + error.message));
  };

  // Render the professor dashboard
  return (
    <Container>
      <Box my={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome to Professor Dashboard, {professorName}!
        </Typography>

        {error && <Alert severity="error">{error}</Alert>}

        {/* Display courses */}
        <Typography variant="h5" component="h2" gutterBottom>
          Your Courses
        </Typography>

        {loading ? (
          <Box display="flex" justifyContent="center" my={2}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {courses.length === 0 ? (
              <Typography>No courses available.</Typography>
            ) : (
              courses.map(course => (
                <Grid item xs={12} sm={6} md={4} key={course.id}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6">{course.title}</Typography>
                      <Typography variant="body2" color="textSecondary">{course.description}</Typography>
                      <Typography variant="body2" color="textSecondary">Start Date: {new Date(course.currentBatchStartDate).toLocaleDateString()}</Typography>
                      <Typography variant="body2" color="textSecondary">End Date: {new Date(course.currentBatchEndDate).toLocaleDateString()}</Typography>
                      {course.isApproved ? (
                        <>
                          <Typography variant="h6" component="h3" mt={2}>Modules:</Typography>
                          {course.modules.map(module => (
                            <Box key={module.id} display="flex" alignItems="center" justifyContent="space-between">
                              <Typography>{module.title}</Typography>
                              <IconButton onClick={() => handleDeleteModule(course.id, module.id)}>
                                <DeleteIcon />
                              </IconButton>
                            </Box>
                          ))}
                          <Box mt={2} display="flex" alignItems="center">
                            <TextField
                              label="Module Title"
                              value={moduleTitle}
                              onChange={(e) => setModuleTitle(e.target.value)}
                            />
                            <IconButton color="primary" onClick={() => handleAddModule(course.id)}>
                              <AddCircleOutlineIcon />
                            </IconButton>
                          </Box>
                        </>
                      ) : (
                        <Typography variant="body2" color="textSecondary">Awaiting approval for this course.</Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))
            )}
          </Grid>
        )}

        {/* Create Course Button */}
        <Box mt={4} display="flex" justifyContent="center">
          <Button variant="contained" color="primary" onClick={() => setOpenCourseDialog(true)}>
            Create New Course
          </Button>
        </Box>

        {/* Course Creation Dialog */}
        <Dialog open={openCourseDialog} onClose={() => setOpenCourseDialog(false)}>
          <DialogTitle>Create New Course</DialogTitle>
          <DialogContent>
            <TextField
              label="Title"
              fullWidth
              value={newCourse.title}
              onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
              margin="dense"
            />
            <TextField
              label="Description"
              fullWidth
              value={newCourse.description}
              onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
              margin="dense"
            />
            <TextField
              label="Start Date"
              type="date"
              fullWidth
              value={newCourse.currentBatchStartDate}
              onChange={(e) => setNewCourse({ ...newCourse, currentBatchStartDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
              margin="dense"
            />
            <TextField
              label="End Date"
              type="date"
              fullWidth
              value={newCourse.currentBatchEndDate}
              onChange={(e) => setNewCourse({ ...newCourse, currentBatchEndDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
              margin="dense"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenCourseDialog(false)} color="secondary">Cancel</Button>
            <Button onClick={handleCreateCourse} color="primary">Create</Button>
          </DialogActions>
        </Dialog>

        {/* Logout Button */}
        <Box mt={4} display="flex" justifyContent="center">
          <Button variant="contained" color="secondary" onClick={handleLogout}>
            Logout
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default ProfessorDashboard;
