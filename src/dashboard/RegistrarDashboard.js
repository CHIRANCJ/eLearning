import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Card, CardContent, Button, CircularProgress, Grid, Alert } from '@mui/material';
import axios from 'axios';

const RegistrarDashboard = () => {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [pendingCourses, setPendingCourses] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingAllUsers, setLoadingAllUsers] = useState(true);
  const [error, setError] = useState('');

  const getToken = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Token is missing. Please log in.');
      return null;
    }
    return token;
  };

  // Fetch pending users
  useEffect(() => {
    const token = getToken();
    if (!token) return;

    setError('');
    axios.get('http://localhost:5116/api/registrar/users', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(response => {
        setPendingUsers(response.data);
        setLoadingUsers(false);
      })
      .catch(error => {
        handleAuthError(error);
        setLoadingUsers(false);
      });
  }, []);

  // Fetch pending courses
  useEffect(() => {
    const token = getToken();
    if (!token) return;

    setError('');
    axios.get('http://localhost:5116/api/registrar/courses', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(response => {
        setPendingCourses(response.data);
        setLoadingCourses(false);
      })
      .catch(error => {
        handleAuthError(error);
        setLoadingCourses(false);
      });
  }, []);

  // Fetch all users
  useEffect(() => {
    const token = getToken();
    if (!token) return;

    setError('');
    axios.get('http://localhost:5116/api/registrar/all-users', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(response => {
        setAllUsers(response.data);
        setLoadingAllUsers(false);
      })
      .catch(error => {
        handleAuthError(error);
        setLoadingAllUsers(false);
      });
  }, []);

  const handleAuthError = (error) => {
    if (error.response && error.response.status === 401) {
      setError('Session expired. Please log in again.');
      localStorage.removeItem('token');
      window.location.href = '/login';
    } else {
      setError('Error: ' + error.message);
    }
  };

  // Approve user
  const handleApproveUser = (userId) => {
    axios.put(`http://localhost:5116/api/registrar/approve-user/${userId}`, {}, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(() => {
        setPendingUsers(pendingUsers.filter(user => user.userId !== userId));
      })
      .catch(() => {
        setError(`Error approving user.`);
      });
  };

  // Reject user
  const handleRejectUser = (userId) => {
    axios.put(`http://localhost:5116/api/registrar/reject-user/${userId}`, {}, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(() => {
        setPendingUsers(pendingUsers.filter(user => user.userId !== userId));
      })
      .catch(() => {
        setError(`Error rejecting user.`);
      });
  };

  // Suspend/Enable user
  const handleSuspendEnableUser = (userId, isActive) => {
    const action = isActive ? 'suspend' : 'enable'; 
    axios.put(`http://localhost:5116/api/registrar/${action}-user/${userId}`, {}, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(() => {
        setAllUsers(allUsers.map(user =>
          user.userId === userId ? { ...user, isActive: !isActive } : user
        ));
      })
      .catch(() => {
        setError(`Error updating user status`);
      });
  };

  return (
    <Container>
      <Box my={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Registrar Dashboard
        </Typography>

        {error && <Alert severity="error">{error}</Alert>}

        {/* Pending Users for Approval */}
        <Typography variant="h5" component="h2" gutterBottom>
          Pending User Approvals
        </Typography>
        {loadingUsers ? (
          <Box display="flex" justifyContent="center" my={2}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {pendingUsers.length === 0 ? (
              <Typography>No users awaiting approval</Typography>
            ) : (
              pendingUsers.map(user => (
                <Grid item xs={12} sm={6} md={4} key={user.userId}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6">{user.name}</Typography>
                      <Typography variant="body2" color="textSecondary">Role: {user.role}</Typography>
                      <Typography variant="body2" color="textSecondary">Email: {user.email}</Typography>
                      <Box mt={2}>
                        <Button variant="contained" color="primary" onClick={() => handleApproveUser(user.userId)}>
                          Approve
                        </Button>
                        <Button variant="contained" color="secondary" onClick={() => handleRejectUser(user.userId)} style={{ marginLeft: '10px' }}>
                          Reject
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))
            )}
          </Grid>
        )}

        {/* All Users with Suspend/Enable Option */}
        <Box my={4}>
          <Typography variant="h5" component="h2" gutterBottom>
            View All Users
          </Typography>
          {loadingAllUsers ? (
            <Box display="flex" justifyContent="center" my={2}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={3}>
              {allUsers.length === 0 ? (
                <Typography>No users found</Typography>
              ) : (
                allUsers.map(user => (
                  <Grid item xs={12} sm={6} md={4} key={user.userId}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6">{user.name}</Typography>
                        <Typography variant="body2" color="textSecondary">Role: {user.role}</Typography>
                        <Typography variant="body2" color="textSecondary">Email: {user.email}</Typography>
                        <Box mt={2}>
                          <Button variant="contained" color={user.isActive ? 'secondary' : 'primary'} onClick={() => handleSuspendEnableUser(user.userId, user.isActive)}>
                            {user.isActive ? 'Suspend' : 'Enable'}
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))
              )}
            </Grid>
          )}
        </Box>
      </Box>
    </Container>
  );
};

export default RegistrarDashboard;
