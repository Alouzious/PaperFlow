import React, { useState } from 'react';

function Form() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    course: '',
    year: '',
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const getCookie = (name) => {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.substring(0, name.length + 1) === (name + '=')) {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  };

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validateFullName = (name) => /^[a-zA-Z\s\-']{2,50}$/.test(name.trim());
  const sanitizeInput = (input) => input.trim().replace(/[<>\"'&]/g, '');

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    else if (!validateFullName(formData.fullName)) newErrors.fullName = 'Please enter a valid full name (2–50 letters)';

    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!validateEmail(formData.email)) newErrors.email = 'Enter a valid email';

    if (!formData.course.trim()) newErrors.course = 'Course is required';
    else if (formData.course.trim().length < 2) newErrors.course = 'Course must be at least 2 characters';

    if (!formData.year.trim()) newErrors.year = 'Year is required';
    else if (!/^\d{4}$/.test(formData.year) || +formData.year < 1900 || +formData.year > new Date().getFullYear() + 10)
      newErrors.year = 'Enter a valid year';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const sanitized = sanitizeInput(value);
    setFormData({ ...formData, [name]: sanitized });

    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    const sanitizedData = {
      full_name: sanitizeInput(formData.fullName),
      email: sanitizeInput(formData.email).toLowerCase(),
      course: sanitizeInput(formData.course),
      year: sanitizeInput(formData.year),
    };

    try {
      const response = await fetch('https://paperflow-backend.onrender.com/api/check_or_register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCookie('csrftoken'),
        },
        body: JSON.stringify(sanitizedData),
      });

      const result = await response.json();

      if (response.ok) {
        localStorage.setItem('isRegistered', 'true');
        localStorage.setItem('studentId', result.student.id);
        localStorage.setItem('studentData', JSON.stringify(result.student));
        window.location.href = '/dashboard';
      } else if (response.status === 400 && result?.email) {
        setErrors({ email: result.email[0] });
      } else {
        setErrors({ submit: result.detail || 'Registration failed. Try again.' });
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrors({ submit: 'Network error. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="registration-container">
      <div className="form-section">
        <div className="form-header">
          <h2>Student Registration</h2>
          <p>Please fill in your information to register</p>
        </div>

        <form onSubmit={handleSubmit} className="registration-form" noValidate>
          <div className="input-group">
            <label htmlFor="fullName">Full Name *</label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Enter your full name"
              className={errors.fullName ? 'error' : ''}
            />
            {errors.fullName && <span className="error-message">{errors.fullName}</span>}
          </div>

          <div className="input-group">
            <label htmlFor="email">Email Address *</label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email address"
              className={errors.email ? 'error' : ''}
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          <div className="input-group">
            <label htmlFor="course">Course *</label>
            <input
              id="course"
              name="course"
              type="text"
              value={formData.course}
              onChange={handleChange}
              placeholder="e.g. BCS, BIT"
              className={errors.course ? 'error' : ''}
            />
            {errors.course && <span className="error-message">{errors.course}</span>}
          </div>

          <div className="input-group">
            <label htmlFor="year">Year *</label>
            <input
              id="year"
              name="year"
              type="number"
              value={formData.year}
              onChange={handleChange}
              placeholder="e.g. 2024"
              className={errors.year ? 'error' : ''}
            />
            {errors.year && <span className="error-message">{errors.year}</span>}
          </div>

          {errors.submit && <div className="submit-error">{errors.submit}</div>}

          <button type="submit" className={`submit-btn ${isLoading ? 'loading' : ''}`} disabled={isLoading}>
            {isLoading ? 'Registering...' : 'Register Now'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Form;
