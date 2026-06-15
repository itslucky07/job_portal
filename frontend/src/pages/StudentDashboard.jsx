import React, { useState, useEffect } from 'react';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import './StudentDashboard.css';

const StudentDashboard = () => {
  const { user, updateProfile } = useAuth();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Profile Form state
  const [fname, setFname] = useState(user?.first_name || '');
  const [lname, setLname] = useState(user?.last_name || '');
  const [mobile, setMobile] = useState(user?.profile?.mobile || '');
  const [gender, setGender] = useState(user?.profile?.gender || 'Male');
  const [image, setImage] = useState(null);
  const [resumePdf, setResumePdf] = useState(null);

  const [updateError, setUpdateError] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const response = await client.get('student/dashboard/');
      setAppliedJobs(response.data.applied);
      setSavedJobs(response.data.saved);
    } catch (err) {
      console.error('Failed to fetch student dashboard data:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleUnsaveJob = async (jobId) => {
    try {
      await client.delete(`jobs/${jobId}/save/`);
      setSavedJobs(savedJobs.filter(s => s.job.id !== jobId));
    } catch (err) {
      console.error('Failed to unsave job:', err);
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
    if (image) {
      formData.append('image', image);
    }
    if (resumePdf) {
      formData.append('resume_pdf', resumePdf);
    }

    const result = await updateProfile(formData);
    setUpdating(false);

    if (result.success) {
      setUpdateSuccess('Profile updated successfully!');
    } else {
      setUpdateError(result.error);
    }
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading candidate dashboard...</div>;
  }

  return (
    <div className="student-container">
      <header className="student-header">
        <h1>Candidate Dashboard</h1>
        <p className="subtitle">Manage your credentials, track application statuses, and inspect bookmarked roles</p>
      </header>

      {/* Tab Switcher */}
      <div className="tabs-header">
        <button 
          onClick={() => setActiveTab('profile')} 
          className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
        >
          👤 My Profile
        </button>
        <button 
          onClick={() => setActiveTab('applications')} 
          className={`tab-btn ${activeTab === 'applications' ? 'active' : ''}`}
        >
          ✉ Applied Jobs ({appliedJobs.length})
        </button>
        <button 
          onClick={() => setActiveTab('bookmarks')} 
          className={`tab-btn ${activeTab === 'bookmarks' ? 'active' : ''}`}
        >
          ★ Saved Jobs ({savedJobs.length})
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-body">
        
        {/* PROFILE TAB */}
        {activeTab === 'profile' && (
          <section className="profile-tab-section">
            <h2>Personal Information</h2>
            {updateError && <div className="error-alert">{updateError}</div>}
            {updateSuccess && <div className="success-alert">{updateSuccess}</div>}

            <form onSubmit={handleProfileSubmit} className="profile-grid-form">
              <div className="form-row-grid">
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
                  <label>Gender</label>
                  <select value={gender} onChange={(e) => setGender(e.target.value)}>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="form-files-row">
                <div className="form-group-sm">
                  <label>Upload Photo</label>
                  <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} />
                </div>
                <div className="form-group-sm">
                  <label>Upload Resume PDF</label>
                  <input type="file" accept=".pdf" onChange={(e) => setResumePdf(e.target.files[0])} />
                </div>
              </div>

              <button type="submit" className="student-save-btn" disabled={updating}>
                {updating ? 'Saving Details...' : 'Save Profile'}
              </button>
            </form>
          </section>
        )}

        {/* APPLICATIONS TAB */}
        {activeTab === 'applications' && (
          <section className="applications-tab-section">
            <h2>Job Applications Status</h2>
            {appliedJobs.length === 0 ? (
              <div className="empty-tab-state">
                <p>You haven't applied to any job listings yet.</p>
              </div>
            ) : (
              <div className="applications-list-deck">
                {appliedJobs.map(app => (
                  <div key={app.id} className="app-status-card">
                    <div className="app-status-card-header">
                      <h3>{app.job.title}</h3>
                      <span className={`status-pill ${app.status.toLowerCase()}`}>
                        {app.status === 'Accept' ? 'Shortlisted' : app.status === 'Reject' ? 'Not Selected' : 'Under Review'}
                      </span>
                    </div>
                    <p className="company-tag">🏢 {app.job.recruiter_user?.company || 'Employer'}</p>
                    <p className="details-sub">📍 {app.job.location} | Date Applied: {app.apply_date}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* BOOKMARKS TAB */}
        {activeTab === 'bookmarks' && (
          <section className="bookmarks-tab-section">
            <h2>Bookmarked Vacancies</h2>
            {savedJobs.length === 0 ? (
              <div className="empty-tab-state">
                <p>You haven't bookmarked any jobs yet.</p>
              </div>
            ) : (
              <div className="saved-jobs-deck">
                {savedJobs.map(item => (
                  <div key={item.id} className="saved-job-card">
                    <div className="saved-job-card-header">
                      <h3>{item.job.title}</h3>
                      <button 
                        onClick={() => handleUnsaveJob(item.job.id)}
                        className="unsave-btn"
                      >
                        Remove ★
                      </button>
                    </div>
                    <p className="company-tag">🏢 {item.job.recruiter_user?.company || 'Employer'}</p>
                    <p className="details-sub">📍 {item.job.location} | Date Saved: {item.saved_date}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

      </div>
    </div>
  );
};

export default StudentDashboard;
