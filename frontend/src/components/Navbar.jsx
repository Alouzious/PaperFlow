// src/components/Navbar.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ isRegistered }) => {
  const [siteSettings, setSiteSettings] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchSiteSettings = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/site-settings/');
        const data = await res.json();
        console.log('siteSettings:', data);
        setSiteSettings(data);
      } catch (error) {
        console.error('Failed to fetch site settings:', error);
      }
    };

    fetchSiteSettings();
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobileMenuOpen && !event.target.closest('.mobile-menu') && !event.target.closest('.mobile-menu-toggle')) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileMenuOpen]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleLinkClick = () => {
    closeMobileMenu();
  };

  const student = JSON.parse(localStorage.getItem('student'));
  const firstLetter = student?.full_name?.charAt(0).toUpperCase() || '';

  const renderSiteName = () => {
    const siteName = siteSettings?.site_name || 'PaperFlow';
    
    if (siteName === 'PaperFlow') {
      return (
        <>
          <span className="site-name-first">Paper</span>
          <span className="site-name-second">Flow</span>
        </>
      );
    }
    
    // For other site names, split by space and apply colors
    const words = siteName.split(' ');
    if (words.length >= 2) {
      return (
        <>
          <span className="site-name-first">{words[0]}</span>
          <span className="site-name-second">{words.slice(1).join(' ')}</span>
        </>
      );
    }
    
    return <span className="site-name-second">{siteName}</span>;
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          {siteSettings?.site_logo && (
            <img
              src={siteSettings.site_logo}
              alt={`${siteSettings?.site_name || 'MyApp'} Logo`}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          )}
          <Link to="/" className="site-name" onClick={handleLinkClick}>
            {renderSiteName()}
          </Link>
        </div>

        {/* Desktop Navigation */}
        <ul className="navbar-links">
          {isRegistered ? (
            <>
              <li>
                <Link to="/faculty">Faculty</Link>
              </li>
              <li>
                <Link to="/about">About</Link>
              </li>
              <li>
                <Link to="/contact">Contact Us</Link>
              </li>
              <li>
                <Link to="/help">Help?</Link>
              </li>
              <li className="user-profile">
                <div className="user-info">
                  <span className="avatar-circle">{firstLetter}</span>
                  <span className="user-name">{student?.full_name}</span>
                </div>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <a href="#about">About</a>
              </li>
              <li>
                <a href="#how-it-works">How It Works</a>
              </li>
            </>
          )}
        </ul>

        {/* Mobile Menu Toggle */}
        <button
          className={`mobile-menu-toggle ${isMobileMenuOpen ? 'active' : ''}`}
          onClick={toggleMobileMenu}
          aria-label="Toggle mobile menu"
          aria-expanded={isMobileMenuOpen}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Mobile Menu Overlay */}
        <div
          className={`mobile-menu-overlay ${isMobileMenuOpen ? 'active' : ''}`}
          onClick={closeMobileMenu}
        ></div>

        {/* Mobile Menu */}
        <div className={`mobile-menu ${isMobileMenuOpen ? 'active' : ''}`}>
          <div className="mobile-menu-content">
            <ul className="navbar-links">
              {isRegistered ? (
                <>
                  <li>
                    <Link to="/dashboard" onClick={handleLinkClick}>
                      Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link to="/faculty" onClick={handleLinkClick}>
                      Faculty
                    </Link>
                  </li>
                  <li>
                    <Link to="/about" onClick={handleLinkClick}>
                      About
                    </Link>
                  </li>
                  <li>
                    <Link to="/contact" onClick={handleLinkClick}>
                      Contact Us
                    </Link>
                  </li>
                  <li>
                    <Link to="/help" onClick={handleLinkClick}>
                      Help?
                    </Link>
                  </li>
                  <li className="mobile-user-profile">
                    <div className="user-info">
                      <span className="avatar-circle">{firstLetter}</span>
                      <span className="user-name">{student?.full_name}</span>
                    </div>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link to="/" onClick={handleLinkClick}>
                      Home
                    </Link>
                  </li>
                  <li>
                    <a href="#about" onClick={handleLinkClick}>
                      About
                    </a>
                  </li>
                  <li>
                    <a href="#how-it-works" onClick={handleLinkClick}>
                      How It Works
                    </a>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;