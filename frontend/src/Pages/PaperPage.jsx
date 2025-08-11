import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './PaperPage.css';
import Navbar from '../components/Navbar'; // Assuming you have a Navbar component

const CourseNotesPage = () => {
  const { facultyCode, courseCode } = useParams();
  
  const [courseData, setCourseData] = useState(null);
  const [selectedYearLevel, setSelectedYearLevel] = useState(null);
  const [yearLevelNotes, setYearLevelNotes] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch course details when component mounts
  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setInitialLoading(true);
        const response = await fetch(`http://localhost:8000/api/faculties/${facultyCode}/courses/${courseCode}/`);
        
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

  // Fetch notes for specific year level
  const fetchYearLevelNotes = async (year, level) => {
    setLoading(true);
    setSelectedYearLevel({ year, level });
    
    try {
      const response = await fetch(
        `http://localhost:8000/api/faculties/${facultyCode}/courses/${courseCode}/${year}/year/${level}/`
      );
      
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
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Loading course information...</p>
      </div>
    );
  }

  if (error && !courseData) {
    return (
      <div className="error-container">
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
    );
  }

  return (
      
    <div className="course-notes-page">
      
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
                  {yearLevelNotes.year_level.semesters.map((semester) => (
                    <div key={semester.semester?.id || semester.id} className="semester-section">
                      <div className="semester-header">
                        <h3 className="semester-title">
                          📅 {semester.semester?.name || `Semester ${semester.semester?.semester_number || '1'}`}
                        </h3>
                        <div className="semester-count">
                          {semester.notes?.length || 0} {(semester.notes?.length || 0) === 1 ? 'resource' : 'resources'}
                        </div>
                      </div>

                      {!semester.notes || semester.notes.length === 0 ? (
                        <div className="no-semester-notes">
                          <p>No resources available for this semester yet.</p>
                        </div>
                      ) : (
                        <div className="notes-list">
                          {semester.notes.map((note, index) => (
                            <div 
                              key={note.id} 
                              className="note-card"
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
                              
                              <div className="note-footer">
                                {note.file_url && (
                                  <a 
                                    href={note.file_url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="download-button"
                                  >
                                    <span>📥</span>
                                    Download
                                    {note.file_size && (
                                      <span className="file-size">
                                        ({formatFileSize(note.file_size)})
                                      </span>
                                    )}
                                  </a>
                                )}
                                <div className="note-actions">
                                  <button className="action-button">
                                    👁️ Preview
                                  </button>
                                  <button className="action-button">
                                    📤 Share
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

          {error && selectedYearLevel && (
            <div className="error-state">
              <div className="error-icon">⚠️</div>
              <h3 className="error-title">Failed to Load Resources</h3>
              <p className="error-text">{error}</p>
              <button 
                onClick={() => fetchYearLevelNotes(selectedYearLevel.year, selectedYearLevel.level)}
                className="retry-button"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
 
  );
};



export default CourseNotesPage;