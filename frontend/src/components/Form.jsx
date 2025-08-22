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
  
  // Updated validation to reject strings with only spaces
  const validateFullName = (name) => {
    const trimmed = name.trim();
    return trimmed.length >= 2 && trimmed.length <= 50 && /^[a-zA-Z\s\-']+$/.test(trimmed) && trimmed !== '';
  };
  
  const sanitizeInput = (input) => input.replace(/[<>\"'&]/g, '');

  const validateForm = () => {
    const newErrors = {};
    
    // Check if full name is just spaces or empty
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (!validateFullName(formData.fullName)) {
      newErrors.fullName = 'Please enter a valid full name (2–50 letters)';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Enter a valid email';
    }

    // Check if course is just spaces or empty
    if (!formData.course.trim()) {
      newErrors.course = 'Course is required';
    } else if (formData.course.trim().length < 2) {
      newErrors.course = 'Course must be at least 2 characters';
    }

    if (!formData.year.trim()) {
      newErrors.year = 'Year is required';
    } else if (!/^\d{4}$/.test(formData.year) || +formData.year < 1900 || +formData.year > new Date().getFullYear() + 10) {
      newErrors.year = 'Enter a valid year';
    }

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

  // Fixed handleSubmit - removed loading state display
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Set loading but don't show it in UI
    setIsLoading(true);

    const sanitizedData = {
      full_name: sanitizeInput(formData.fullName.trim()),
      email: sanitizeInput(formData.email.trim()).toLowerCase(),
      course: sanitizeInput(formData.course.trim()),
      year: sanitizeInput(formData.year.trim()),
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
        // Simulate successful registration for demo
        console.log('Registration successful:', result);
        // Redirect immediately without showing loading state
        window.location.href = '/dashboard'; // Change this to your actual dashboard URL
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
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      width: '100%',
      overflowX: 'hidden'
    }}>
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '40px',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{
          marginBottom: '32px',
          textAlign: 'center'
        }}>
          <h2 style={{
            color: '#2d3748',
            fontSize: '2.25rem',
            fontWeight: '700',
            marginBottom: '8px'
          }}>Student Registration</h2>
          <p style={{
            color: '#718096',
            fontSize: '1.1rem'
          }}>Please fill in your information to register</p>
        </div>

        <div style={{
          maxWidth: '400px',
          margin: '0 auto',
          width: '100%'
        }}>
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              color: '#2d3748',
              fontWeight: '600',
              fontSize: '0.95rem'
            }}>Full Name *</label>
            <input
              name="fullName"
              type="text"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Enter your full name"
              autoComplete="name"
              inputMode="text"
              style={{
                width: '100%',
                padding: '14px 16px',
                border: `2px solid ${errors.fullName ? '#e53e3e' : '#e2e8f0'}`,
                borderRadius: '12px',
                fontSize: '1rem',
                background: 'white',
                boxSizing: 'border-box',
                transition: 'all 0.3s ease',
                outline: 'none',
                boxShadow: errors.fullName ? '0 0 0 3px rgba(229, 62, 62, 0.1)' : 'none',
                WebkitAppearance: 'none', // Fix iOS styling
                appearance: 'none'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#667eea';
                e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                e.target.style.transform = 'translateY(-1px)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = errors.fullName ? '#e53e3e' : '#e2e8f0';
                e.target.style.boxShadow = errors.fullName ? '0 0 0 3px rgba(229, 62, 62, 0.1)' : 'none';
                e.target.style.transform = 'none';
              }}
            />
            {errors.fullName && (
              <span style={{
                color: '#e53e3e',
                fontSize: '0.875rem',
                marginTop: '6px',
                display: 'block',
                fontWeight: '500'
              }}>{errors.fullName}</span>
            )}
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              color: '#2d3748',
              fontWeight: '600',
              fontSize: '0.95rem'
            }}>Email Address *</label>
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email address"
              autoComplete="email"
              inputMode="email"
              style={{
                width: '100%',
                padding: '14px 16px',
                border: `2px solid ${errors.email ? '#e53e3e' : '#e2e8f0'}`,
                borderRadius: '12px',
                fontSize: '1rem',
                background: 'white',
                boxSizing: 'border-box',
                transition: 'all 0.3s ease',
                outline: 'none',
                boxShadow: errors.email ? '0 0 0 3px rgba(229, 62, 62, 0.1)' : 'none',
                WebkitAppearance: 'none',
                appearance: 'none'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#667eea';
                e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                e.target.style.transform = 'translateY(-1px)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = errors.email ? '#e53e3e' : '#e2e8f0';
                e.target.style.boxShadow = errors.email ? '0 0 0 3px rgba(229, 62, 62, 0.1)' : 'none';
                e.target.style.transform = 'none';
              }}
            />
            {errors.email && (
              <span style={{
                color: '#e53e3e',
                fontSize: '0.875rem',
                marginTop: '6px',
                display: 'block',
                fontWeight: '500'
              }}>{errors.email}</span>
            )}
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              color: '#2d3748',
              fontWeight: '600',
              fontSize: '0.95rem'
            }}>Course *</label>
            <input
              name="course"
              type="text"
              value={formData.course}
              onChange={handleChange}
              placeholder="e.g. BCS, BIT"
              autoComplete="off"
              inputMode="text"
              style={{
                width: '100%',
                padding: '14px 16px',
                border: `2px solid ${errors.course ? '#e53e3e' : '#e2e8f0'}`,
                borderRadius: '12px',
                fontSize: '1rem',
                background: 'white',
                boxSizing: 'border-box',
                transition: 'all 0.3s ease',
                outline: 'none',
                boxShadow: errors.course ? '0 0 0 3px rgba(229, 62, 62, 0.1)' : 'none',
                WebkitAppearance: 'none',
                appearance: 'none'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#667eea';
                e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                e.target.style.transform = 'translateY(-1px)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = errors.course ? '#e53e3e' : '#e2e8f0';
                e.target.style.boxShadow = errors.course ? '0 0 0 3px rgba(229, 62, 62, 0.1)' : 'none';
                e.target.style.transform = 'none';
              }}
            />
            {errors.course && (
              <span style={{
                color: '#e53e3e',
                fontSize: '0.875rem',
                marginTop: '6px',
                display: 'block',
                fontWeight: '500'
              }}>{errors.course}</span>
            )}
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              color: '#2d3748',
              fontWeight: '600',
              fontSize: '0.95rem'
            }}>Year *</label>
            <input
              name="year"
              type="number"
              value={formData.year}
              onChange={handleChange}
              placeholder="e.g. 2024"
              inputMode="numeric"
              style={{
                width: '100%',
                padding: '14px 16px',
                border: `2px solid ${errors.year ? '#e53e3e' : '#e2e8f0'}`,
                borderRadius: '12px',
                fontSize: '1rem',
                background: 'white',
                boxSizing: 'border-box',
                transition: 'all 0.3s ease',
                outline: 'none',
                boxShadow: errors.year ? '0 0 0 3px rgba(229, 62, 62, 0.1)' : 'none',
                WebkitAppearance: 'none',
                appearance: 'none'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#667eea';
                e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                e.target.style.transform = 'translateY(-1px)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = errors.year ? '#e53e3e' : '#e2e8f0';
                e.target.style.boxShadow = errors.year ? '0 0 0 3px rgba(229, 62, 62, 0.1)' : 'none';
                e.target.style.transform = 'none';
              }}
            />
            {errors.year && (
              <span style={{
                color: '#e53e3e',
                fontSize: '0.875rem',
                marginTop: '6px',
                display: 'block',
                fontWeight: '500'
              }}>{errors.year}</span>
            )}
          </div>

          {errors.submit && (
            <div style={{
              background: '#fed7d7',
              color: '#c53030',
              padding: '12px 16px',
              borderRadius: '8px',
              marginBottom: '20px',
              fontWeight: '500',
              textAlign: 'center'
            }}>
              {errors.submit}
            </div>
          )}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
            style={{
              width: '100%',
              height: '56px',
              padding: '0 16px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '1.1rem',
              fontWeight: '600',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
              transition: 'all 0.3s ease',
              opacity: isLoading ? 0.8 : 1,
              minHeight: '56px',
              maxHeight: '56px',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading) {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)';
              }
            }}
          >
            Register Now
          </button>
        </div>
      </div>
    </div>
  );
}

export default Form;