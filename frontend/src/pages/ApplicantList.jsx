import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import './ApplicantList.css';

const getBackendHost = () => {
  const protocol = window.location.protocol;
  const host = window.location.hostname;
  const port = window.location.port;
  if (port === '5173' || port === '3000') {
    return `${protocol}//${host}:8000`;
  }
  return `${protocol}//${host}${port ? `:${port}` : ''}`;
};

const ApplicantList = () => {
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterJob, setFilterJob] = useState('All');
  
  // Unique list of jobs for filtering
  const [jobTitles, setJobTitles] = useState([]);

  const fetchApplicants = async () => {
    try {
      const response = await client.get('recruiter/applicants/');
      setApplicants(response.data);
      
      // Extract unique job titles
      const titles = ['All', ...new Set(response.data.map(app => app.job_title))];
      setJobTitles(titles);
    } catch (err) {
      console.error('Failed to fetch applicants:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchApplicants();
  }, []);

  const handleStatusChange = async (appId, newStatus) => {
    try {
      await client.put(`recruiter/applications/${appId}/`, { status: newStatus });
      // Update local state to reflect the change immediately
      setApplicants(applicants.map(app => 
        app.id === appId ? { ...app, status: newStatus } : app
      ));
    } catch (err) {
      console.error('Failed to update applicant status:', err);
    }
  };

  const filteredApplicants = filterJob === 'All' 
    ? applicants 
    : applicants.filter(app => app.job_title === filterJob);

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading candidate list...</div>;
  }

  return (
    <div className="applicants-container">
      <header className="applicants-header">
        <h1>Candidate Applications</h1>
        <p className="subtitle">Review profile bio details, download resumes, and update recruitment pipeline statuses</p>
      </header>
 
      {/* Filter Section */}
      <section className="filter-bar-section">
        <label htmlFor="job-filter">Filter by Position:</label>
        <select 
          id="job-filter"
          value={filterJob} 
          onChange={(e) => setFilterJob(e.target.value)}
          className="job-filter-select"
        >
          {jobTitles.map((title, index) => (
            <option key={index} value={title}>{title}</option>
          ))}
        </select>
      </section>
 
      {/* List / Cards Board */}
      {filteredApplicants.length === 0 ? (
        <div className="empty-applicants-state">
          <h3>No applications found</h3>
          <p>No candidates have applied for this position filter yet.</p>
        </div>
      ) : (
        <div className="applicants-grid">
          {filteredApplicants.map(app => (
            <div key={app.id} className="applicant-card">
              <div className="card-header-app">
                <span className={`status-pill ${app.status.toLowerCase()}`}>
                  {app.status === 'Accept' ? 'Shortlisted' : app.status === 'Reject' ? 'Not Selected' : 'Under Review'}
                </span>
                <span className="app-date">Date: {app.apply_date}</span>
              </div>
 
              <div className="card-body-app">
                <h3 className="candidate-name">{app.student.first_name} {app.student.last_name}</h3>
                <h4 className="applied-position">Applied: <strong>{app.job_title}</strong></h4>
                
                <div className="contact-details">
                  <p>📧 {app.student.email}</p>
                  <p>📞 {app.student.mobile}</p>
                  <p>👤 Gender: {app.student.gender}</p>
                </div>
              </div>
 
              <div className="card-actions-app">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', marginBottom: '12px' }}>
                  {app.resume_url ? (
                    <a 
                      href={`${getBackendHost()}${app.resume_url}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="view-resume-btn"
                      style={{ textAlign: 'center', display: 'block' }}
                    >
                      📄 View Resume
                    </a>
                  ) : (
                    <span className="no-resume-badge" style={{ textAlign: 'center', display: 'block' }}>No Resume Document</span>
                  )}
                  
                  <Link 
                    to={`/chat?user=${app.student.user_id}`}
                    className="view-resume-btn"
                    style={{ 
                      textAlign: 'center', 
                      display: 'block', 
                      backgroundColor: 'var(--accent-bg)',
                      color: 'var(--accent)',
                      border: '1px solid var(--accent-border)'
                    }}
                  >
                    💬 Message Candidate
                  </Link>
                </div>

                <div className="pipeline-controls">
                  <button 
                    onClick={() => handleStatusChange(app.id, 'Accept')}
                    className="approve-btn"
                    disabled={app.status === 'Accept'}
                  >
                    ✓ Approve
                  </button>
                  <button 
                    onClick={() => handleStatusChange(app.id, 'Reject')}
                    className="reject-btn"
                    disabled={app.status === 'Reject'}
                  >
                    ✗ Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ApplicantList;
