import React from 'react';
import './Footer.css'; // Import the CSS file

const Footer = ({ siteSettings, aboutData }) => {
  const website = aboutData?.website
    ? aboutData.website.startsWith('http')
      ? aboutData.website
      : `https://${aboutData.website}`
    : '#';

  return (
    <footer className="landing-footer">
      <div className="landing-footer-container">
        <div className="landing-footer-grid">
          
          {/* About Section */}
          <div className="landing-footer-section">
            <h4 className="landing-footer-title">About PaperFlow</h4>
            <p className="landing-footer-description">
              PaperFlow helps institutions digitize and manage academic records securely and efficiently.
            </p>
          </div>

          {/* Quick Links Section */}
          <div className="landing-footer-section">
            <h4 className="landing-footer-title">Quick Links</h4>
            <ul className="landing-footer-links">
              <li>
                <a href="/" className="landing-footer-link">Home</a>
              </li>
              <li>
                <a href="#about" className="landing-footer-link">About Us</a>
              </li>
              <li>
                <a href="#how-it-works" className="landing-footer-link">How It Works</a>
              </li>
            </ul>
          </div>

          {/* Contact Info Section */}
          <div className="landing-footer-section">
            <h4 className="landing-footer-title">Contact Us</h4>
            
            <div className="landing-contact-item">
              <div className="landing-contact-icon">✉</div>
              <div className="landing-contact-text">
                {siteSettings?.contact_email || 'info@paperflow.org'}
              </div>
            </div>
            
            <div className="landing-contact-item">
              <div className="landing-contact-icon">📞</div>
              <div className="landing-contact-text">
                {siteSettings?.whatsapp_number || '+256-700-123-456'}
              </div>
            </div>
            
            {aboutData?.website && (
              <div className="landing-contact-item">
                <div className="landing-contact-icon">🌐</div>
                <div className="landing-contact-text">
                  <a
                    href={website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="landing-website-link"
                  >
                    <span>🌐</span> Visit Our Website
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Copyright Section */}
        <div className="landing-footer-copyright">
          &copy; {new Date().getFullYear()} PaperFlow. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;