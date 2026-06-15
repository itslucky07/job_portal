import React, { useState, useEffect } from 'react';
import client from '../api/client';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({ total_students: 0, total_recruiters: 0, total_jobs: 0, total_applications: 0 });
  const [recruiters, setRecruiters] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const response = await client.get('admin/dashboard/');
      setStats(response.data);
    } catch (err) {
      console.error('Failed to fetch admin stats:', err);
    }
  };

  const fetchRecruiters = async () => {
    try {
      const response = await client.get('admin/recruiters/');
      setRecruiters(response.data);
    } catch (err) {
      console.error('Failed to fetch recruiters list:', err);
    }
  };

  const fetchCandidates = async () => {
    try {
      const response = await client.get('admin/candidates/');
      setCandidates(response.data);
    } catch (err) {
      console.error('Failed to fetch candidates list:', err);
    }
  };

  const loadAllData = async () => {
    setLoading(true);
    await Promise.all([fetchStats(), fetchRecruiters(), fetchCandidates()]);
    setLoading(false);
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleApproveRecruiter = async (recId, approveStatus) => {
    try {
      await client.put(`admin/recruiters/${recId}/approve/`, { status: approveStatus });
      // Update local state directly
      setRecruiters(recruiters.map(rec => 
        rec.id === recId ? { ...rec, status: approveStatus } : rec
      ));
      // Refresh statistics
      fetchStats();
    } catch (err) {
      console.error('Failed to update recruiter status:', err);
    }
  };

  const handleDeleteCandidate = async (candId) => {
    if (window.confirm('Are you sure you want to delete this candidate account? This action is permanent.')) {
      try {
        await client.delete(`admin/candidates/${candId}/`);
        setCandidates(candidates.filter(c => c.id !== candId));
        // Refresh statistics
        fetchStats();
      } catch (err) {
        console.error('Failed to delete candidate:', err);
      }
    }
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading Admin console...</div>;
  }

  return (
    <div className="admin-container">
      <header className="admin-header">
        <h1>Admin Control Center</h1>
        <p className="subtitle">Supervise platform usage, register verification loops, and database records</p>
      </header>

      {/* Tabs Switcher */}
      <div className="admin-tabs">
        <button 
          onClick={() => setActiveTab('overview')} 
          className={`admin-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
        >
          📊 Overview
        </button>
        <button 
          onClick={() => setActiveTab('recruiters')} 
          className={`admin-tab-btn ${activeTab === 'recruiters' ? 'active' : ''}`}
        >
          💼 Employer Approvals ({recruiters.filter(r => r.status === 'pending').length} pending)
        </button>
        <button 
          onClick={() => setActiveTab('candidates')} 
          className={`admin-tab-btn ${activeTab === 'candidates' ? 'active' : ''}`}
        >
          👤 Candidate Database ({candidates.length})
        </button>
      </div>

      {/* Content */}
      <div className="admin-tab-body">
        
        {/* OVERVIEW PANEL */}
        {activeTab === 'overview' && (
          <div className="admin-overview-panel">
            <section className="admin-stats-grid">
              <div className="admin-stat-card">
                <span className="stat-icon">🎓</span>
                <div className="stat-data">
                  <div className="val">{stats.total_students}</div>
                  <div className="label">Registered Candidates</div>
                </div>
              </div>
              <div className="admin-stat-card">
                <span className="stat-icon">🏢</span>
                <div className="stat-data">
                  <div className="val">{stats.total_recruiters}</div>
                  <div className="label">Registered Employers</div>
                </div>
              </div>
              <div className="admin-stat-card">
                <span className="stat-icon">🚀</span>
                <div className="stat-data">
                  <div className="val">{stats.total_jobs}</div>
                  <div className="label">Job Openings Published</div>
                </div>
              </div>
              <div className="admin-stat-card">
                <span className="stat-icon">📄</span>
                <div className="stat-data">
                  <div className="val">{stats.total_applications}</div>
                  <div className="label">Applications Submitted</div>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* RECRUITERS APPROVAL PANEL */}
        {activeTab === 'recruiters' && (
          <section className="admin-recruiters-section">
            <h2>Verify Employer Registration Submissions</h2>
            {recruiters.length === 0 ? (
              <div className="empty-admin-state">No employers registered yet.</div>
            ) : (
              <div className="table-responsive">
                <table className="dashboard-table">
                  <thead>
                    <tr>
                      <th>Employer Details</th>
                      <th>Company</th>
                      <th>Contact</th>
                      <th>Approval Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recruiters.map(rec => (
                      <tr key={rec.id}>
                        <td>
                          <strong>{rec.user.first_name} {rec.user.last_name}</strong>
                          <span className="table-subtext">{rec.user.username}</span>
                        </td>
                        <td>{rec.company}</td>
                        <td>{rec.mobile}</td>
                        <td>
                          <span className={`status-pill ${rec.status?.toLowerCase()}`}>
                            {rec.status === 'Accept' ? 'Approved' : rec.status === 'Reject' ? 'Rejected' : 'Pending'}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons-row">
                            <button 
                              onClick={() => handleApproveRecruiter(rec.id, 'Accept')}
                              className="approve-btn"
                              disabled={rec.status === 'Accept'}
                            >
                              Approve
                            </button>
                            <button 
                              onClick={() => handleApproveRecruiter(rec.id, 'Reject')}
                              className="reject-btn"
                              disabled={rec.status === 'Reject'}
                            >
                              Reject
                            </button>
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

        {/* CANDIDATES LIST PANEL */}
        {activeTab === 'candidates' && (
          <section className="admin-candidates-section">
            <h2>Candidate Accounts</h2>
            {candidates.length === 0 ? (
              <div className="empty-admin-state">No candidates registered yet.</div>
            ) : (
              <div className="table-responsive">
                <table className="dashboard-table">
                  <thead>
                    <tr>
                      <th>Candidate Name</th>
                      <th>Contact</th>
                      <th>Gender</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {candidates.map(cand => (
                      <tr key={cand.id}>
                        <td>
                          <strong>{cand.user.first_name} {cand.user.last_name}</strong>
                          <span className="table-subtext">{cand.user.username}</span>
                        </td>
                        <td>{cand.mobile}</td>
                        <td>{cand.gender}</td>
                        <td>
                          <button 
                            onClick={() => handleDeleteCandidate(cand.id)}
                            className="delete-action-btn"
                          >
                            Remove Candidate
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

      </div>
    </div>
  );
};

export default AdminDashboard;
