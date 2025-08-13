// src/App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './Pages/Home';
import Dashboard from './Pages/Dashboard';
import FormPage from './Pages/FormPage';
import PaperPage from './Pages/PaperPage';
import About from './Pages/About'; // Add this import
import './App.css';

function App() {
  const [isRegistered, setIsRegistered] = useState(false);

  // Check registration status on app load
  useEffect(() => {
    const registrationStatus = localStorage.getItem('isRegistered');
    if (registrationStatus === 'true') {
      setIsRegistered(true);
    }
  }, []);

  const handleRegistration = () => {
    setIsRegistered(true);
    // The Form component already sets localStorage, so we just update state here
  };

  return (
    <div className="app-container">
      <Router basename={process.env.NODE_ENV === 'production' ? '/' : '/'}>
        <Routes>
          {/* Public routes */}
          <Route path="/form" element={<FormPage />} />
          <Route path="/about" element={<About />} />
          
          {/* Protected routes */}
          <Route
            path="/papers/:facultyCode/:courseCode"
            element={isRegistered ? <PaperPage /> : <Navigate to="/" replace />}
          />
          
          <Route
            path="/notes/:facultyCode/:courseCode"
            element={isRegistered ? <PaperPage /> : <Navigate to="/" replace />}
          />
          
          <Route
            path="/papers"
            element={isRegistered ? <PaperPage /> : <Navigate to="/" replace />}
          />
          
          <Route
            path="/dashboard"
            element={isRegistered ? <Dashboard /> : <Navigate to="/" replace />}
          />
          
          {/* Home route */}
          <Route
            path="/"
            element={isRegistered ? <Navigate to="/dashboard" replace /> : <Home onRegister={handleRegistration} />}
          />
          
          {/* Catch all route - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;