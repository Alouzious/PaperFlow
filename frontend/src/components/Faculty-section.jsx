import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Faculty-section.css'; // Import the CSS file

function FacultyDashboard() {
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:8000/api/dashboard/')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch dashboard data');
        return res.json();
      })
      .then(data => {
        setFaculties(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="loading">Loading faculties...</div>;
  if (error) return <div className="error">Error loading faculties: {error}</div>;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">
          Explore Your Faculty and Courses — Start Your Academic Journey with 
          <span className="brand-highlight"> PaperFlow</span>
        </h1>
      </div>
      <div className="faculties-grid">
        {faculties.map(faculty => (
          <FacultyCard key={faculty.id} faculty={faculty} navigate={navigate} />
        ))}
      </div>
    </div>
  );
}

function FacultyCard({ faculty, navigate }) {
  // Separate bachelor and diploma courses
  const bachelorCourses = faculty.courses.all.filter(c => c.course_type === 'bachelor');
  const diplomaCourses = faculty.courses.all.filter(c => c.course_type === 'diploma');

  // When user clicks a course, navigate to notes page
  const handleCourseClick = (facultyCode, courseCode) => {
    navigate(`/notes/${facultyCode}/${courseCode}`);
  };

  return (
    <div className="faculty-card" >
      <div className="faculty-header">
        <h2 className="faculty-name">{faculty.name}</h2>
        <p className="faculty-description">{faculty.description}</p>
      </div>

      <div className="courses-container" id='faculties'>
        {/* Bachelor Courses Column */}
        <div className="course-section">
          <div className="section-header bachelor-header">
            <h3>Bachelor Courses</h3>
          </div>
          {bachelorCourses.length === 0 ? (
            <div className="no-courses">Coming Very Soon</div>
          ) : (
            <div className="courses-list">
              {bachelorCourses.map(course => (
                <button
                  key={course.id}
                  onClick={() => handleCourseClick(faculty.code, course.code)}
                  className="course-button bachelor-course"
                >
                  <span className="course-name">{course.name}</span>
                  <span className="course-code">({course.code})</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Diploma Courses Column */}
        <div className="course-section">
          <div className="section-header diploma-header">
            <h3>Diploma Courses</h3>
          </div>
          {diplomaCourses.length === 0 ? (
            <div className="no-courses">Coming Very Soon</div>
          ) : (
            <div className="courses-list">
              {diplomaCourses.map(course => (
                <button
                  key={course.id}
                  onClick={() => handleCourseClick(faculty.code, course.code)}
                  className="course-button diploma-course"
                >
                  <span className="course-name">{course.name}</span>
                  <span className="course-code">({course.code})</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default FacultyDashboard;