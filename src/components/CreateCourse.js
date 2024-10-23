import React, { useState } from 'react';
import axios from 'axios';

const CreateCourse = () => {
    const username = localStorage.getItem('username');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [price, setPrice] = useState('');
    const [content, setContent] = useState('');
    const [message, setMessage] = useState('');

    const handleCreateCourse = async () => {
        try {
            const course = {
                title,
                description,
                startDate,
                endDate,
                price,
                professorId: username,
                content,
            };

            const response = await axios.post('http://localhost:5145/api/Courses', course);

            if (response.status === 201) {
                setMessage('Course created successfully and pending approval!');
                clearForm();
            } else {
                setMessage('Failed to create the course. Please try again.');
            }
        } catch (error) {
            console.error('Error creating course:', error);
            setMessage('An error occurred. Please try again.');
        }
    };

    const clearForm = () => {
        setTitle('');
        setDescription('');
        setStartDate('');
        setEndDate('');
        setPrice('');
        setContent('');
    };

    return (
        <div style={styles.container}>
            <h2 style={styles.heading}>Create a Course</h2>

            {message && <p style={styles.message}>{message}</p>}

            <div style={styles.courseForm}>
                <label style={styles.label}>Course Title:</label>
                <input
                    style={styles.input}
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter course title"
                />

                <label style={styles.label}>Description:</label>
                <textarea
                    style={styles.textArea}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter course description"
                ></textarea>

                <div style={styles.dateContainer}>
                    <div style={styles.dateInput}>
                        <label style={styles.label}>Start Date:</label>
                        <input
                            style={styles.input}
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </div>
                    <div style={styles.dateInput}>
                        <label style={styles.label}>End Date:</label>
                        <input
                            style={styles.input}
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>
                </div>

                <label style={styles.label}>Price (in USD):</label>
                <input
                    style={styles.input}
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="Enter course price"
                />

                <label style={styles.label}>Course Content:</label>
                <textarea
                    style={styles.textArea}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Enter course content"
                ></textarea>

                <button style={styles.createButton} onClick={handleCreateCourse}>
                    Create Course
                </button>
            </div>
        </div>
    );
};

const styles = {
    container: {
        padding: '40px',
        fontFamily: 'Arial, sans-serif',
        backgroundColor: '#eef2f3',
        maxWidth: '700px',
        margin: '20px auto',
        borderRadius: '10px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
    },
    heading: {
        fontSize: '28px',
        color: '#2c3e50',
        marginBottom: '20px',
        textAlign: 'center',
    },
    courseForm: {
        backgroundColor: '#fff',
        padding: '30px',
        borderRadius: '10px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    },
    label: {
        display: 'block',
        marginBottom: '6px',
        fontSize: '16px',
        color: '#34495e',
    },
    input: {
        width: '100%',
        padding: '12px',
        marginBottom: '15px',
        borderRadius: '5px',
        border: '1px solid #bdc3c7',
        fontSize: '14px',
        transition: 'border-color 0.3s',
    },
    inputFocus: {
        borderColor: '#3498db',
    },
    textArea: {
        width: '100%',
        padding: '12px',
        minHeight: '120px',
        marginBottom: '15px',
        borderRadius: '5px',
        border: '1px solid #bdc3c7',
        fontSize: '14px',
        transition: 'border-color 0.3s',
    },
    createButton: {
        padding: '12px 20px',
        backgroundColor: '#3498db',
        color: '#fff',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '16px',
        transition: 'background-color 0.3s',
    },
    createButtonHover: {
        backgroundColor: '#2980b9',
    },
    dateContainer: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '15px',
    },
    dateInput: {
        flex: '1',
        marginRight: '10px',
    },
    message: {
        marginBottom: '20px',
        color: '#e74c3c',
        textAlign: 'center',
    },
};

export default CreateCourse;
