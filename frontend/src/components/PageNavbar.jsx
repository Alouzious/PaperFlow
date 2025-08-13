// src/components/Navbar.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './PageNavbar.css';

const Navbar = () => {
  const [siteSettings, setSiteSettings] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchSiteSettings = async () => {
      try {
        const res = await fetch('https://paperflow-backend.onrender.com/api/site-settings/');
        const data = await res.json();
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

  // Close mobile menu when window is resized to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 900 && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
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

  // Get student data from localStorage
  const getStudentData = () => {
    try {
      let studentData = localStorage.getItem('studentData');
      if (studentData) {
        return JSON.parse(studentData);
      }
      
      studentData = localStorage.getItem('student');
      if (studentData) {
        return JSON.parse(studentData);
      }
      
      return null;
    } catch (error) {
      console.error('Error parsing student data:', error);
      return null;
    }
  };

  const student = getStudentData();
  
  // Get avatar initials
  const getAvatarInitials = (fullName) => {
    if (!fullName) return '';
    
    const names = fullName.trim().split(' ');
    if (names.length === 1) {
      return names[0].substring(0, 2).toUpperCase();
    } else {
      return (names[0].charAt(0) + names[1].charAt(0)).toUpperCase();
    }
  };

  const avatarInitials = getAvatarInitials(student?.full_name);

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

  // Navigation links - FIXED: Better routing for React
  const navigationLinks = [
    { to: "/", label: "Faculties", hash: "#faculties" },
    { to: "/", label: "About", hash: "#about" },
    { to: "/", label: "Contact Us", hash: "#contact" },
    { to: "/help", label: "Help?" }
  ];

  // Handle navigation clicks with hash scrolling
  const handleNavClick = (link) => {
    closeMobileMenu();
    
    if (link.hash) {
      // Small delay to ensure menu closes first, then scroll
      setTimeout(() => {
        const element = document.querySelector(link.hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
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
        <ul className="navbar-links desktop-nav">
          {navigationLinks.map((link, index) => (
            <li key={`desktop-${index}`}>
              <Link 
                to={link.to}
                onClick={() => handleNavClick(link)}
              >
                {link.label}
              </Link>
            </li>
          ))}
          {student && (
            <li className="user-profile">
              <div className="user-info">
                <span className="avatar-circle">{avatarInitials}</span>
                <span className="user-name">{student.full_name}</span>
              </div>
            </li>
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
            {/* FIXED: Simplified mobile navigation structure */}
            <div className="mobile-navigation">
              {navigationLinks.map((link, index) => (
                <div key={`mobile-${index}`} className="mobile-nav-item">
                  <Link 
                    to={link.to}
                    onClick={() => handleNavClick(link)}
                    className="mobile-nav-link"
                  >
                    {link.label}
                  </Link>
                </div>
              ))}
              
              {student && (
                <div className="mobile-user-profile">
                  <div className="user-info">
                    <span className="avatar-circle">{avatarInitials}</span>
                    <span className="user-name">{student.full_name}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;