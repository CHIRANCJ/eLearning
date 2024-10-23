import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [passwordHash, setPasswordHash] = useState('');
  const [role, setRole] = useState('Student');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    const isActive = role === 'Admin' ? true : false;

    try {
      await axios.post('http://localhost:5145/api/Auth/register', {
        name: name,
        email: email,
        passwordHash: passwordHash,
        role: role,
        isActive: isActive,
      });

      setSuccess('Registration successful! Awaiting admin approval.');
      setError('');

      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      if (err.response) {
        const errorMessages = err.response.data.errors 
          ? Object.values(err.response.data.errors).flat().join(' ') 
          : 'Registration failed. Please try again.';
        setError(errorMessages);
      } else {
        setError('Network error occurred. Please try again later.');
      }
      setSuccess('');
    }
  };

  const styles = {
    container: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#f4f4f4',
    },
    card: {
      width: '400px',
      padding: '40px',
      backgroundColor: '#ffffff',
      borderRadius: '10px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', // Clean shadow
      textAlign: 'center',
      border: '1px solid #ddd',
    },
    title: {
      fontSize: '28px',
      fontWeight: '600',
      marginBottom: '25px',
      color: '#333',
      letterSpacing: '0.5px',
    },
    inputField: {
      width: '100%',
      padding: '12px',
      margin: '10px 0',
      borderRadius: '6px',
      border: '1px solid #ccc',
      fontSize: '16px',
      backgroundColor: '#fafafa',
    },
    button: {
      width: '100%',
      padding: '14px',
      backgroundColor: '#007bff', // Professional blue color
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      fontSize: '16px',
      fontWeight: 'bold',
      cursor: 'pointer',
      marginTop: '15px',
    },
    buttonHover: {
      backgroundColor: '#0056b3', // Darker blue on hover
    },
    errorText: {
      color: '#e74c3c',
      marginTop: '15px',
      fontSize: '14px',
    },
    successText: {
      color: '#27ae60',
      marginTop: '15px',
      fontSize: '14px',
    },
    selectField: {
      width: '100%',
      padding: '12px',
      margin: '10px 0',
      borderRadius: '6px',
      border: '1px solid #ccc',
      fontSize: '16px',
      backgroundColor: '#fafafa',
    },
    link: {
      marginTop: '15px',
      display: 'block',
      color: '#007bff',
      textDecoration: 'underline',
      cursor: 'pointer',
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>JOIN US</h2>
        <form onSubmit={handleRegister}>
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={styles.inputField}
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={styles.inputField}
          />
          <input
            type="password"
            placeholder="Password"
            value={passwordHash}
            onChange={(e) => setPasswordHash(e.target.value)}
            required
            style={styles.inputField}
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            style={styles.selectField}
          >
            <option value="Student">Student</option>
            <option value="Professor">Professor</option>
          </select>
          {error && <p style={styles.errorText}>{error}</p>}
          {success && <p style={styles.successText}>{success}</p>}
          <button
            type="submit"
            style={styles.button}
            onMouseOver={(e) => (e.target.style.backgroundColor = styles.buttonHover.backgroundColor)}
            onMouseOut={(e) => (e.target.style.backgroundColor = styles.button.backgroundColor)}
          >
            Register
          </button>
        </form>
        <a onClick={() => navigate('/')} style={styles.link}>
          Already have an account? Login
        </a>
      </div>
    </div>
  );
};

export default Register;
