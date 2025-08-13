import React, { useState, useEffect, useCallback } from 'react';
import { 
  Mail, 
  Phone, 
  Globe, 
  Instagram, 
  Twitter, 
  Linkedin, 
  Send, 
  MessageCircle, 
  Facebook,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import './MainFooter.css';

const MainFooter = () => {
  const [siteSettings, setSiteSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState(null);
  const [retryAttempts, setRetryAttempts] = useState(0);

  const MAX_RETRY_ATTEMPTS = 3;
  const RETRY_DELAY = 1000;

  // Fallback data - comprehensive default settings
  const fallbackSettings = {
    site_name: "PaperFlow",
    site_logo: null,
    welcomemsg: "We're here to make organizing, tracking, and flowing through your paperwork easier than ever.",
    backgroundimage: null,
    backgroundimage2: null,
    contact_email: "info@paperflow.org",
    instagram_url: "",
    twitter_url: "",
    linkedin_url: "",
    telegram_url: "",
    whatsapp_number: "+256-700-123-456",
    facebook_url: ""
  };

  // Fetch site settings with retry logic
  const fetchSiteSettings = useCallback(async (attempt = 0) => {
    try {
      setError(null);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
      
      const response = await fetch('https://paperflow-backend.onrender.com/api/site-settings/', {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Validate and sanitize data
      const sanitizedData = {
        ...fallbackSettings,
        ...data,
        // Ensure URLs are properly formatted
        instagram_url: data.instagram_url?.trim() || '',
        twitter_url: data.twitter_url?.trim() || '',
        linkedin_url: data.linkedin_url?.trim() || '',
        telegram_url: data.telegram_url?.trim() || '',
        facebook_url: data.facebook_url?.trim() || '',
        contact_email: data.contact_email?.trim() || fallbackSettings.contact_email,
        whatsapp_number: data.whatsapp_number?.trim() || fallbackSettings.whatsapp_number,
        site_name: data.site_name?.trim() || fallbackSettings.site_name
      };
      
      setSiteSettings(sanitizedData);
      setRetryAttempts(0);
      
    } catch (err) {
      console.error('Error fetching site settings:', err);
      
      if (attempt < MAX_RETRY_ATTEMPTS && !err.name === 'AbortError') {
        console.log(`Retrying... (${attempt + 1}/${MAX_RETRY_ATTEMPTS})`);
        setRetryAttempts(attempt + 1);
        setTimeout(() => {
          fetchSiteSettings(attempt + 1);
        }, RETRY_DELAY * Math.pow(2, attempt)); // Exponential backoff
      } else {
        const errorMessage = err.name === 'AbortError' 
          ? 'Request timeout - using offline data'
          : `Failed to load settings: ${err.message}`;
        
        setError(errorMessage);
        setSiteSettings(fallbackSettings);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSiteSettings();
  }, [fetchSiteSettings]);

  // Newsletter subscription handler
  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    
    if (!newsletterEmail.trim()) {
      setNewsletterStatus({ type: 'error', message: 'Please enter your email address' });
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newsletterEmail)) {
      setNewsletterStatus({ type: 'error', message: 'Please enter a valid email address' });
      return;
    }
    
    setNewsletterStatus({ type: 'loading', message: 'Subscribing...' });
    
    try {
      // Simulate API call - replace with your actual newsletter API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate success/failure for demo
      const success = Math.random() > 0.3; // 70% success rate for demo
      
      if (success) {
        setNewsletterStatus({ type: 'success', message: 'Successfully subscribed! Check your email.' });
        setNewsletterEmail('');
      } else {
        throw new Error('Subscription failed. Please try again.');
      }
    } catch (err) {
      setNewsletterStatus({ type: 'error', message: err.message });
    }
    
    // Clear status after 5 seconds
    setTimeout(() => setNewsletterStatus(null), 5000);
  };

  // Get social media icon
  const getSocialIcon = (platform) => {
    const iconProps = { size: 20 };
    
    switch (platform) {
      case 'instagram': return <Instagram {...iconProps} />;
      case 'twitter': return <Twitter {...iconProps} />;
      case 'linkedin': return <Linkedin {...iconProps} />;
      case 'telegram': return <Send {...iconProps} />;
      case 'whatsapp': return <MessageCircle {...iconProps} />;
      case 'facebook': return <Facebook {...iconProps} />;
      default: return <Globe {...iconProps} />;
    }
  };

  // Process social links
  const socialLinks = [
    { platform: 'instagram', url: siteSettings?.instagram_url, label: 'Instagram' },
    { platform: 'twitter', url: siteSettings?.twitter_url, label: 'Twitter' },
    { platform: 'linkedin', url: siteSettings?.linkedin_url, label: 'LinkedIn' },
    { platform: 'facebook', url: siteSettings?.facebook_url, label: 'Facebook' },
    { platform: 'telegram', url: siteSettings?.telegram_url, label: 'Telegram' },
  ].filter(link => link.url && link.url.trim() !== '');

  // Navigation links
  const quickLinks = [
    { href: "/", label: "Home" },
    { href: "/#about", label: "About Us" },
    { href: "/#faculties", label: "Faculties" },
    { href: "#services", label: "Services" },
    { href: "#contact", label: "Contact" },
  ];

  // Format WhatsApp number for URL
  const formatWhatsAppNumber = (number) => {
    if (!number) return '';
    return number.replace(/[^0-9]/g, '');
  };

  // Render loading state
  if (loading) {
    return (
      <footer className="footer-loading">
        <div className="footer-loading-container">
          <div className="loading-dots">
            <div className="loading-dot"></div>
            <div className="loading-dot"></div>
            <div className="loading-dot"></div>
          </div>
          {retryAttempts > 0 && (
            <p style={{ color: '#9ca3af', marginTop: '1rem', fontSize: '0.9rem' }}>
              Retrying... ({retryAttempts}/{MAX_RETRY_ATTEMPTS})
            </p>
          )}
        </div>
      </footer>
    );
  }

  return (
    <footer className="main-footer animate-fade-in">
      {/* Background Pattern */}
      <div className="footer-background-pattern"></div>

      <div className="footer-container">
        {/* Error Display */}
        {error && (
          <div className="footer-error">
            <AlertCircle size={20} style={{ marginRight: '0.5rem' }} />
            <span className="error-message">{error}</span>
          </div>
        )}

        <div className="footer-grid animate-slide-up">
          
          {/* About Section */}
          <div className="footer-about">
            <div className="footer-brand">
              <div className="footer-brand-icon">
                <Globe size={24} />
              </div>
              <h3 className="footer-brand-text">
                {siteSettings?.site_name || 'PaperFlow'}
              </h3>
            </div>
            
            <p className="footer-description">
              {siteSettings?.welcomemsg || 
                "PaperFlow helps institutions digitize and manage academic records securely and efficiently. Transform your paperwork into streamlined digital workflows."
              }
            </p>
            
            {/* Contact Info */}
            <div className="footer-contact" id='contact'>
              {siteSettings?.contact_email && (
                <div className="contact-item">
                  <div className="contact-icon email">
                    <Mail size={18} />
                  </div>
                  <a 
                    href={`mailto:${siteSettings.contact_email}`} 
                    className="contact-link"
                    aria-label={`Email us at ${siteSettings.contact_email}`}
                  >
                    {siteSettings.contact_email}
                  </a>
                </div>
              )}
              
              {siteSettings?.whatsapp_number && (
                <div className="contact-item">
                  <div className="contact-icon whatsapp">
                    <Phone size={18} />
                  </div>
                  <a 
                    href={`https://wa.me/${formatWhatsAppNumber(siteSettings.whatsapp_number)}`}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="contact-link whatsapp-link"
                    aria-label={`WhatsApp us at ${siteSettings.whatsapp_number}`}
                  >
                    {siteSettings.whatsapp_number}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="footer-section-title">Quick Links</h4>
            <ul className="footer-links">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <a 
                    href={link.href} 
                    className="footer-link"
                    aria-label={`Navigate to ${link.label}`}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h4 className="footer-section-title">Follow Us</h4>
            <div className="social-links">
              {socialLinks.length > 0 ? (
                socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-link"
                    aria-label={`Follow us on ${social.label}`}
                  >
                    <div className="social-icon">
                      {getSocialIcon(social.platform)}
                    </div>
                    <span className="social-label">
                      {social.label}
                    </span>
                  </a>
                ))
              ) : (
                <p style={{ color: '#9ca3af', fontSize: '0.9rem', fontStyle: 'italic' }}>
                  Social media links coming soon!
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="newsletter-section">
          <div className="newsletter-content">
            <h4 className="newsletter-title">
              Stay Updated
            </h4>
            <p className="newsletter-description">
              Get the latest updates about PaperFlow features and improvements
            </p>
            
            <form className="newsletter-form" onSubmit={handleNewsletterSubmit}>
              <input
                type="email"
                placeholder="Enter your email"
                className="newsletter-input"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                disabled={newsletterStatus?.type === 'loading'}
                aria-label="Newsletter email subscription"
              />
              <button 
                type="submit"
                className="newsletter-button"
                disabled={newsletterStatus?.type === 'loading'}
                aria-label="Subscribe to newsletter"
              >
                {newsletterStatus?.type === 'loading' ? (
                  <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                ) : (
                  'Subscribe'
                )}
              </button>
            </form>
            
            {/* Newsletter Status */}
            {newsletterStatus && (
              <div style={{ 
                marginTop: '1rem', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                gap: '0.5rem',
                fontSize: '0.9rem'
              }}>
                {newsletterStatus.type === 'success' && (
                  <>
                    <CheckCircle size={16} style={{ color: '#10b981' }} />
                    <span style={{ color: '#10b981' }}>{newsletterStatus.message}</span>
                  </>
                )}
                {newsletterStatus.type === 'error' && (
                  <>
                    <AlertCircle size={16} style={{ color: '#ef4444' }} />
                    <span style={{ color: '#ef4444' }}>{newsletterStatus.message}</span>
                  </>
                )}
                {newsletterStatus.type === 'loading' && (
                  <>
                    <Loader2 size={16} style={{ color: '#3b82f6', animation: 'spin 1s linear infinite' }} />
                    <span style={{ color: '#3b82f6' }}>{newsletterStatus.message}</span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Copyright */}
        <div className="footer-copyright">
          <div className="copyright-content">
            <p className="copyright-text">
              &copy; {new Date().getFullYear()} {siteSettings?.site_name || 'PaperFlow'}. All rights reserved.
            </p>
            <div className="footer-legal-links">
              <a href="/privacy" className="legal-link" aria-label="Privacy Policy">
                Privacy Policy
              </a>
              <a href="/terms" className="legal-link" aria-label="Terms of Service">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="footer-decoration-1"></div>
      <div className="footer-decoration-2"></div>
      
      {/* Additional CSS for spinning animation */}
      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </footer>
  );
};

export default MainFooter;