import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './About.css';

const About = () => {
  const [aboutData, setAboutData] = useState(null);
  const [steps, setSteps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [aboutRes, stepsRes] = await Promise.all([
          axios.get('http://localhost:8000/api/about-us/'),
          axios.get('http://localhost:8000/api/how-it-works/')
        ]);
        setAboutData(aboutRes.data);
        setSteps(stepsRes.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load content. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Function to get initials from name
  const getInitials = (name) => {
    if (!name || typeof name !== 'string') return '??';
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .substring(0, 2);
  };

  // Function to safely parse team members
  const parseTeamMembers = (teamMembers) => {
    if (!teamMembers) return [];
    
    if (typeof teamMembers === 'string') {
      return teamMembers.split(',').map(name => ({ name: name.trim(), role: '' }));
    }
    
    if (Array.isArray(teamMembers)) {
      return teamMembers.map(member => 
        typeof member === 'string' 
          ? { name: member.trim(), role: '' }
          : { name: member.name || 'Unknown', role: member.role || '' }
      );
    }
    
    return [];
  };

  // Retry function for failed requests
  const handleRetry = () => {
    setError(null);
    setLoading(true);
    // Re-trigger the useEffect by updating a dependency or call fetchData directly
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading content...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-icon">⚠️</div>
        <p>{error}</p>
        <button 
          onClick={handleRetry}
          className="retry-button"
        >
          Retry
        </button>
      </div>
    );
  }

  const teamMembers = parseTeamMembers(aboutData?.team_members);

  return (
    <div className="about-page" id = "about">
      {/* Compact Two-Column Layout */}
      <div className="container">
        <div className="two-column-layout">
          
          {/* LEFT COLUMN - ABOUT US */}
          <div className="left-column">
            <div className="about-section">
              <div className="section-header">
                <h2 className="section-title">About Us</h2>
                <div className="section-divider"></div>
              </div>
              
              <div className="about-content">
                <h3 className="about-subtitle">
                  {aboutData?.subtitle || 'Welcome to Our Company'}
                </h3>
                <p className="about-description">
                  {aboutData?.description || 'We are committed to providing excellent services and creating value for our customers.'}
                </p>
              </div>

              <div className="mission-vision-compact">
                <div className="mission-item">
                  <div className="item-icon">🎯</div>
                  <div className="item-content">
                    <h4>Mission</h4>
                    <p>{aboutData?.mission || 'To deliver exceptional value through innovation and excellence.'}</p>
                  </div>
                </div>

                <div className="vision-item">
                  <div className="item-icon">🚀</div>
                  <div className="item-content">
                    <h4>Vision</h4>
                    <p>{aboutData?.vision || 'To be a leading force in our industry, driving positive change.'}</p>
                  </div>
                </div>
              </div>

              {/* Team Section */}
              {teamMembers.length > 0 && (
                <div className="team-section-compact">
                  <h4 className="team-title">Our Team</h4>
                  <div className="team-list">
                    {teamMembers.slice(0, 6).map((member, index) => (
                      <div key={index} className="team-member">
                        <div className="member-avatar">
                          {getInitials(member.name)}
                        </div>
                        <div className="member-info">
                          <span className="member-name">{member.name}</span>
                          {member.role && <span className="member-role">{member.role}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Website Section - Now using CSS classes */}
              {aboutData?.website && (
                <div className="website-section">
                  <h4 className="website-title">
                    Know More About Us
                  </h4>
                  <p className="website-description">
                    Visit our website to learn more about our services and offerings
                  </p>
                  <a 
                    href={aboutData.website.startsWith('http') ? aboutData.website : `https://${aboutData.website}`}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="website-link"
                  >
                    <span>🌐</span>
                    Visit Our Website
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN - HOW IT WORKS */}
          <div className="right-column" id = "how-it-works">
            <div className="how-it-works-section">
              <div className="section-header">
                <h2 className="section-title">How It Works</h2>
                <div className="section-divider"></div>
              </div>
              
              <div className="steps-compact">
                {steps.length > 0 ? (
                  steps.slice(0, 4).map((step, index) => (
                    <div key={step.id || index} className="step-item">
                      <div className="step-number">
                        {step.step_number || index + 1}
                      </div>
                      <div className="step-content">
                        <h4 className="step-title">
                          {step.step_title || `Step ${index + 1}`}
                        </h4>
                        <p className="step-description">
                          {step.description || 'Description coming soon...'}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-steps-message">
                    <p>No steps available at the moment.</p>
                  </div>
                )}
              </div>
              
              {/* Feature Image */}
              {aboutData?.image && (
                <div className="feature-image">
                  <img 
                    src={aboutData.image} 
                    alt="How it works illustration"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      console.log('Image failed to load:', aboutData.image);
                    }}
                    loading="lazy"
                  />
                </div>
              )}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default About;