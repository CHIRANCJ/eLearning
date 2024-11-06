import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Button,
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  AppBar,
  Toolbar,
  IconButton,
  Tooltip,
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import LogoutIcon from '@mui/icons-material/Logout';

const AdminDashboard = () => {
  const username = localStorage.getItem('username');
  const navigate = useNavigate();

  const [pendingStudents, setPendingStudents] = useState([]);
  const [pendingProfessors, setPendingProfessors] = useState([]);
  const [pendingCourses, setPendingCourses] = useState([]);
  const [allUsers, setAllUsers] = useState([]); // State for all users
  const [allCourses, setAllCourses] = useState([]);


  useEffect(() => {
    const fetchPendingAccounts = async () => {
      try {
        const studentResponse = await axios.get('http://localhost:5145/api/Students/pending');
        const professorResponse = await axios.get('http://localhost:5145/api/Professors/pending');
        setPendingStudents(studentResponse.data);
        setPendingProfessors(professorResponse.data);
      } catch (err) {
        console.error('Error fetching pending accounts:', err);
      }
    };

    const fetchPendingCourses = async () => {
      try {
        const courseResponse = await axios.get('http://localhost:5145/api/Courses/pending');
        setPendingCourses(courseResponse.data);
      } catch (err) {
        console.error('Error fetching pending courses:', err);
      }
    };

    const fetchAllUsers = async () => {
      try {
          const response = await axios.get('http://localhost:5145/api/admin/all-users');
          setAllUsers(response.data); 
      } catch (err) {
          console.error('Error fetching all users:', err);
      }
  };
  const fetchCourses = async () => {
    try {
      const response = await axios.get('http://localhost:5145/api/Courses');
      const coursesWithCorrectStatus = response.data.map(course => ({
        ...course,
        isActivated: course.status === 1, // Map status 1 to true
      }));
      setAllCourses(coursesWithCorrectStatus);
    } catch (err) {
      console.error('Error fetching all courses:', err);
    }
  };

    fetchPendingAccounts();
    fetchPendingCourses();
    fetchAllUsers(); // Fetch all users when the component mounts
    fetchCourses();
  }, []);

  const handleApprove = async (id, type) => {
    try {
      await axios.post(`http://localhost:5145/api/${type}/approve/${id}`);
      if (type === 'Students') {
        setPendingStudents(pendingStudents.filter((student) => student.userId !== id));
      } else if (type === 'Professors') {
        setPendingProfessors(pendingProfessors.filter((professor) => professor.userId !== id));
      } else if (type === 'Courses') {
        setPendingCourses(pendingCourses.filter((course) => course.courseId !== id));
      }
    } catch (err) {
      console.error(`Error approving ${type}:`, err);
    }
  };

  const handleReject = async (id, type) => {
    try {
      await axios.post(`http://localhost:5145/api/${type}/reject/${id}`);
      if (type === 'Students') {
        setPendingStudents(pendingStudents.filter((student) => student.userId !== id));
      } else if (type === 'Professors') {
        setPendingProfessors(pendingProfessors.filter((professor) => professor.userId !== id));
      } else if (type === 'Courses') {
        setPendingCourses(pendingCourses.filter((course) => course.courseId !== id));
      }
    } catch (err) {
      console.error(`Error rejecting ${type}:`, err);
    }
  };

  const handleToggleStatus = async (userId, isEnabled) => {
    try {
      // Toggle the user's enabled status
      const newStatus = !isEnabled;
      console.log('Toggling status for user:', userId, 'to:', newStatus);

      // Make a PUT request to the backend
      await axios.put(`http://localhost:5145/api/admin/toggle-user-status/${userId}?enable=${newStatus }`);
      
      // Use the functional form to update state
      setAllUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.userId === userId ? { ...user, isEnabled: newStatus } : user
        )
      );
    } catch (err) {
      console.error('Error toggling user status:', err);
    }
  };
   
  const handleToggleCourseStatus = async (courseId, isActivated) => {
    try {

      console.log(courseId, isActivated);
      const newStatus = !isActivated; // Toggle the current status
      console.log(`Toggling course status for courseId: ${courseId} to: ${newStatus}`);
      
      // Make a PUT request to the backend
      await axios.put(`http://localhost:5145/api/Admin/toggle-course-status/${courseId}?activated=${newStatus}`);
      
      // Update the state with the new status
      setAllCourses((prevCourses) =>
        prevCourses.map((course) =>
          course.courseId === courseId ? { ...course, status: newStatus } : course
        )
      );
    } catch (err) {
      console.error('Error toggling course status:', err);
    }
  };
  
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    navigate('/');
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5', py: 4 }}>
      <Container maxWidth="lg">
        <AppBar position="static" color="primary" sx={{ boxShadow: 1 }}>
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Registrar Dashboard
            </Typography>
            <Typography variant="subtitle1" sx={{ marginRight: 2 }}>
              Welcome, {username}
            </Typography>
            <Tooltip title="Logout">
              <IconButton color="inherit" onClick={handleLogout}>
                <LogoutIcon />
              </IconButton>
            </Tooltip>
          </Toolbar>
        </AppBar>

        <Box sx={{ my: 4 }}>
          {renderSection('Manage Courses', pendingCourses, 'Courses')}
          {renderSection('Manage Professors', pendingProfessors, 'Professors')}
          {renderSection('Manage Students', pendingStudents, 'Students')}

          {/* New Section for All Users */}
          <Paper
            elevation={3}
            sx={{
              mb: 4,
              p: 4,
              borderRadius: 2,
              bgcolor: '#ffffff',
              boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
            }}
          >
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, color: '#333' }}>
              Manage Users
            </Typography>
            {allUsers.length > 0 ? (
              <TableContainer component={Paper} sx={{ borderRadius: 1, boxShadow: 0 }}>
                <Table sx={{ minWidth: 650 }}>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#e0e0e0' }}>
                      <TableCell sx={{ fontWeight: 'bold', color: '#555' }}>Name</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: '#555' }}>Email</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: '#555', textAlign: 'center' }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: '#555', textAlign: 'center' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {allUsers.map((user) => (
                      <TableRow
                        key={user.userId}
                        sx={{
                          '&:nth-of-type(odd)': { backgroundColor: '#f9f9f9' },
                          '&:hover': { backgroundColor: '#f1f1f1' },
                        }}
                      >
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
<TableCell align="center">{user.isEnabled ? 'Enabled' : 'Disabled'}</TableCell>
<TableCell align="center">
  <Tooltip title={user.isEnabled ? 'Disable User' : 'Enable User'}>
    <IconButton
      color={user.isEnabled ? 'error' : 'success'}
      onClick={() => handleToggleStatus(user.userId, user.isEnabled)}
    >
      {user.isEnabled ? <CancelOutlinedIcon /> : <CheckCircleOutlineIcon />}
    </IconButton>
  </Tooltip>
</TableCell>

                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography>No users found.</Typography>
            )}
            
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, color: '#333' }}>
            Manage Courses Activation
          </Typography>
          {allCourses.length > 0 ? (
            <TableContainer component={Paper} sx={{ borderRadius: 1, boxShadow: 0 }}>
              <Table sx={{ minWidth: 650 }}>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#e0e0e0' }}>
                    <TableCell sx={{ fontWeight: 'bold', color: '#555' }}>Title</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#555' }}>Professor</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#555', textAlign: 'center' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#555', textAlign: 'center' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {allCourses.map((course) => (
                    <TableRow
                      key={course.courseId}
                      sx={{
                        '&:nth-of-type(odd)': { backgroundColor: '#f9f9f9' },
                        '&:hover': { backgroundColor: '#f1f1f1' },
                      }}
                    >
                      <TableCell>{course.title}</TableCell>
                      <TableCell>{course.professorId}</TableCell>
                      <TableCell align="center">{course.status ? 'Activated' : 'Deactivated'}</TableCell>
                      <TableCell align="center">
                        <Tooltip title={course.status ? 'Deactivate Course' : 'Activate Course'}>
                          <IconButton
                            color={course.status ? 'error' : 'success'}
                            onClick={() => handleToggleCourseStatus(course.courseId, course.status)}
                          >
                            {course.status ? <CancelOutlinedIcon /> : <CheckCircleOutlineIcon />}
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography>No courses found.</Typography>
          )}

          </Paper>
        </Box>
      </Container>
    </Box>
  );

  function renderSection(title, pendingItems, type) {
    return (
      <Paper
        elevation={3}
        sx={{
          mb: 4,
          p: 4,
          borderRadius: 2,
          bgcolor: '#ffffff',
          boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, color: '#333' }}>
          {title}
        </Typography>
        {pendingItems.length > 0 ? (
          <TableContainer component={Paper} sx={{ borderRadius: 1, boxShadow: 0 }}>
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#e0e0e0' }}>
                  <TableCell sx={{ fontWeight: 'bold', color: '#555' }}>{type === 'Courses' ? 'Course Title' : 'User Name'}</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#555' }}>{type === 'Courses' ? 'Description' : 'Email'}</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold', color: '#555' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pendingItems.map((item) => (
                  <TableRow
                    key={item.userId || item.courseId}
                    sx={{
                      '&:nth-of-type(odd)': { backgroundColor: '#f9f9f9' },
                      '&:hover': { backgroundColor: '#f1f1f1' },
                    }}
                  >
                    <TableCell>{type === 'Courses' ? item.title : item.name}</TableCell>
                    <TableCell>{type === 'Courses' ? item.description : item.email}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="Approve">
                        <IconButton
                          color="success"
                          onClick={() => handleApprove(item.userId || item.courseId, type)}
                        >
                          <CheckCircleOutlineIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Reject">
                        <IconButton
                          color="error"
                          onClick={() => handleReject(item.userId || item.courseId, type)}
                        >
                          <CancelOutlinedIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography>No pending {title.toLowerCase()} for approval.</Typography>
        )}
      </Paper>
    );
  }
};

export default AdminDashboard;
