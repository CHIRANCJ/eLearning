import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5145/api/Auth/login', {
                email,
                password,
            });

            // Extract token, role, username, and userId from the response
            const { token, role, username, userId } = response.data;

            // Store the token, username, userId, and email in localStorage
            localStorage.setItem('token', token);
            localStorage.setItem('username', username);
            localStorage.setItem('userId', userId);
            localStorage.setItem('email', email);
            localStorage.setItem('role', role);

            // Navigate to different dashboards based on the role
            if (role === 'Admin') {
                navigate('/admin-dashboard');
            } else if (role === 'Professor') {
                navigate('/professor-dashboard');
            } else {
                navigate('/student-dashboard');
            }
        } catch (err) {
            setError('Invalid credentials or your account has not been approved.');
        }
    };

    const handleCreateAccount = () => {
        navigate('/register');
    };

    return (
        <div style={styles.container}>
            
            <div style={styles.card}>
                <h2 style={styles.heading}>Welcome Back!</h2>
                <p style={styles.subheading}>Sign in to your account</p>
                <form onSubmit={handleLogin} style={styles.form}>
                    <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={styles.input}
                    />
                    <input
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={styles.input}
                    />
                    <button type="submit" style={styles.button}>
                        Sign In
                    </button>
                </form>
                {error && <p style={styles.error}>{error}</p>}
                <div style={styles.createAccountContainer}>
                    <p>Don't have an account?</p>
                    <button onClick={handleCreateAccount} style={styles.createAccountButton}>
                        Join the Community
                    </button>
                </div>
            </div>
        </div>
    );
};


const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f0f4f8',
        padding: '20px',
        fontFamily: 'Arial, sans-serif',
    },
    card: {
        backgroundColor: '#ffffff',
        padding: '50px',
        borderRadius: '12px',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
        width: '100%',
        maxWidth: '400px',
        textAlign: 'center',
        transition: 'all 0.3s ease',
    },
    heading: {
        marginBottom: '10px',
        fontSize: '28px',
        fontWeight: '700',
        color: '#2b3f5c',
    },
    subheading: {
        fontSize: '16px',
        color: '#8898aa',
        marginBottom: '30px',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
    },
    input: {
        padding: '15px',
        margin: '12px 0',
        borderRadius: '8px',
        border: '1px solid #e2e8f0',
        fontSize: '16px',
        backgroundColor: '#f7fafc',
        transition: 'border 0.2s ease-in-out',
        boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.05)',
    },
    inputFocus: {
        border: '1px solid #4299e1',
    },
    button: {
        padding: '15px',
        marginTop: '20px',
        borderRadius: '8px',
        backgroundColor: '#3182ce',
        color: '#ffffff',
        border: 'none',
        fontSize: '16px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'background-color 0.3s ease',
    },
    buttonHover: {
        backgroundColor: '#2b6cb0',
    },
    error: {
        color: 'red',
        marginTop: '15px',
        fontSize: '14px',
        fontStyle: 'italic',
    },
    createAccountContainer: {
        marginTop: '20px',
    },
    createAccountButton: {
        padding: '15px',
        borderRadius: '8px',
        backgroundColor: '#3182ce',
        color: '#fff',
        border: 'none',
        cursor: 'pointer',
        fontSize: '16px',
        fontWeight: '600',
        transition: 'background-color 0.3s ease',
    },
    createAccountButtonHover: {
        backgroundColor: '#2b6cb0',
    },
};

export default Login;
