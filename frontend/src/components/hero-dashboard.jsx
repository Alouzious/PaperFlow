import React, { useEffect, useState, useRef } from 'react';
import { Search, X, BookOpen, Users, GraduationCap, Building } from 'lucide-react';

const HeroDashboard = () => {
  const [siteSettings, setSiteSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchInputRef = useRef(null);

  // Mock data for search functionality
  const searchData = [
    {
      id: 1,
      title: 'Faculty of Computing',
      type: 'faculty',
      description: 'Computer Science, IT, Software Engineering programs',
      keywords: ['computing', 'computer science', 'IT', 'software', 'programming', 'technology'],
      icon: '💻'
    },
    {
      id: 2,
      title: 'Faculty of Education',
      type: 'faculty',
      description: 'Teaching, Curriculum Development, Educational Psychology',
      keywords: ['education', 'teaching', 'curriculum', 'psychology', 'learning'],
      icon: '📚'
    },
    {
      id: 3,
      title: 'Bachelor of Computer Science (BCS)',
      type: 'course',
      description: 'Comprehensive computer science degree program',
      keywords: ['BCS', 'computer science', 'bachelor', 'programming', 'algorithms'],
      icon: '🎓'
    },
    {
      id: 4,
      title: 'Bachelor of Information Technology (BIT)',
      type: 'course',
      description: 'Information technology and systems management',
      keywords: ['BIT', 'information technology', 'IT', 'systems', 'networks'],
      icon: '🖥️'
    },
    {
      id: 5,
      title: 'Bachelor of Arts in Education (BAE)',
      type: 'course',
      description: 'Teaching qualification with specialization',
      keywords: ['BAE', 'education', 'teaching', 'arts', 'bachelor'],
      icon: '👨‍🏫'
    },
    {
      id: 6,
      title: 'Research & Innovation Center',
      type: 'facility',
      description: 'Advanced research facilities and labs',
      keywords: ['research', 'innovation', 'lab', 'technology', 'development'],
      icon: '🔬'
    },
    {
      id: 7,
      title: 'Library & Learning Resources',
      type: 'facility',
      description: 'Digital and physical learning materials',
      keywords: ['library', 'books', 'resources', 'learning', 'study'],
      icon: '📖'
    },
    {
      id: 8,
      title: 'Student Support Services',
      type: 'service',
      description: 'Academic counseling and career guidance',
      keywords: ['support', 'counseling', 'career', 'guidance', 'academic'],
      icon: '🤝'
    }
  ];

  useEffect(() => {
    const fetchSiteSettings = async () => {
      try {
        // Simulating API call - replace with your actual endpoint
        const mockSettings = {
          site_name: 'PaperFlow',
          welcomemsg: 'Discover excellence in education with our comprehensive programs and world-class facilities. Your journey to success starts here.',
          backgroundimage2: 'https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2574&q=80'
        };
        
        setSiteSettings(mockSettings);

        if (mockSettings.backgroundimage2) {
          const img = new Image();
          img.onload = () => {
            setImageLoaded(true);
            setImageError(false);
          };
          img.onerror = () => {
            setImageLoaded(false);
            setImageError(true);
          };
          img.src = mockSettings.backgroundimage2;
        }
      } catch (error) {
        console.error('Failed to fetch site settings:', error);
        setImageError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchSiteSettings();
  }, []);

  const handleSearch = (query) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    const results = searchData.filter(item =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.description.toLowerCase().includes(query.toLowerCase()) ||
      item.keywords.some(keyword => 
        keyword.toLowerCase().includes(query.toLowerCase())
      )
    );

    setSearchResults(results);
    setShowResults(true);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const handleResultClick = (result) => {
    // Handle navigation to the specific section/page
    console.log('Navigating to:', result);
    setShowResults(false);
    setSearchQuery('');
    
    // You can implement navigation logic here
    // For example: navigate to a specific section or page
  };

  const handleExploreClick = (e) => {
    e.preventDefault();
    const aboutSection = document.querySelector('#about');
    if (aboutSection) {
      aboutSection.scrollIntoView({ behavior: 'smooth' });
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

  const getTypeIcon = (type) => {
    switch (type) {
      case 'faculty':
        return <Building className="w-4 h-4" />;
      case 'course':
        return <GraduationCap className="w-4 h-4" />;
      case 'facility':
        return <BookOpen className="w-4 h-4" />;
      case 'service':
        return <Users className="w-4 h-4" />;
      default:
        return <Search className="w-4 h-4" />;
    }
  };

  const heroStyle = {
    backgroundImage: imageLoaded && !imageError && siteSettings?.backgroundimage2
      ? `linear-gradient(135deg, rgba(44, 62, 80, 0.4) 0%, rgba(39, 174, 96, 0.3) 100%), url("${siteSettings.backgroundimage2}")`
      : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    transition: 'background-image 1.5s ease-in-out'
  };

  return (
    <div className="relative">
      <style jsx>{`
        /* Hero Section Styles */
        .hero-section {
          position: relative;
          min-height: 80vh;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 5%;
          overflow: hidden;
        }

        /* Blurred Background Animation Layer */
        .hero-section::before {
          content: '';
          position: absolute;
          top: -20%;
          left: -20%;
          width: 140%;
          height: 140%;
          background: inherit;
          background-size: 120% 120%;
          filter: blur(3px);
          z-index: 1;
          animation: backgroundPulse 12s ease-in-out infinite;
        }

        /* Additional blur overlay for better text readability */
        .hero-section::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.1) 50%, rgba(0, 0, 0, 0.3) 100%);
          z-index: 1;
        }

        /* Ensure content is above background */
        .hero-content,
        .hero-visual {
          position: relative;
          z-index: 2;
        }

        /* Left Side - Content */
        .left-side {
          flex: 1;
          max-width: 600px;
          padding-right: 2rem;
          opacity: 0;
          transform: translateX(-50px);
          animation: slideInLeft 1s ease-out 0.5s forwards;
        }

        .left-side h1 {
          font-size: clamp(2.5rem, 5vw, 4rem);
          font-weight: 700;
          line-height: 1.2;
          margin-bottom: 1.5rem;
          color: #ffffff;
          text-shadow: 3px 3px 10px rgba(0, 0, 0, 0.8);
        }

        .highlight {
          position: relative;
        }

        .site-name-first {
          color: #ffffff;
          font-weight: 900;
          text-shadow: 3px 3px 10px rgba(0, 0, 0, 0.8);
        }

        .site-name-second {
          color: #20c526;
          font-weight: 900;
          text-shadow: 3px 3px 10px rgba(0, 0, 0, 0.8);
          filter: drop-shadow(0 0 10px rgba(76, 175, 80, 0.6));
        }

        .highlight::after {
          content: '';
          position: absolute;
          bottom: -5px;
          left: 0;
          width: 100%;
          height: 3px;
          background: linear-gradient(45deg, #4CAF50, #27ae60);
          border-radius: 2px;
          animation: expandWidth 1s ease-out 1.5s forwards;
          transform: scaleX(0);
          transform-origin: left;
          box-shadow: 0 0 15px rgba(76, 175, 80, 0.6);
        }

        .subtitle {
          font-size: clamp(1.1rem, 2vw, 1.4rem);
          color: #f8f8f8;
          margin-bottom: 2.5rem;
          line-height: 1.6;
          font-weight: 300;
          text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.8);
        }

        /* CTA Button */
        .cta-button {
          display: inline-block;
          padding: 0.9rem 2.2rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
          color: white;
          text-decoration: none;
          border-radius: 35px;
          font-weight: 600;
          font-size: clamp(0.9rem, 2vw, 1.1rem);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          position: relative;
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4), 0 4px 12px rgba(0, 0, 0, 0.3);
          border: 2px solid rgba(255, 255, 255, 0.2);
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        .cta-button:hover {
          transform: translateY(-4px) scale(1.02);
          box-shadow: 0 15px 40px rgba(102, 126, 234, 0.5), 0 8px 20px rgba(0, 0, 0, 0.4);
          background: linear-gradient(135deg, #7c8ce8 0%, #8559a8 50%, #f2a3fc 100%);
          border-color: rgba(255, 255, 255, 0.4);
          text-decoration: none;
          color: white;
        }

        /* Right Side - Search */
        .right-side {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transform: translateX(50px);
          animation: slideInRight 1s ease-out 0.7s forwards;
          max-width: 500px;
        }

        /* Search Container */
        .search-container {
          width: 100%;
          max-width: 400px;
          position: relative;
        }

        .search-wrapper {
          position: relative;
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(15px);
          border-radius: 25px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          padding: 1rem;
          transition: all 0.3s ease;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }

        .search-wrapper.focused {
          border-color: rgba(0, 212, 170, 0.8);
          box-shadow: 0 0 30px rgba(0, 212, 170, 0.3);
          background: rgba(255, 255, 255, 0.2);
        }

        .search-input-wrapper {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .search-input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          color: white;
          font-size: 1.1rem;
          font-weight: 300;
          placeholder-color: rgba(255, 255, 255, 0.7);
        }

        .search-input::placeholder {
          color: rgba(255, 255, 255, 0.7);
        }

        .search-icon, .clear-icon {
          color: rgba(255, 255, 255, 0.8);
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .search-icon:hover, .clear-icon:hover {
          color: #00d4aa;
          transform: scale(1.1);
        }

        /* Search Results */
        .search-results {
          position: absolute;
          top: calc(100% + 0.5rem);
          left: 0;
          right: 0;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 15px;
          border: 1px solid rgba(255, 255, 255, 0.3);
          max-height: 400px;
          overflow-y: auto;
          z-index: 100;
          box-shadow: 0 15px 50px rgba(0, 0, 0, 0.3);
          animation: slideDown 0.3s ease-out;
        }

        .search-result-item {
          padding: 1rem;
          border-bottom: 1px solid rgba(0, 0, 0, 0.1);
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .search-result-item:last-child {
          border-bottom: none;
        }

        .search-result-item:hover {
          background: rgba(0, 212, 170, 0.1);
          transform: translateX(5px);
        }

        .result-icon {
          font-size: 1.5rem;
          min-width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea, #764ba2);
          border-radius: 10px;
          color: white;
        }

        .result-content {
          flex: 1;
        }

        .result-title {
          font-weight: 600;
          color: #2c3e50;
          margin-bottom: 0.25rem;
          font-size: 1rem;
        }

        .result-description {
          color: #7f8c8d;
          font-size: 0.9rem;
          line-height: 1.4;
        }

        .result-type {
          background: linear-gradient(135deg, #00d4aa, #26d0ce);
          color: white;
          padding: 0.2rem 0.6rem;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .no-results {
          padding: 2rem 1rem;
          text-align: center;
          color: #7f8c8d;
          font-style: italic;
        }

        /* Search Suggestions */
        .search-suggestions {
          margin-top: 2rem;
          text-align: center;
        }

        .suggestion-title {
          color: rgba(255, 255, 255, 0.9);
          font-size: 1rem;
          margin-bottom: 1rem;
          font-weight: 500;
        }

        .suggestion-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          justify-content: center;
        }

        .suggestion-tag {
          background: rgba(255, 255, 255, 0.2);
          color: white;
          padding: 0.4rem 0.8rem;
          border-radius: 15px;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.3s ease;
          border: 1px solid rgba(255, 255, 255, 0.3);
        }

        .suggestion-tag:hover {
          background: rgba(0, 212, 170, 0.3);
          border-color: rgba(0, 212, 170, 0.6);
          transform: translateY(-2px);
        }

        /* Animations */
        @keyframes backgroundPulse {
          0%, 100% {
            transform: scale(1) translateX(0);
            filter: blur(3px);
          }
          25% {
            transform: scale(1.05) translateX(-2%);
            filter: blur(4px);
          }
          50% {
            transform: scale(1.1) translateX(0);
            filter: blur(5px);
          }
          75% {
            transform: scale(1.05) translateX(2%);
            filter: blur(4px);
          }
        }

        @keyframes slideInLeft {
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInRight {
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes expandWidth {
          to {
            transform: scaleX(1);
          }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Responsive Design */
        @media (max-width: 1024px) {
          .hero-section {
            flex-direction: column;
            text-align: center;
            padding: 2rem;
            gap: 3rem;
          }

          .left-side {
            max-width: 100%;
            padding-right: 0;
          }

          .right-side {
            order: -1;
            max-width: 100%;
          }
        }

        @media (max-width: 768px) {
          .hero-section {
            padding: 1rem;
            gap: 2rem;
          }

          .left-side h1 {
            font-size: 2.5rem;
          }

          .subtitle {
            font-size: 1.1rem;
          }

          .search-container {
            max-width: 350px;
          }
        }

        @media (max-width: 480px) {
          .hero-section {
            min-height: 90vh;
            gap: 1.5rem;
          }

          .left-side h1 {
            font-size: 2rem;
          }

          .search-container {
            max-width: 300px;
          }

          .suggestion-tags {
            gap: 0.3rem;
          }

          .suggestion-tag {
            font-size: 0.8rem;
            padding: 0.3rem 0.6rem;
          }
        }
      `}</style>

      <div 
        className={`hero-section ${loading ? 'loading' : ''} ${imageLoaded && !imageError ? 'image-loaded' : ''} ${imageError ? 'image-error' : ''}`}
        style={heroStyle}
      >
        {/* LEFT SIDE - Content */}
        <div className="hero-content left-side">
          <h1>
            Welcome to <span className="highlight">{renderSiteName()}</span>
          </h1>
          <p className="subtitle">
            {siteSettings?.welcomemsg}
          </p>
          <a 
            href="#about"
            className="cta-button"
            onClick={handleExploreClick}
          >
            Explore More ↓
          </a>
        </div>

        {/* RIGHT SIDE - Search */}
        <div className="hero-visual right-side">
          <div className="search-container">
            <div className={`search-wrapper ${isSearchFocused ? 'focused' : ''}`}>
              <div className="search-input-wrapper">
                <Search className="search-icon w-5 h-5" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search faculties, courses, facilities..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                  className="search-input"
                />
                {searchQuery && (
                  <X 
                    className="clear-icon w-5 h-5" 
                    onClick={clearSearch}
                  />
                )}
              </div>

              {/* Search Results */}
              {showResults && (
                <div className="search-results">
                  {searchResults.length > 0 ? (
                    searchResults.map((result) => (
                      <div
                        key={result.id}
                        className="search-result-item"
                        onClick={() => handleResultClick(result)}
                      >
                        <div className="result-icon">
                          {getTypeIcon(result.type)}
                        </div>
                        <div className="result-content">
                          <div className="result-title">{result.title}</div>
                          <div className="result-description">{result.description}</div>
                        </div>
                        <div className="result-type">{result.type}</div>
                      </div>
                    ))
                  ) : (
                    <div className="no-results">
                      No results found for "{searchQuery}"
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Search Suggestions */}
            {!searchQuery && (
              <div className="search-suggestions">
                <div className="suggestion-title">Popular searches:</div>
                <div className="suggestion-tags">
                  {['Computing', 'Education', 'BCS', 'BIT', 'Research', 'Library'].map((tag) => (
                    <span
                      key={tag}
                      className="suggestion-tag"
                      onClick={() => handleSearch(tag)}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroDashboard;