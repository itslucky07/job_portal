import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import './RecruiterDashboard.css';

const getBackendHost = () => {
  const protocol = window.location.protocol;
  const host = window.location.hostname;
  const port = window.location.port;
  if (port === '5173' || port === '3000') {
    return `${protocol}//${host}:8000`;
  }
  return `${protocol}//${host}${port ? `:${port}` : ''}`;
};

const RecruiterDashboard = () => {
  const { user, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('jobs'); // 'jobs', 'applicants', 'profile'
  const [stats, setStats] = useState({ total_posted: 0, applicants_count: 0, approved_count: 0 });
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Applicants states
  const [applicants, setApplicants] = useState([]);
  const [filterJob, setFilterJob] = useState('All');
  const [jobTitles, setJobTitles] = useState([]);
  const [loadingApplicants, setLoadingApplicants] = useState(false);

  // Profile Form state
  const [fname, setFname] = useState(user?.first_name || '');
  const [lname, setLname] = useState(user?.last_name || '');
  const [mobile, setMobile] = useState(user?.profile?.mobile || '');
  const [gender, setGender] = useState(user?.profile?.gender || 'Male');
  const [company, setCompany] = useState(user?.profile?.company || '');
  const [image, setImage] = useState(null);
  
  const [updateError, setUpdateError] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const response = await client.get('recruiter/dashboard/');
      setStats(response.data.stats);
      setJobs(response.data.jobs);
    } catch (err) {
      console.error('Failed to fetch recruiter dashboard data:', err);
    }
    setLoading(false);
  };

  const fetchApplicantsData = async () => {
    setLoadingApplicants(true);
    try {
      const response = await client.get('recruiter/applicants/');
      setApplicants(response.data);
      // Extract unique job titles
      const titles = ['All', ...new Set(response.data.map(app => app.job_title))];
      setJobTitles(titles);
    } catch (err) {
      console.error('Failed to fetch applicants:', err);
    }
    setLoadingApplicants(false);
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (activeTab === 'applicants') {
      fetchApplicantsData();
    }
  }, [activeTab]);

  const handleDeleteJob = async (jobId) => {
    if (window.confirm('Are you sure you want to delete this job listing?')) {
      try {
        await client.delete(`recruiter/jobs/${jobId}/`);
        fetchDashboardData();
      } catch (err) {
        console.error('Failed to delete job:', err);
      }
    }
  };

  const handleStatusChange = async (appId, newStatus) => {
    try {
      await client.put(`recruiter/applications/${appId}/`, { status: newStatus });
      setApplicants(applicants.map(app => 
        app.id === appId ? { ...app, status: newStatus } : app
      ));
      // Refresh stats card
      const statsResponse = await client.get('recruiter/dashboard/');
      setStats(statsResponse.data.stats);
    } catch (err) {
      console.error('Failed to update applicant status:', err);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setUpdateError('');
    setUpdateSuccess('');
    setUpdating(true);

    const formData = new FormData();
    formData.append('first_name', fname);
    formData.append('last_name', lname);
    formData.append('mobile', mobile);
    formData.append('gender', gender);
    formData.append('company', company);
    if (image) {
      formData.append('image', image);
    }

    const result = await updateProfile(formData);
    setUpdating(false);

    if (result.success) {
      setUpdateSuccess('Profile updated successfully!');
    } else {
      setUpdateError(result.error);
    }
  };

  const filteredApplicants = filterJob === 'All' 
    ? applicants 
    : applicants.filter(app => app.job_title === filterJob);

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading Employer console...</div>;
  }

  return (
    <div className="recruiter-container">
      <header className="recruiter-header">
        <h1>Employer Console</h1>
        <p className="subtitle">Manage job openings, candidate applicants, and organization details</p>
      </header>

      {/* Stats Cards */}
      <section className="stats-row">
        <div className="stat-card">
          <div className="stat-value">{stats.total_posted}</div>
          <div className="stat-label">Jobs Published</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.applicants_count}</div>
          <div className="stat-label">Candidates Applied</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.approved_count}</div>
          <div className="stat-label">Approved Applications</div>
        </div>
      </section>

      {/* Tab Switcher */}
      <div className="tabs-header">
        <button 
          onClick={() => setActiveTab('jobs')} 
          className={`tab-btn ${activeTab === 'jobs' ? 'active' : ''}`}
        >
          💼 Job Openings ({stats.total_posted})
        </button>
        <button 
          onClick={() => setActiveTab('applicants')} 
          className={`tab-btn ${activeTab === 'applicants' ? 'active' : ''}`}
        >
          👥 Applicants ({stats.applicants_count})
        </button>
        <button 
          onClick={() => setActiveTab('profile')} 
          className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
        >
          🏢 Organization Bio
        </button>
      </div>

      {/* Tab Body Contents */}
      <div className="tab-body" style={{ marginTop: '20px' }}>
        
        {/* JOBS TAB */}
        {activeTab === 'jobs' && (
          <section className="jobs-table-section">
            <div className="section-header">
              <h2>Published Job Openings</h2>
              <Link to="/add-job" className="btn-primary-sm">+ Post Job</Link>
            </div>

            {jobs.length === 0 ? (
              <div className="empty-table-state">
                <p>You haven't posted any job openings yet.</p>
                <Link to="/add-job" className="btn-link">Publish your first job now</Link>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="dashboard-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Location</th>
                      <th>Salary</th>
                      <th>Duration</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobs.map(job => (
                      <tr key={job.id}>
                        <td>
                          <strong>{job.title}</strong>
                          <span className="table-subtext">Posted: {job.creationdate}</span>
                        </td>
                        <td>📍 {job.location}</td>
                        <td>💰 ${job.salary?.toLocaleString()}</td>
                        <td>📅 {job.start_date} to {job.end_date}</td>
                        <td>
                          <div className="action-buttons-row">
                            <Link to={`/edit-job/${job.id}`} className="edit-action-btn">Edit</Link>
                            <button onClick={() => handleDeleteJob(job.id)} className="delete-action-btn">Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {/* APPLICANTS TAB */}
        {activeTab === 'applicants' && (
          <section className="applicants-section">
            <div className="section-header" style={{ flexWrap: 'wrap', gap: '15px' }}>
              <h2>Candidate Applications</h2>
              
              {/* Position Filter */}
              {jobTitles.length > 1 && (
                <div className="filter-bar-section" style={{ border: 'none', padding: 0, margin: 0, backgroundColor: 'transparent' }}>
                  <label htmlFor="job-filter" style={{ marginRight: '8px', fontSize: '13px' }}>Filter by Position:</label>
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
                </div>
              )}
            </div>

            {loadingApplicants ? (
              <div style={{ padding: '40px', textAlign: 'center' }}>Loading candidate list...</div>
            ) : filteredApplicants.length === 0 ? (
              <div className="empty-table-state">
                <p>No candidate applications found.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="dashboard-table">
                  <thead>
                    <tr>
                      <th>Candidate</th>
                      <th>Applied Position</th>
                      <th>Contact Info</th>
                      <th>Pipeline Status</th>
                      <th>Resume</th>
                      <th>Action Control</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredApplicants.map(app => (
                      <tr key={app.id}>
                        <td>
                          <strong>{app.student.first_name} {app.student.last_name}</strong>
                          <span className="table-subtext">Applied: {app.apply_date}</span>
                        </td>
                        <td>
                          <strong style={{ color: 'var(--primary-indigo)' }}>{app.job_title}</strong>
                        </td>
                        <td>
                          <span style={{ display: 'block', fontSize: '13px' }}>📧 {app.student.email}</span>
                          <span style={{ display: 'block', fontSize: '13px', marginTop: '2px' }}>📞 {app.student.mobile}</span>
                          <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)' }}>Gender: {app.student.gender}</span>
                        </td>
                        <td>
                          <span className={`status-pill ${app.status.toLowerCase()}`}>
                            {app.status === 'Accept' ? 'Shortlisted' : app.status === 'Reject' ? 'Not Selected' : 'Under Review'}
                          </span>
                        </td>
                        <td>
                          {app.resume_url ? (
                            <a 
                              href={`${getBackendHost()}${app.resume_url}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="view-resume-btn"
                            >
                              📄 View Resume
                            </a>
                          ) : (
                            <span className="no-resume-badge">No Document</span>
                          )}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <div className="pipeline-controls">
                              <button 
                                onClick={() => handleStatusChange(app.id, 'Accept')}
                                className="approve-btn"
                                disabled={app.status === 'Accept'}
                              >
                                ✓ Shortlist
                              </button>
                              <button 
                                onClick={() => handleStatusChange(app.id, 'Reject')}
                                className="reject-btn"
                                disabled={app.status === 'Reject'}
                              >
                                ✗ Reject
                              </button>
                            </div>
                            <Link 
                              to={`/chat?user=${app.student.user_id}`}
                              className="view-resume-btn"
                              style={{ 
                                backgroundColor: 'var(--accent-bg)',
                                color: 'var(--accent)',
                                borderColor: 'var(--accent-border)'
                              }}
                            >
                              💬 Message
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {/* PROFILE TAB */}
        {activeTab === 'profile' && (
          <section className="profile-form-section" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2>Organization Details</h2>
            {updateError && <div className="error-alert">{updateError}</div>}
            {updateSuccess && <div className="success-alert">{updateSuccess}</div>}

            <form onSubmit={handleProfileSubmit} className="profile-form">
              <div className="form-group-sm">
                <label>First Name</label>
                <input type="text" value={fname} onChange={(e) => setFname(e.target.value)} required />
              </div>
              <div className="form-group-sm">
                <label>Last Name</label>
                <input type="text" value={lname} onChange={(e) => setLname(e.target.value)} required />
              </div>
              <div className="form-group-sm">
                <label>Mobile Contact</label>
                <input type="text" value={mobile} onChange={(e) => setMobile(e.target.value)} required />
              </div>
              <div className="form-group-sm">
                <label>Company Name</label>
                <input type="text" value={company} onChange={(e) => setCompany(e.target.value)} required />
              </div>
              <div className="form-group-sm">
                <label>Gender</label>
                <select value={gender} onChange={(e) => setGender(e.target.value)}>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-group-sm">
                <label>Replace Logo</label>
                <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} />
              </div>
              <button type="submit" className="profile-save-btn" disabled={updating}>
                {updating ? 'Saving Changes...' : 'Update Details'}
              </button>
            </form>
          </section>
        )}

      </div>
    </div>
  );
};

export default RecruiterDashboard;
