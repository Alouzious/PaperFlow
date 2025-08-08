import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './Hero-section.css';

const HeroSection = () => {
  const [siteSettings, setSiteSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const fetchSiteSettings = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/site-settings/');
        const data = await response.json();
        console.log('Site settings loaded:', data);
        setSiteSettings(data);
        
        if (data.backgroundimage) {
          const imageUrl = data.backgroundimage;
          console.log('Setting background image URL:', imageUrl);
          
          // Preload the background image
          const img = new Image();
          img.onload = () => {
            console.log('Background image loaded successfully');
            setImageLoaded(true);
            setImageError(false);
          };
          
          img.onerror = (error) => {
            console.error('Failed to load background image:', imageUrl, error);
            setImageLoaded(false);
            setImageError(true);
          };
          
          img.src = imageUrl;
        } else {
          console.log('No background image in settings');
          setImageLoaded(false);
          setImageError(false);
        }
      } catch (error) {
        console.error('Failed to fetch site settings:', error);
        setImageLoaded(false);
        setImageError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchSiteSettings();
  }, []);

  const handleExploreClick = (e) => {
    e.preventDefault();
    const aboutSection = document.querySelector('#about');
    if (aboutSection) {
      aboutSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

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
    
    return <span className="site-name-second">{siteName}</span>;
  };

  // Create inline style for background image
  const heroStyle = {
    backgroundImage: imageLoaded && !imageError && siteSettings?.backgroundimage 
      ? `linear-gradient(135deg, rgba(44, 62, 80, 0.4) 0%, rgba(39, 174, 96, 0.3) 100%), url("${siteSettings.backgroundimage}")`
      : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    transition: 'background-image 1.5s ease-in-out'
  };

  return (
    
    <div 
      className={`hero-section ${loading ? 'loading' : ''} ${imageLoaded && !imageError ? 'image-loaded' : ''} ${imageError ? 'image-error' : ''}`}
      style={heroStyle}
    >
        
      {/* LEFT SIDE */}
      <div className="hero-content left-side">
        <h1>
          Welcome to <span className="highlight">{renderSiteName()}</span>
        </h1>
        <p className="subtitle">
          Your one-stop solution for managing documents efficiently and streamlining your workflow with cutting-edge technology.
        </p>
        <Link to="/form" className="cta-button">
          Get Started
        </Link>
      </div>

      {/* RIGHT SIDE */}
      <div className="hero-visual right-side">
        <div className="logo-container">
          {loading ? (
            <div className="logo-fallback">
              <div className="fallback-icon">⏳</div>
              <p>Loading logo...</p>
            </div>
          ) : siteSettings?.site_logo ? (
            <>
              <img
                src={siteSettings.site_logo}
                alt={`${siteSettings?.site_name || 'Institution'} Logo`}
                className="institution-logo"
                onError={(e) => {
                  e.target.style.display = 'none';
                  const fallback = e.target.parentNode.querySelector('.logo-fallback');
                  if (fallback) {
                    fallback.style.display = 'flex';
                  }
                }}
                onLoad={(e) => {
                  const fallback = e.target.parentNode.querySelector('.logo-fallback');
                  if (fallback) {
                    fallback.style.display = 'none';
                  }
                }}
              />
              <div className="logo-fallback" style={{ display: 'none' }}>
                <div className="fallback-icon">🎓</div>
                <p>{siteSettings?.site_name || 'Institution'}</p>
              </div>
            </>
          ) : (
            <div className="logo-fallback">
              <div className="fallback-icon">🎓</div>
              <p>{siteSettings?.site_name || 'Institution'}</p>
            </div>
          )}
        </div>
        
        <a 
          href="#about" 
          className="explore-button"
          onClick={handleExploreClick}
        >
          Explore More ↓
        </a>
      </div>
    </div>
  );
};

export default HeroSection;