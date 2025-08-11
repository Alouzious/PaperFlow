import React, { useEffect, useState } from 'react';

const CourseNotesPage = () => {
  // Mock URL params - in real app you'd get these from useParams()
  const facultyCode = 'foclics';
  const courseCode = 'bcs';
  
  const [courseData, setCourseData] = useState(null);
  const [years, setYears] = useState([]);
  const [levels, setLevels] = useState([]);
  const [openYear, setOpenYear] = useState(null);
  const [selectedData, setSelectedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        // Simulate API call with your actual structure
        const mockResponse = {
          course: {
            name: "Bachelor of Computer Science",
            code: "BCS",
            description: "A comprehensive program covering software development, algorithms, data structures, and computer systems architecture."
          },
          available_years: [2025, 2024],
          available_levels: [1, 2, 3]
        };
        
        // Simulate loading delay
        setTimeout(() => {
          setCourseData(mockResponse.course);
          setYears(mockResponse.available_years);
          setLevels(mockResponse.available_levels);
          setSelectedData(null);
          setInitialLoading(false);
        }, 1000);
      } catch (err) {
        console.error('Error fetching course data:', err);
        setInitialLoading(false);
      }
    };

    fetchCourseData();
  }, [facultyCode, courseCode]);

  const toggleYear = (year) => {
    setOpenYear(openYear === year ? null : year);
  };

  const fetchPapers = async (year, level) => {
    setLoading(true);
    try {
      // Simulate your API call
      const mockNotes = [
        {
          id: 1,
          title: "Introduction to Programming",
          description: "Basic programming concepts, syntax, and problem-solving techniques using modern programming languages.",
          file_url: "#",
          note_type: "lecture",
          uploaded_at: "2024-01-15"
        },
        {
          id: 2,
          title: "Data Structures Assignment",
          description: "Implementation and analysis of linked lists, arrays, stacks, and queues with practical examples.",
          file_url: "#",
          note_type: "assignment",
          uploaded_at: "2024-01-20"
        },
        {
          id: 3,
          title: "Midterm Examination 2023",
          description: "Past examination paper with comprehensive solutions and marking scheme.",
          file_url: "#",
          note_type: "exam",
          uploaded_at: "2024-01-10"
        },
        {
          id: 4,
          title: "Algorithm Design Patterns",
          description: "Reference material covering essential algorithm design patterns and optimization techniques.",
          file_url: "#",
          note_type: "reference",
          uploaded_at: "2024-01-25"
        }
      ];
      
      // Simulate network delay
      setTimeout(() => {
        setSelectedData({ year, level, notes: mockNotes });
        setLoading(false);
      }, 1200);
    } catch (err) {
      console.error('Error fetching papers:', err);
      setSelectedData(null);
      setLoading(false);
    }
  };

  const getNoteTypeIcon = (type) => {
    const icons = {
      lecture: '📖',
      assignment: '📝',
      exam: '📋',
      reference: '📚',
      other: '📄'
    };
    return icons[type] || '📄';
  };

  const getNoteTypeColor = (type) => {
    const colors = {
      lecture: '#3b82f6',
      assignment: '#10b981',
      exam: '#f59e0b',
      reference: '#8b5cf6',
      other: '#6b7280'
    };
    return colors[type] || '#6b7280';
  };

  if (initialLoading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingSpinner}></div>
        <p style={styles.loadingText}>Loading course information...</p>
      </div>
    );
  }

  return (
    <div style={styles.container} className="course-notes-page">
      {/* Sidebar */}
      <div style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <h3 style={styles.sidebarTitle}>
            {courseData?.code} Navigation
          </h3>
          <p style={styles.sidebarSubtitle}>Select year and level</p>
        </div>
        
        <div style={styles.yearsList}>
          {years.length === 0 ? (
            <p style={styles.noData}>No years available</p>
          ) : (
            years.map((year) => (
              <div key={year} style={styles.yearItem}>
                <div
                  style={{
                    ...styles.yearHeader,
                    ...(openYear === year ? styles.yearHeaderActive : {})
                  }}
                  onClick={() => toggleYear(year)}
                >
                  <span>Academic Year {year}</span>
                  <span style={{
                    ...styles.expandIcon,
                    transform: openYear === year ? 'rotate(180deg)' : 'rotate(0deg)'
                  }}>
                    ▼
                  </span>
                </div>
                
                <div style={{
                  ...styles.levelsContainer,
                  maxHeight: openYear === year ? `${levels.length * 60}px` : '0px',
                  opacity: openYear === year ? 1 : 0
                }}>
                  {levels.map((lvl) => (
                    <div
                      key={lvl}
                      style={{
                        ...styles.levelItem,
                        ...(selectedData?.year === year && selectedData?.level === lvl 
                          ? styles.levelItemActive : {})
                      }}
                      onClick={() => fetchPapers(year, lvl)}
                    >
                      <div style={styles.levelContent}>
                        <span style={styles.levelText}>Year {lvl}</span>
                        <span style={styles.levelSubtext}>View resources</span>
                      </div>
                      <span style={styles.levelArrow}>→</span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.mainContent}>
        {/* Header */}
        <div style={styles.contentHeader}>
          {courseData ? (
            <>
              <div style={styles.headerTop}>
                <div style={styles.breadcrumb}>
                  <span style={styles.breadcrumbItem}>{facultyCode?.toUpperCase()}</span>
                  <span style={styles.breadcrumbSeparator}>→</span>
                  <span style={styles.breadcrumbItem}>{courseCode?.toUpperCase()}</span>
                </div>
              </div>
              <h1 style={styles.courseTitle}>{courseData.name}</h1>
              <p style={styles.courseDescription}>{courseData.description}</p>
            </>
          ) : (
            <div style={styles.headerSkeleton}>
              <div style={styles.skeletonLine}></div>
              <div style={styles.skeletonLine}></div>
            </div>
          )}
        </div>

        {/* Content Area */}
        <div style={styles.contentArea}>
          {loading && (
            <div style={styles.loadingContent}>
              <div style={styles.loadingSpinner}></div>
              <p style={styles.loadingText}>Loading resources...</p>
            </div>
          )}

          {!selectedData && !loading && (
            <div style={styles.emptyState}>
              <div style={styles.emptyStateIcon}>📚</div>
              <h3 style={styles.emptyStateTitle}>Select Year and Level</h3>
              <p style={styles.emptyStateText}>
                Choose an academic year from the sidebar, then select a year level to view available notes and resources.
              </p>
            </div>
          )}

          {!loading && selectedData && (
            <div style={styles.notesContainer}>
              <div style={styles.notesHeader}>
                <div>
                  <h2 style={styles.notesTitle}>
                    Year {selectedData.level} - Academic Year {selectedData.year}
                  </h2>
                  <p style={styles.notesSubtitle}>
                    Course materials and resources
                  </p>
                </div>
                <div style={styles.notesCount}>
                  {selectedData.notes.length} {selectedData.notes.length === 1 ? 'resource' : 'resources'}
                </div>
              </div>

              {selectedData.notes.length === 0 ? (
                <div style={styles.noNotes}>
                  <div style={styles.noNotesIcon}>📄</div>
                  <h3 style={styles.noNotesTitle}>No Resources Available</h3>
                  <p style={styles.noNotesText}>
                    There are no notes or resources available for Year {selectedData.level} of Academic Year {selectedData.year} yet.
                  </p>
                </div>
              ) : (
                <div style={styles.notesList}>
                  {selectedData.notes.map((note, index) => (
                    <div 
                      key={note.id} 
                      style={{
                        ...styles.noteCard,
                        animationDelay: `${index * 0.1}s`
                      }}
                    >
                      <div style={styles.noteHeader}>
                        <div style={styles.noteType}>
                          <span style={styles.noteTypeIcon}>
                            {getNoteTypeIcon(note.note_type)}
                          </span>
                          <span 
                            style={{
                              ...styles.noteTypeBadge,
                              backgroundColor: getNoteTypeColor(note.note_type) + '20',
                              color: getNoteTypeColor(note.note_type)
                            }}
                          >
                            {note.note_type.charAt(0).toUpperCase() + note.note_type.slice(1)}
                          </span>
                        </div>
                        <div style={styles.noteDate}>
                          {new Date(note.uploaded_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </div>
                      </div>
                      
                      <h4 style={styles.noteTitle}>{note.title}</h4>
                      <p style={styles.noteDescription}>{note.description}</p>
                      
                      <div style={styles.noteFooter}>
                        {note.file_url && (
                          <a 
                            href={note.file_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            style={styles.downloadButton}
                          >
                            <span>📥</span>
                            Download Resource
                          </a>
                        )}
                        <div style={styles.noteActions}>
                          <button style={styles.actionButton}>
                            👁️ Preview
                          </button>
                          <button style={styles.actionButton}>
                            📤 Share
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
  },
  
  // Sidebar Styles
  sidebar: {
    width: '340px',
    backgroundColor: 'white',
    borderRight: '1px solid #e2e8f0',
    padding: '0',
    overflowY: 'auto',
    boxShadow: '0 0 20px rgba(0,0,0,0.05)',
    position: 'relative'
  },
  
  sidebarHeader: {
    padding: '2rem 1.5rem 1.5rem',
    borderBottom: '1px solid #e2e8f0',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    position: 'relative',
    overflow: 'hidden'
  },
  
  sidebarTitle: {
    margin: '0 0 0.5rem 0',
    fontSize: '1.25rem',
    fontWeight: '700',
    letterSpacing: '-0.025em'
  },
  
  sidebarSubtitle: {
    margin: '0',
    fontSize: '0.875rem',
    opacity: 0.9,
    fontWeight: '400'
  },
  
  yearsList: {
    padding: '0'
  },
  
  yearItem: {
    margin: '0',
    borderBottom: '1px solid #f1f5f9'
  },
  
  yearHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.25rem 1.5rem',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    fontWeight: '600',
    fontSize: '1rem',
    backgroundColor: 'white',
    position: 'relative'
  },
  
  yearHeaderActive: {
    backgroundColor: '#f1f5f9',
    color: '#4f46e5',
    borderLeft: '4px solid #4f46e5'
  },
  
  expandIcon: {
    transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    fontSize: '0.875rem',
    color: '#64748b',
    fontWeight: 'bold'
  },
  
  levelsContainer: {
    overflow: 'hidden',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    backgroundColor: '#fafbfc'
  },
  
  levelItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 2rem',
    cursor: 'pointer',
    borderBottom: '1px solid #f1f5f9',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    fontSize: '0.9rem',
    position: 'relative'
  },
  
  levelItemActive: {
    backgroundColor: '#4f46e5',
    color: 'white',
    fontWeight: '600',
    transform: 'translateX(8px)',
    borderLeft: '4px solid #3730a3'
  },
  
  levelContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem'
  },
  
  levelText: {
    fontWeight: '600',
    fontSize: '0.95rem'
  },
  
  levelSubtext: {
    fontSize: '0.75rem',
    opacity: 0.7
  },
  
  levelArrow: {
    opacity: 0.6,
    fontSize: '1rem',
    transition: 'transform 0.2s ease'
  },
  
  // Main Content Styles
  mainContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto'
  },
  
  contentHeader: {
    padding: '2.5rem 3rem',
    backgroundColor: 'white',
    borderBottom: '1px solid #e2e8f0',
    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)'
  },
  
  headerTop: {
    marginBottom: '1rem'
  },
  
  breadcrumb: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '0.875rem',
    fontWeight: '500',
    marginBottom: '1rem'
  },
  
  breadcrumbItem: {
    color: '#4f46e5',
    backgroundColor: '#f0f0ff',
    padding: '0.25rem 0.75rem',
    borderRadius: '12px',
    fontSize: '0.8rem',
    fontWeight: '600'
  },
  
  breadcrumbSeparator: {
    margin: '0 0.75rem',
    color: '#cbd5e1',
    fontSize: '1rem'
  },
  
  courseTitle: {
    margin: '0 0 1rem 0',
    fontSize: '2.5rem',
    fontWeight: '800',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    lineHeight: 1.2
  },
  
  courseDescription: {
    margin: '0',
    fontSize: '1.125rem',
    color: '#64748b',
    lineHeight: 1.6,
    maxWidth: '800px'
  },
  
  contentArea: {
    flex: 1,
    padding: '3rem'
  },
  
  // Loading States
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#f8fafc'
  },
  
  loadingContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4rem',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
  },
  
  loadingSpinner: {
    width: '48px',
    height: '48px',
    border: '4px solid #f1f5f9',
    borderTop: '4px solid #4f46e5',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '1.5rem'
  },
  
  loadingText: {
    color: '#64748b',
    fontSize: '1rem',
    fontWeight: '500',
    margin: '0'
  },
  
  // Empty States
  emptyState: {
    textAlign: 'center',
    padding: '6rem 2rem',
    backgroundColor: 'white',
    borderRadius: '16px',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
  },
  
  emptyStateIcon: {
    fontSize: '5rem',
    marginBottom: '2rem',
    opacity: 0.8
  },
  
  emptyStateTitle: {
    margin: '0 0 1rem 0',
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#1e293b'
  },
  
  emptyStateText: {
    margin: '0',
    color: '#64748b',
    fontSize: '1rem',
    lineHeight: 1.6,
    maxWidth: '500px',
    marginLeft: 'auto',
    marginRight: 'auto'
  },
  
  noNotes: {
    textAlign: 'center',
    padding: '4rem 2rem',
    backgroundColor: 'white',
    borderRadius: '16px',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
  },
  
  noNotesIcon: {
    fontSize: '4rem',
    marginBottom: '1.5rem',
    opacity: 0.7
  },
  
  noNotesTitle: {
    margin: '0 0 1rem 0',
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#1e293b'
  },
  
  noNotesText: {
    margin: '0',
    color: '#64748b',
    lineHeight: 1.6
  },
  
  // Notes Content
  notesContainer: {
    animation: 'fadeInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
  },
  
  notesHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '2.5rem',
    paddingBottom: '1.5rem',
    borderBottom: '2px solid #e2e8f0'
  },
  
  notesTitle: {
    margin: '0 0 0.5rem 0',
    fontSize: '1.75rem',
    fontWeight: '800',
    color: '#1e293b',
    letterSpacing: '-0.025em'
  },
  
  notesSubtitle: {
    margin: '0',
    color: '#64748b',
    fontSize: '1rem'
  },
  
  notesCount: {
    backgroundColor: '#4f46e5',
    color: 'white',
    padding: '0.75rem 1.25rem',
    borderRadius: '24px',
    fontSize: '0.875rem',
    fontWeight: '600',
    boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.3)'
  },
  
  notesList: {
    display: 'grid',
    gap: '1.5rem'
  },
  
  noteCard: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '2rem',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
    border: '1px solid #e2e8f0',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    animation: 'slideInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards',
    opacity: 0,
    transform: 'translateY(30px)',
    position: 'relative',
    overflow: 'hidden'
  },
  
  noteHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.25rem'
  },
  
  noteType: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem'
  },
  
  noteTypeIcon: {
    fontSize: '1.5rem'
  },
  
  noteTypeBadge: {
    padding: '0.375rem 1rem',
    borderRadius: '16px',
    fontSize: '0.75rem',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  },
  
  noteDate: {
    fontSize: '0.875rem',
    color: '#94a3b8',
    fontWeight: '500',
    backgroundColor: '#f8fafc',
    padding: '0.375rem 0.75rem',
    borderRadius: '12px'
  },
  
  noteTitle: {
    margin: '0 0 1rem 0',
    fontSize: '1.375rem',
    fontWeight: '700',
    color: '#1e293b',
    lineHeight: 1.3
  },
  
  noteDescription: {
    margin: '0 0 2rem 0',
    color: '#64748b',
    lineHeight: 1.6,
    fontSize: '1rem'
  },
  
  noteFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1rem'
  },
  
  downloadButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    backgroundColor: '#4f46e5',
    color: 'white',
    textDecoration: 'none',
    padding: '0.875rem 1.5rem',
    borderRadius: '12px',
    fontWeight: '600',
    fontSize: '0.875rem',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.3)'
  },
  
  noteActions: {
    display: 'flex',
    gap: '0.5rem'
  },
  
  actionButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    backgroundColor: 'transparent',
    color: '#64748b',
    border: '1px solid #e2e8f0',
    padding: '0.5rem 0.75rem',
    borderRadius: '8px',
    fontSize: '0.75rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  
  // Skeleton Loading
  headerSkeleton: {
    animation: 'pulse 2s infinite'
  },
  
  skeletonLine: {
    height: '1.5rem',
    backgroundColor: '#e2e8f0',
    borderRadius: '8px',
    marginBottom: '1rem',
    width: '70%'
  },
  
  noData: {
    padding: '3rem 1.5rem',
    textAlign: 'center',
    color: '#94a3b8',
    fontStyle: 'italic',
    fontSize: '0.95rem'
  }
};

