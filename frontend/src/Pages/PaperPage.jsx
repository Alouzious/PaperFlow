// CourseNotesPage.jsx - With Navbar and Footer integration
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/PageNavbar'; // Adjust path as needed
import MainFooter from '../components/MainFooter'; // Adjust path as needed
import './PaperPage.css';

const CourseNotesPage = () => {
  const { facultyCode, courseCode } = useParams();
  
  const [courseData, setCourseData] = useState(null);
  const [selectedYearLevel, setSelectedYearLevel] = useState(null);
  const [yearLevelNotes, setYearLevelNotes] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Check if user is registered (for navbar)
  const [isRegistered, setIsRegistered] = useState(false);
  
  // Preview modal state
  const [previewModal, setPreviewModal] = useState({
    isOpen: false,
    note: null,
    loading: false,
    previewData: null
  });
  
  // Payment modal state (for future use)
  const [paymentModal, setPaymentModal] = useState({
    isOpen: false,
    note: null,
    type: 'view' // 'view' or 'download'
  });

  // Check registration status on mount
  useEffect(() => {
    const student = localStorage.getItem('student');
    setIsRegistered(!!student);
  }, []);

  // Fetch course details when component mounts
  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setInitialLoading(true);
        const response = await fetch(`https://paperflow-backend.onrender.com/api/faculties/${facultyCode}/courses/${courseCode}/`);
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        setCourseData(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching course data:', err);
        setError(err.message);
      } finally {
        setInitialLoading(false);
      }
    };

    if (facultyCode && courseCode) {
      fetchCourseData();
    }
  }, [facultyCode, courseCode]);

  // FIXED: Fetch notes for specific year level with proper semester separation
  const fetchYearLevelNotes = async (year, level) => {
    setLoading(true);
    setSelectedYearLevel({ year, level });
    
    try {
      // Add student_id to request if logged in (for access control)
      const studentId = localStorage.getItem('student_id'); // Assuming student ID is stored locally
      const url = new URL(`https://paperflow-backend.onrender.com/api/faculties/${facultyCode}/courses/${courseCode}/${year}/year/${level}/`);
      if (studentId) {
        url.searchParams.append('student_id', studentId);
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setYearLevelNotes(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching year level notes:', err);
      setError(err.message);
      setYearLevelNotes(null);
    } finally {
      setLoading(false);
    }
  };

  // Preview functionality
  const handlePreview = async (note) => {
    if (!note.has_preview) {
      alert('Preview not available for this document');
      return;
    }

    setPreviewModal({
      isOpen: true,
      note: note,
      loading: true,
      previewData: null
    });

    try {
      const studentId = localStorage.getItem('student_id');
      const url = new URL(`https://paperflow-backend.onrender.com/api/notes/${note.id}/preview/`);
      if (studentId) {
        url.searchParams.append('student_id', studentId);
      }

      const response = await fetch(url);
      const previewData = await response.json();

      if (response.ok) {
        setPreviewModal(prev => ({
          ...prev,
          loading: false,
          previewData: previewData
        }));
      } else {
        // Handle payment required or other errors
        if (response.status === 402) {
          // Payment required - would show payment modal in future
          alert('Payment required for preview access');
        } else {
          alert(previewData.error || 'Failed to load preview');
        }
        setPreviewModal({ isOpen: false, note: null, loading: false, previewData: null });
      }
    } catch (err) {
      console.error('Error loading preview:', err);
      alert('Failed to load preview');
      setPreviewModal({ isOpen: false, note: null, loading: false, previewData: null });
    }
  };

  // Close preview modal
  const closePreviewModal = () => {
    setPreviewModal({ isOpen: false, note: null, loading: false, previewData: null });
  };

  // View full document
  const handleViewDocument = async (note) => {
    try {
      const studentId = localStorage.getItem('student_id');
      const url = new URL(`https://paperflow-backend.onrender.com/api/notes/${note.id}/view/`);
      if (studentId) {
        url.searchParams.append('student_id', studentId);
      }

      const response = await fetch(url);
      const viewData = await response.json();

      if (response.ok) {
        // Open document in new tab for viewing
        if (viewData.file_url) {
          window.open(viewData.file_url, '_blank');
        } else {
          alert('Document view not available');
        }
      } else {
        if (response.status === 402) {
          // Payment required - would show payment modal in future
          alert(`Payment required: ${viewData.view_price} UGX to view full document`);
          // setPaymentModal({ isOpen: true, note: note, type: 'view' });
        } else {
          alert(viewData.error || 'Failed to access document');
        }
      }
    } catch (err) {
      console.error('Error viewing document:', err);
      alert('Failed to view document');
    }
  };

  // Download document (disabled during trial)
  const handleDownload = async (note) => {
    try {
      const response = await fetch(`https://paperflow-backend.onrender.com/api/notes/${note.id}/download/`);
      const downloadData = await response.json();

      if (response.status === 423) {
        // Downloads disabled during trial
        alert(downloadData.message || 'Downloads are currently disabled during free trial period');
      } else if (response.status === 402) {
        // Payment required - would show payment modal in future
        alert(`Payment required: ${downloadData.download_price} UGX to download`);
        // setPaymentModal({ isOpen: true, note: note, type: 'download' });
      } else if (!response.ok) {
        alert(downloadData.error || 'Download failed');
      }
    } catch (err) {
      console.error('Error downloading:', err);
      alert('Download failed');
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

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  if (initialLoading) {
    return (
      <>
        <Navbar isRegistered={isRegistered} />
        <div className="loading-container" style={{ minHeight: '60vh', paddingTop: '80px' }}>
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading course information...</p>
        </div>
        <MainFooter />
      </>
    );
  }

  if (error && !courseData) {
    return (
      <>
        <Navbar isRegistered={isRegistered} />
        <div className="error-container" style={{ minHeight: '60vh', paddingTop: '80px' }}>
          <div className="error-icon">⚠️</div>
          <h2 className="error-title">Failed to Load Course</h2>
          <p className="error-text">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="retry-button"
          >
            Try Again
          </button>
        </div>
        <MainFooter />
      </>
    );
  }

  return (
    <>
      {/* Add Navbar at the top */}
      <Navbar isRegistered={isRegistered} />
      
      {/* Main page content with top padding to account for fixed navbar */}
      <div className="course-notes-page" style={{ paddingTop: '70px' }}>
        {/* Sidebar */}
        <div className="sidebar">
          <div className="sidebar-header">
            <h3 className="sidebar-title">
              {courseData?.course?.code} Navigation
            </h3>
            <p className="sidebar-subtitle">Select year and level</p>
          </div>
          
          <div className="years-list">
            {!courseData?.course?.academic_years ? (
              <p className="no-data">Loading academic years...</p>
            ) : courseData.course.academic_years.length === 0 ? (
              <p className="no-data">No academic years available</p>
            ) : (
              courseData.course.academic_years.map((academicYear) => (
                <div key={academicYear.id} className="year-item">
                  <div className="year-header">
                    <span>📅 Academic Year {academicYear.year}</span>
                    {academicYear.is_current && (
                      <span className="current-badge">Current</span>
                    )}
                  </div>
                  
                  <div className="levels-container">
                    {academicYear.year_levels && academicYear.year_levels.map((yearLevel) => (
                      <div
                        key={yearLevel.id}
                        className={`level-item ${
                          selectedYearLevel?.year === academicYear.year && 
                          selectedYearLevel?.level === yearLevel.level 
                            ? 'level-item-active' : ''
                        }`}
                        onClick={() => fetchYearLevelNotes(academicYear.year, yearLevel.level)}
                      >
                        <div className="level-content">
                          <span className="level-text">{yearLevel.name || `Year ${yearLevel.level}`}</span>
                          <span className="level-subtext">
                            View resources
                          </span>
                        </div>
                        <span className="level-arrow">→</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="main-content">
          {/* Header */}
          <div className="content-header">
            {courseData ? (
              <>
                <div className="header-top">
                  <div className="breadcrumb">
                    <span className="breadcrumb-item">
                      {courseData.faculty?.name || 'Faculty'}
                    </span>
                    <span className="breadcrumb-separator">→</span>
                    <span className="breadcrumb-item">
                      {courseData.course?.code || 'Course'}
                    </span>
                  </div>
                  {/* Free Trial Banner */}
                  <div className="trial-banner">
                    <span className="trial-badge">🎉 FREE TRIAL</span>
                    <span className="trial-text">All content viewable • Downloads coming soon!</span>
                  </div>
                </div>
                <h1 className="course-title">
                  {courseData.course?.name || 'Course Name'}
                </h1>
                <p className="course-description">
                  {courseData.course?.description || 
                   `A comprehensive ${courseData.course?.course_type || 'academic'} program.`}
                </p>
              </>
            ) : (
              <div className="header-skeleton">
                <div className="skeleton-line"></div>
                <div className="skeleton-line"></div>
              </div>
            )}
          </div>

          {/* Content Area */}
          <div className="content-area">
            {loading && (
              <div className="loading-content">
                <div className="loading-spinner"></div>
                <p className="loading-text">Loading resources...</p>
              </div>
            )}

            {!selectedYearLevel && !loading && (
              <div className="empty-state">
                <div className="empty-state-icon">📚</div>
                <h3 className="empty-state-title">Select Year Level</h3>
                <p className="empty-state-text">
                  Choose an academic year and year level from the sidebar to view available notes and resources.
                </p>
              </div>
            )}

            {!loading && yearLevelNotes && (
              <div className="notes-container">
                <div className="notes-header">
                  <div>
                    <h2 className="notes-title">
                      {yearLevelNotes.year_level?.name || `Year ${selectedYearLevel?.level}`} - Academic Year {yearLevelNotes.academic_year || selectedYearLevel?.year}
                    </h2>
                    <p className="notes-subtitle">
                      Course materials organized by semester
                    </p>
                  </div>
                  <div className="notes-count">
                    {yearLevelNotes.year_level?.semesters?.reduce((total, sem) => total + (sem.notes?.length || 0), 0) || 0} resources
                  </div>
                </div>

                {!yearLevelNotes.year_level?.semesters || yearLevelNotes.year_level.semesters.length === 0 ? (
                  <div className="no-notes">
                    <div className="no-notes-icon">📄</div>
                    <h3 className="no-notes-title">No Semesters Available</h3>
                    <p className="no-notes-text">
                      There are no semester data available for {yearLevelNotes.year_level?.name || `Year ${selectedYearLevel?.level}`} yet.
                    </p>
                  </div>
                ) : (
                  <div className="semesters-list">
                    {/* FIXED: Each semester now displays its own specific content */}
                    {yearLevelNotes.year_level.semesters.map((semesterData) => (
                      <div key={semesterData.semester?.id || semesterData.id} className="semester-section">
                        <div className="semester-header">
                          <h3 className="semester-title">
                            📅 {semesterData.semester?.name || `Semester ${semesterData.semester?.semester_number || '1'}`}
                          </h3>
                          <div className="semester-count">
                            {semesterData.notes?.length || 0} {(semesterData.notes?.length || 0) === 1 ? 'resource' : 'resources'}
                          </div>
                        </div>

                        {!semesterData.notes || semesterData.notes.length === 0 ? (
                          <div className="no-semester-notes">
                            <p>No resources available for this semester yet.</p>
                          </div>
                        ) : (
                          <div className="notes-list">
                            {/* FIXED: Display only notes specific to this semester */}
                            {semesterData.notes.map((note, index) => (
                              <div 
                                key={note.id} 
                                className="note-card enhanced-note-card"
                                style={{ animationDelay: `${index * 0.1}s` }}
                              >
                                <div className="note-header">
                                  <div className="note-type">
                                    <span className="note-type-icon">
                                      {getNoteTypeIcon(note.note_type)}
                                    </span>
                                    <span 
                                      className="note-type-badge"
                                      style={{
                                        backgroundColor: getNoteTypeColor(note.note_type) + '20',
                                        color: getNoteTypeColor(note.note_type)
                                      }}
                                    >
                                      {note.note_type ? note.note_type.charAt(0).toUpperCase() + note.note_type.slice(1) : 'Document'}
                                    </span>
                                    
                                    {/* Preview and Premium badges */}
                                    {note.has_preview && (
                                      <span className="preview-badge">👁️ Preview</span>
                                    )}
                                    {note.is_premium && (
                                      <span className="premium-badge">⭐ Premium</span>
                                    )}
                                  </div>
                                  <div className="note-date">
                                    {note.uploaded_at ? new Date(note.uploaded_at).toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      year: 'numeric'
                                    }) : 'No date'}
                                  </div>
                                </div>
                                
                                <h4 className="note-title">{note.title || 'Untitled Document'}</h4>
                                {note.description && (
                                  <p className="note-description">{note.description}</p>
                                )}
                                
                                {/* Enhanced footer with preview system */}
                                <div className="note-footer enhanced-footer">
                                  <div className="note-info">
                                    <span className="file-size">
                                      {formatFileSize(note.file_size)}
                                    </span>
                                    <span className="view-count">
                                      👁️ {note.view_count || 0} views
                                    </span>
                                    <span className="download-count">
                                      📥 {note.download_count || 0} downloads
                                    </span>
                                  </div>
                                  
                                  <div className="note-actions">
                                    {/* Preview button */}
                                    {note.has_preview && (
                                      <button 
                                        className="action-button preview-button"
                                        onClick={() => handlePreview(note)}
                                      >
                                        👁️ Preview
                                      </button>
                                    )}
                                    
                                    {/* View full document button */}
                                    <button 
                                      className="action-button view-button"
                                      onClick={() => handleViewDocument(note)}
                                    >
                                      📖 View Full
                                    </button>
                                    
                                    {/* Download button (disabled in trial) */}
                                    <button 
                                      className="action-button download-button disabled"
                                      onClick={() => handleDownload(note)}
                                      title="Downloads available after launch"
                                    >
                                      📥 Download
                                      <span className="coming-soon">Soon</span>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Preview Modal */}
        {previewModal.isOpen && (
          <div className="modal-overlay" onClick={closePreviewModal}>
            <div className="modal-content preview-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>📄 Preview: {previewModal.note?.title}</h3>
                <button className="close-button" onClick={closePreviewModal}>
                  ✕
                </button>
              </div>
              
              <div className="modal-body">
                {previewModal.loading ? (
                  <div className="preview-loading">
                    <div className="loading-spinner"></div>
                    <p>Loading preview...</p>
                  </div>
                ) : previewModal.previewData ? (
                  <div className="preview-content">
                    <div className="preview-info">
                      <p className="preview-description">
                        {previewModal.previewData.description || 'Document preview showing first page and sample content'}
                      </p>
                      
                      {previewModal.previewData.preview_url && (
                        <div className="preview-frame">
                          <iframe
                            src={previewModal.previewData.preview_url}
                            title="Document Preview"
                            width="100%"
                            height="500px"
                            frameBorder="0"
                          />
                        </div>
                      )}
                      
                      <div className="preview-actions">
                        <div className="trial-notice">
                          <span className="trial-icon">🎉</span>
                          <span>Free trial - View full document at no cost!</span>
                        </div>
                        
                        <button 
                          className="action-button view-full-button"
                          onClick={() => {
                            closePreviewModal();
                            handleViewDocument(previewModal.note);
                          }}
                        >
                          📖 View Full Document
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="preview-error">
                    <p>Failed to load preview</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Add Footer at the bottom */}
      <MainFooter />
    </>
  );
};

export default CourseNotesPage;