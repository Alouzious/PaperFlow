import React from 'react';
import './Footer.css'; // Import the CSS file

const Footer = ({ siteSettings, aboutData }) => {
  const website = aboutData?.website
    ? aboutData.website.startsWith('http')
      ? aboutData.website
      : `https://${aboutData.website}`
    : '#';

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-grid">
          
          {/* About Section */}
          <div className="footer-section">
            <h4 className="footer-title">About PaperFlow</h4>
            <p className="footer-description">
              PaperFlow helps institutions digitize and manage academic records securely and efficiently.
            </p>
          </div>

          {/* Quick Links Section */}
          <div className="footer-section">
            <h4 className="footer-title">Quick Links</h4>
            <ul className="footer-links">
              <li>
                <a href="/" className="footer-link">Home</a>
              </li>
              <li>
                <a href="#about" className="footer-link">About Us</a>
              </li>
              <li>
                <a href="#how-it-works" className="footer-link">How It Works</a>
              </li>
            </ul>
          </div>

          {/* Contact Info Section */}
          <div className="footer-section">
            <h4 className="footer-title">Contact Us</h4>
            
            <div className="contact-item">
              <div className="contact-icon">✉</div>
              <div className="contact-text">
                {siteSettings?.contact_email || 'info@paperflow.org'}
              </div>
            </div>
            
            <div className="contact-item">
              <div className="contact-icon">📞</div>
              <div className="contact-text">
                {siteSettings?.whatsapp_number || '+256-700-123-456'}
              </div>
            </div>
            
            {aboutData?.website && (
              <div className="contact-item">
                <div className="contact-icon">🌐</div>
                <div className="contact-text">
                  <a
                    href={website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="website-link"
                  >
                    <span>🌐</span> Visit Our Website
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Copyright Section */}
        <div className="footer-copyright">
          &copy; {new Date().getFullYear()} PaperFlow. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;