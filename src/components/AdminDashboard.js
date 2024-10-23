import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Button,Container,
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
      

    fetchPendingAccounts();
    fetchPendingCourses();
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
                  <TableCell sx={{ fontWeight: 'bold', color: '#555' }}>
                    {type === 'Courses' ? 'Course Title' : 'Name'}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#555' }}>
                    {type === 'Courses' ? 'Description' : 'Email'}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#555', textAlign: 'center' }}>
                    Actions
                  </TableCell>
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
