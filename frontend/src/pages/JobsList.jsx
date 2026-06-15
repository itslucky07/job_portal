import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import './JobsList.css';

const JobsList = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [mobileDetailActive, setMobileDetailActive] = useState(false);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [loading, setLoading] = useState(true);

  // Apply Form state
  const [resumeFile, setResumeFile] = useState(null);
  const [applying, setApplying] = useState(false);
  const [applyError, setApplyError] = useState('');
  const [applySuccess, setApplySuccess] = useState('');
  
  // Track applied/saved IDs to dynamically show state
  const [appliedJobIds, setAppliedJobIds] = useState([]);
  const [savedJobIds, setSavedJobIds] = useState([]);

  // Fetch jobs
  const fetchJobs = async () => {
    setLoading(true);
    try {
      const response = await client.get(`jobs/?search=${encodeURIComponent(search)}&location=${encodeURIComponent(location)}`);
      setJobs(response.data);
      if (response.data.length > 0) {
        setSelectedJob(response.data[0]); // Select first job by default
      } else {
        setSelectedJob(null);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
    setLoading(false);
  };

  // Fetch current student's dashboards to get applied/saved history
  const fetchStudentHistory = async () => {
    if (user && user.role === 'student') {
      try {
        const response = await client.get('student/dashboard/');
        setAppliedJobIds(response.data.applied.map(app => app.job.id));
        setSavedJobIds(response.data.saved.map(s => s.job.id));
      } catch (error) {
        console.error('Error fetching student history:', error);
      }
    }
  };

  useEffect(() => {
    const searchVal = searchParams.get('search') || '';
    const locationVal = searchParams.get('location') || '';
    setSearch(searchVal);
    setLocation(locationVal);
  }, [searchParams]);

  useEffect(() => {
    fetchJobs();
    fetchStudentHistory();
  }, [search, location, user]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchJobs();
  };

  const handleJobSelect = (job) => {
    setSelectedJob(job);
    setMobileDetailActive(true);
    setApplyError('');
    setApplySuccess('');
    setResumeFile(null);
  };

  const handleFileChange = (e) => {
    setResumeFile(e.target.files[0]);
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    if (!resumeFile) {
      setApplyError('Please upload a resume.');
      return;
    }

    setApplying(true);
    setApplyError('');
    setApplySuccess('');

    const formData = new FormData();
    formData.append('resume', resumeFile);

    try {
      await client.post(`jobs/${selectedJob.id}/apply/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setApplySuccess('Applied successfully!');
      setAppliedJobIds([...appliedJobIds, selectedJob.id]);
    } catch (error) {
      setApplyError(error.response?.data?.error || 'Failed to submit application.');
    }
    setApplying(false);
  };

  const handleSaveToggle = async () => {
    const isSaved = savedJobIds.includes(selectedJob.id);
    try {
      if (isSaved) {
        await client.delete(`jobs/${selectedJob.id}/save/`);
        setSavedJobIds(savedJobIds.filter(id => id !== selectedJob.id));
      } else {
        await client.post(`jobs/${selectedJob.id}/save/`);
        setSavedJobIds([...savedJobIds, selectedJob.id]);
      }
    } catch (error) {
      console.error('Failed to toggle bookmark:', error);
    }
  };

  return (
    <div className={`jobs-explorer ${mobileDetailActive ? 'mobile-detail-active' : ''}`}>
      {/* Search Header */}
      <section className="search-bar-section">
        <form onSubmit={handleSearchSubmit} className="search-form">
          <div className="search-input-group">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Job title, keywords, or skills..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="search-input-group">
            <span className="search-icon">📍</span>
            <input
              type="text"
              placeholder="City, state, or country..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
          <button type="submit" className="search-btn">Find Jobs</button>
        </form>
      </section>

      {/* Main Split-Pane */}
      <div className="split-layout">
        {/* Left Pane: Job List */}
        <aside className="left-pane">
          {loading ? (
            <div className="pane-loader">Searching active jobs...</div>
          ) : jobs.length === 0 ? (
            <div className="pane-empty">
              <h3>No jobs match your search</h3>
              <p>Try clearing your filters or adjusting your keywords.</p>
            </div>
          ) : (
            <div className="job-cards-list">
              {jobs.map(job => (
                <div
                  key={job.id}
                  className={`job-card-explorer ${selectedJob?.id === job.id ? 'active' : ''}`}
                  onClick={() => handleJobSelect(job)}
                >
                  <div className="card-top">
                    <h3>{job.title}</h3>
                    {job.salary && <span className="salary-badge">${job.salary.toLocaleString()}</span>}
                  </div>
                  <h4 className="company-text">🏢 {job.recruiter_user?.company || 'Employer'}</h4>
                  <p className="description-preview">{job.description}</p>
                  <div className="card-meta">
                    <span>📍 {job.location}</span>
                    <span>⏳ {job.experience} exp</span>
                  </div>
                  {job.skills && (
                    <div className="skills-tags-row">
                      {job.skills.split(',').slice(0, 3).map((skill, index) => (
                        <span key={index} className="skill-mini">{skill.trim()}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </aside>

        {/* Right Pane: Job Detail */}
        <section className="right-pane">
          {selectedJob ? (
            <div className="job-detail-panel">
              <button 
                onClick={() => setMobileDetailActive(false)} 
                className="back-to-list-btn"
              >
                ← Back to List
              </button>
              <header className="detail-header">
                <div className="detail-header-left">
                  <h2>{selectedJob.title}</h2>
                  <h3>🏢 {selectedJob.recruiter_user?.company || 'Employer'}</h3>
                  <div className="detail-meta">
                    <span>📍 {selectedJob.location}</span>
                    <span>💰 Salary: ${selectedJob.salary?.toLocaleString()} / yr</span>
                    <span>💼 Exp Required: {selectedJob.experience}</span>
                  </div>
                </div>

                {user && user.role === 'student' && (
                  <button
                    onClick={handleSaveToggle}
                    className={`save-bookmark-btn ${savedJobIds.includes(selectedJob.id) ? 'saved' : ''}`}
                  >
                    {savedJobIds.includes(selectedJob.id) ? '★ Saved' : '☆ Save'}
                  </button>
                )}
              </header>

              <div className="detail-body">
                <h3>Job Description</h3>
                <p className="full-desc">{selectedJob.description}</p>

                {selectedJob.skills && (
                  <div className="detail-skills">
                    <h3>Required Skills</h3>
                    <div className="skills-tags-row">
                      {selectedJob.skills.split(',').map((skill, index) => (
                        <span key={index} className="skill-badge">{skill.trim()}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Application Handling */}
              <footer className="detail-footer">
                {!user ? (
                  <div className="guest-apply-banner">
                    <p>Interested in this job? Register or login as a Candidate to apply!</p>
                  </div>
                ) : user.role !== 'student' ? (
                  <div className="role-apply-banner">
                    <p>Only Candidate/Student accounts can apply to job listings.</p>
                  </div>
                ) : appliedJobIds.includes(selectedJob.id) ? (
                  <div className="applied-success-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
                    <div className="applied-success-banner" style={{ marginBottom: 0 }}>
                      ✓ You have successfully applied to this job post.
                    </div>
                    <Link 
                      to={`/chat?user=${selectedJob.recruiter_user?.user?.id}`} 
                      className="message-employer-btn"
                      style={{
                        display: 'inline-block',
                        padding: '12px 20px',
                        backgroundColor: 'var(--accent)',
                        color: '#fff',
                        fontWeight: 'bold',
                        textAlign: 'center',
                        borderRadius: '8px',
                        textDecoration: 'none',
                        transition: 'opacity 0.2s ease',
                      }}
                      onMouseEnter={(e) => e.target.style.opacity = '0.9'}
                      onMouseLeave={(e) => e.target.style.opacity = '1'}
                    >
                      💬 Message Employer
                    </Link>
                  </div>
                ) : (
                  <div className="apply-form-container">
                    <h3>Apply for this position</h3>
                    {applyError && <div className="error-alert">{applyError}</div>}
                    {applySuccess && <div className="success-alert">{applySuccess}</div>}

                    <form onSubmit={handleApplySubmit} className="quick-apply-form">
                      <div className="form-upload">
                        <label htmlFor="resume-upload">Upload Resume (PDF/Doc)</label>
                        <input
                          type="file"
                          id="resume-upload"
                          accept=".pdf,.doc,.docx"
                          onChange={handleFileChange}
                          required
                        />
                      </div>
                      <button type="submit" className="apply-submit-btn" disabled={applying}>
                        {applying ? 'Submitting Application...' : 'Send Resume'}
                      </button>
                    </form>
                  </div>
                )}
              </footer>
            </div>
          ) : (
            <div className="detail-empty">
              <h3>Select a job to view details</h3>
              <p>Explore matching listings by clicking cards in the sidebar.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default JobsList;