// Add CSS keyframes and hover effects
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  @keyframes fadeInUp {
    0% {
      opacity: 0;
      transform: translateY(40px);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes slideInUp {
    0% {
      opacity: 0;
      transform: translateY(30px);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
  
  /* Hover Effects */
  .course-notes-page .note-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 25px -5px rgba(0,0,0,0.15), 0 10px 10px -5px rgba(0,0,0,0.04);
    border-color: #c7d2fe;
  }
  
  .course-notes-page .download-button:hover {
    background-color: #4338ca;
    transform: translateY(-2px);
    box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.4);
  }
  
  .course-notes-page .level-item:hover:not(.level-item-active) {
    background-color: #f1f5f9;
    transform: translateX(8px);
    color: #4f46e5;
  }
  
  .course-notes-page .year-header:hover:not(.year-header-active) {
    background-color: #f8fafc;
    color: #4f46e5;
  }
  
  .course-notes-page .action-button:hover {
    background-color: #f1f5f9;
    border-color: #c7d2fe;
    color: #4f46e5;
  }
  
  /* Responsive Design */
  @media (max-width: 768px) {
    .course-notes-page .container {
      flex-direction: column;
    }
    
    .course-notes-page .sidebar {
      width: 100%;
      max-height: 300px;
    }
    
    .course-notes-page .content-area {
      padding: 1.5rem;
    }
    
    .course-notes-page .content-header {
      padding: 1.5rem;
    }
    
    .course-notes-page .course-title {
      font-size: 2rem;
    }
  }
  
  /* Custom scrollbar */
  .course-notes-page .sidebar::-webkit-scrollbar {
    width: 6px;
  }
  
  .course-notes-page .sidebar::-webkit-scrollbar-track {
    background: #f1f5f9;
  }
  
  .course-notes-page .sidebar::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 3px;
  }
  
  .course-notes-page .sidebar::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
  }
  
  /* Add subtle backdrop to sidebar header */
  .course-notes-page .sidebar-header::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
    pointer-events: none;
  }
`;
document.head.appendChild(styleSheet);

export default CourseNotesPage;