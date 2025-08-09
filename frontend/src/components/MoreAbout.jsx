import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './MoreAbout.css';

const About = () => {
  const [aboutData, setAboutData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch About Us data on mount
  useEffect(() => {
    const fetchAboutData = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:8000/api/about-us/');
        setAboutData(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching About Us data:', err);
        setError('Failed to load About Us content. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchAboutData();
  }, []);

  // Function to get initials from name for team member avatars
  const getInitials = (name) => {
    if (!name || typeof name !== 'string') return '??';
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .substring(0, 2);
  };

  // Function to safely parse team members (handles different data formats)
  const parseTeamMembers = (teamMembers) => {
    if (!teamMembers) return [];
    
    // If it's a string (comma-separated names)
    if (typeof teamMembers === 'string') {
      return teamMembers.split(',').map(name => ({ 
        name: name.trim(), 
        role: '' 
      }));
    }
    
    // If it's already an array
    if (Array.isArray(teamMembers)) {
      return teamMembers.map(member => 
        typeof member === 'string' 
          ? { name: member.trim(), role: '' }
          : { 
              name: member.name || 'Unknown', 
              role: member.role || '',
              email: member.email || '',
              bio: member.bio || ''
            }
      );
    }
    
    return [];
  };

  // Retry function for failed requests
  const handleRetry = () => {
    setError(null);
    setLoading(true);
    // Re-fetch data
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/about-us/');
        setAboutData(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to load About Us content. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  };

  // Loading state
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading About Us content...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="error-container">
        <div className="error-icon">⚠️</div>
        <p>{error}</p>
        <button 
          onClick={handleRetry}
          className="retry-button"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Parse team members safely
  const teamMembers = parseTeamMembers(aboutData?.team_members);

  return (
    <div className="about-page" id="about">
      <div className="container">
        
        {/* Hero Section */}
        <div className="about-hero">
          <div className="hero-content">
            <h1 className="main-title">
              {aboutData?.title || 'About Us'}
            </h1>
            <p className="hero-description">
              {aboutData?.description || 
                'We are committed to providing excellent services and creating value for our customers through innovation, dedication, and excellence.'}
            </p>
          </div>
          
        </div>

        {/* Mission & Vision Section */}
        <div className="mission-vision-section">
          <div className="section-header">
            <h2 className="section-title">Our Purpose</h2>
            <div className="section-divider"></div>
          </div>
          
          <div className="mission-vision-grid">
            <div className="mission-card">
              <div className="card-icon">🎯</div>
              <h3 className="card-title">Our Mission</h3>
              <p className="card-description">
                {aboutData?.mission || 
                  'To deliver exceptional value through innovation, quality service, and unwavering commitment to our customers\' success.'}
              </p>
            </div>

            <div className="vision-card">
              <div className="card-icon">🚀</div>
              <h3 className="card-title">Our Vision</h3>
              <p className="card-description">
                {aboutData?.vision || 
                  'To be a leading force in our industry, driving positive change and setting new standards of excellence.'}
              </p>
            </div>
          </div>
        </div>

        {/* Values Section (if available) */}
        {aboutData?.values && (
          <div className="values-section">
            <div className="section-header">
              <h2 className="section-title">Our Values</h2>
              <div className="section-divider"></div>
            </div>
            <div className="values-grid">
              {Array.isArray(aboutData.values) ? (
                aboutData.values.map((value, index) => (
                  <div key={index} className="value-item">
                    <h4 className="value-title">{value.title || `Value ${index + 1}`}</h4>
                    <p className="value-description">{value.description || value}</p>
                  </div>
                ))
              ) : (
                <p className="values-text">{aboutData.values}</p>
              )}
            </div>
          </div>
        )}

        {/* Team Section */}
        {teamMembers.length > 0 && (
          <div className="team-section">
            <div className="section-header">
              <h2 className="section-title">Meet Our Team</h2>
              <div className="section-divider"></div>
              <p className="section-subtitle">
                The passionate individuals behind our success
              </p>
            </div>
            
            <div className="team-grid">
              {teamMembers.map((member, index) => (
                <div key={index} className="team-member-card">
                  <div className="member-avatar">
                    {member.image ? (
                      <img 
                        src={member.image} 
                        alt={member.name}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className="avatar-fallback" style={{display: member.image ? 'none' : 'flex'}}>
                      {getInitials(member.name)}
                    </div>
                  </div>
                  <div className="member-info">
                    <h4 className="member-name">{member.name}</h4>
                    {member.role && (
                      <span className="member-role">{member.role}</span>
                    )}
                    {member.bio && (
                      <p className="member-bio">{member.bio}</p>
                    )}
                    {member.email && (
                      <a href={`mailto:${member.email}`} className="member-email">
                        📧 {member.email}
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Statistics Section (if available) */}
        {aboutData?.statistics && (
          <div className="statistics-section">
            <div className="section-header">
              <h2 className="section-title">Our Impact</h2>
              <div className="section-divider"></div>
            </div>
            <div className="stats-grid">
              {Array.isArray(aboutData.statistics) ? (
                aboutData.statistics.map((stat, index) => (
                  <div key={index} className="stat-item">
                    <div className="stat-number">{stat.value || stat.number}</div>
                    <div className="stat-label">{stat.label || stat.title}</div>
                  </div>
                ))
              ) : (
                <div className="stats-text">{aboutData.statistics}</div>
              )}
            </div>
          </div>
        )}

        {/* Contact/Website Section */}
        <div className="contact-section">
          <div className="section-header">
            <h2 className="section-title">Connect With Us</h2>
            <div className="section-divider"></div>
          </div>
          
          <div className="contact-content">
            {aboutData?.website && (
              <div className="website-card">
                <div className="contact-icon">🌐</div>
                <h3>Visit Our Website</h3>
                <p>Learn more about our services and stay updated with our latest news</p>
                <a 
                  href={aboutData.website.startsWith('http') ? aboutData.website : `https://${aboutData.website}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="website-button"
                >
                  Visit Website
                </a>
              </div>
            )}

            {aboutData?.email && (
              <div className="email-card">
                <div className="contact-icon">📧</div>
                <h3>Email Us</h3>
                <p>Get in touch with our team for any inquiries or support</p>
                <a 
                  href={`mailto:${aboutData.email}`}
                  className="email-button"
                >
                  {aboutData.email}
                </a>
              </div>
            )}

            {aboutData?.phone && (
              <div className="phone-card">
                <div className="contact-icon">📞</div>
                <h3>Call Us</h3>
                <p>Speak directly with our team for immediate assistance</p>
                <a 
                  href={`tel:${aboutData.phone}`}
                  className="phone-button"
                >
                  {aboutData.phone}
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Additional Info Section */}
        {(aboutData?.founded_year || aboutData?.location || aboutData?.company_size) && (
          <div className="company-info-section">
            <div className="section-header">
              <h2 className="section-title">Company Information</h2>
              <div className="section-divider"></div>
            </div>
            
            <div className="company-info-grid">
              {aboutData.founded_year && (
                <div className="info-item">
                  <span className="info-label">Founded</span>
                  <span className="info-value">{aboutData.founded_year}</span>
                </div>
              )}
              
              {aboutData.location && (
                <div className="info-item">
                  <span className="info-label">Location</span>
                  <span className="info-value">{aboutData.location}</span>
                </div>
              )}
              
              {aboutData.company_size && (
                <div className="info-item">
                  <span className="info-label">Team Size</span>
                  <span className="info-value">{aboutData.company_size}</span>
                </div>
              )}
            </div>
          </div>
        )}
        
      </div>
    </div>
  );
};

export default About;