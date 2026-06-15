import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import client from './api/client';

import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import RegisterStudent from './pages/RegisterStudent';
import RegisterRecruiter from './pages/RegisterRecruiter';
import ForgotPassword from './pages/ForgotPassword';
import JobsList from './pages/JobsList';
import ResumeManager from './pages/ResumeManager';
import StudentDashboard from './pages/StudentDashboard';
import RecruiterDashboard from './pages/RecruiterDashboard';
import AddEditJob from './pages/AddEditJob';
import ApplicantList from './pages/ApplicantList';
import AdminDashboard from './pages/AdminDashboard';
import DashboardPlaceholder from './pages/DashboardPlaceholder';
import Chat from './pages/Chat';
import './App.css';

// Home Component - displays latest jobs and connection checks
const HomeContent = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [homeSearch, setHomeSearch] = useState('');
  const [homeLoc, setHomeLoc] = useState('');
  
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [connectionMessage, setConnectionMessage] = useState('');
  const [jobs, setJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);

  useEffect(() => {
    client.get('check/')
      .then(response => {
        if (response.data.status === 'ok') {
          setConnectionStatus('connected');
          setConnectionMessage(response.data.message);
        }
      })
      .catch(error => {
        setConnectionStatus('error');
        setConnectionMessage('Could not reach the Django API. Ensure the backend is running.');
      });
  }, []);

  useEffect(() => {
    client.get('latest-jobs/')
      .then(response => {
        setJobs(response.data.slice(0, 6)); // Show top 6 latest jobs
        setLoadingJobs(false);
      })
      .catch(error => {
        console.error('Error fetching jobs:', error);
        setLoadingJobs(false);
      });
  }, []);

  const handleHomeSearch = (e) => {
    e.preventDefault();
    navigate(`/jobs?search=${encodeURIComponent(homeSearch)}&location=${encodeURIComponent(homeLoc)}`);
  };

  const handleCategoryClick = (category) => {
    navigate(`/jobs?search=${encodeURIComponent(category)}`);
  };

  return (
    <div className="home-container">
      {/* Dynamic Hero Section */}
      <section className="hero-banner-section">
        <div className="hero-content">
          <h1>Find your next career breakthrough</h1>
          <p className="hero-subtitle">
            Search thousands of verified jobs from top employers or verify recruiter credentials in seconds
          </p>

          <form onSubmit={handleHomeSearch} className="home-search-engine">
            <div className="search-input-wrapper">
              <span className="input-icon">🔍</span>
              <input
                type="text"
                placeholder="Job title, skills, or keywords..."
                value={homeSearch}
                onChange={(e) => setHomeSearch(e.target.value)}
              />
            </div>
            <div className="search-input-wrapper">
              <span className="input-icon">📍</span>
              <input
                type="text"
                placeholder="City, state, or remote..."
                value={homeLoc}
                onChange={(e) => setHomeLoc(e.target.value)}
              />
            </div>
            <button type="submit" className="home-search-btn">Search Jobs</button>
          </form>
        </div>
      </section>

      {/* Connection Banner - only shown on error */}
      {connectionStatus === 'error' && (
        <section className={`status-banner ${connectionStatus}`} style={{ margin: '0 40px' }}>
          <div className="status-indicator"></div>
          <div className="status-text">
            <strong>API Server: </strong> 
            Offline - {connectionMessage}
          </div>
        </section>
      )}

      {/* User Dashboard CTA Callouts */}
      {isAuthenticated ? (
        <div className="home-user-welcome" style={{ margin: '0 40px' }}>
          <h3>Welcome back, {user.first_name || user.username}!</h3>
          <p>Logged in as <strong>{user.role}</strong>. Use the navigation links to manage applications and review candidates.</p>
        </div>
      ) : (
        <section className="registration-callout-section" style={{ margin: '0 40px' }}>
          <div className="register-card-home seeker">
            <h3>Looking for a Job?</h3>
            <p>Upload your resume, search salary scales, and apply to tech positions instantly.</p>
            <Link to="/register/student" className="home-cta-link text-blue">Join as Seeker →</Link>
          </div>
          <div className="register-card-home employer">
            <h3>Hiring Talent?</h3>
            <p>Post your vacancies, screen candidate bios, and download resumes seamlessly.</p>
            <Link to="/register/recruiter" className="home-cta-link text-black">Join as Employer →</Link>
          </div>
        </section>
      )}

      {/* Popular Categories */}
      <section className="categories-showcase" style={{ margin: '0 40px' }}>
        <h2>Trending Job Sectors</h2>
        <div className="categories-grid-home">
          <div className="category-card-home" onClick={() => handleCategoryClick('Developer')}>
            <span className="cat-icon">💻</span>
            <h4>Software Development</h4>
            <p>React, Python, Java, SQL</p>
          </div>
          <div className="category-card-home" onClick={() => handleCategoryClick('Data Scientist')}>
            <span className="cat-icon">📊</span>
            <h4>Data Science & ML</h4>
            <p>Analytics, Python, AI</p>
          </div>
          <div className="category-card-home" onClick={() => handleCategoryClick('Sales')}>
            <span className="cat-icon">🤝</span>
            <h4>Sales & Account Exec</h4>
            <p>Relations, Negotiation</p>
          </div>
          <div className="category-card-home" onClick={() => handleCategoryClick('android')}>
            <span className="cat-icon">📱</span>
            <h4>Mobile Engineering</h4>
            <p>React Native, Android, Swift</p>
          </div>
        </div>
      </section>

      {/* Employer Logo Loop */}
      <section className="employers-showcase" style={{ margin: '0 40px' }}>
        <h3>Jobs posted by leading companies</h3>
        <div className="logos-row-home">
          <span className="logo-text-item" onClick={() => handleCategoryClick('wipro')}>Wipro</span>
          <span className="logo-text-item" onClick={() => handleCategoryClick('tcs')}>TCS</span>
          <span className="logo-text-item" onClick={() => handleCategoryClick('amazon')}>Amazon</span>
          <span className="logo-text-item" onClick={() => handleCategoryClick('alibaba')}>Alibaba</span>
        </div>
      </section>

      {/* Featured Jobs Section */}
      <section className="jobs-section" style={{ margin: '0 40px 40px 40px' }}>
        <h2>Featured Listings</h2>
        {loadingJobs ? (
          <div className="loader">Searching active jobs...</div>
        ) : jobs.length === 0 ? (
          <div className="empty-state">No jobs found.</div>
        ) : (
          <div className="jobs-grid">
            {jobs.map(job => (
              <div key={job.id} className="job-card">
                <div className="job-card-header">
                  <h3>{job.title}</h3>
                  {job.salary && <span className="salary-tag">${job.salary.toLocaleString()}</span>}
                </div>
                <p className="company-name">
                  💼 {job.recruiter_user?.company || 'Employer'}
                </p>
                <p className="job-desc">{job.description}</p>
                <div className="job-details">
                  <span>📍 {job.location}</span>
                  <span>⏳ {job.experience} exp</span>
                </div>
                {job.skills && (
                  <div className="skills-tags">
                    {job.skills.split(',').slice(0, 3).map((skill, index) => (
                      <span key={index} className="skill-tag">{skill.trim()}</span>
                    ))}
                  </div>
                )}
                <div className="job-footer">
                  <span className="date-tag">Posted: {job.creationdate}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app-container">
          <Navbar />
          <main className="app-main-content">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomeContent />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register/student" element={<RegisterStudent />} />
              <Route path="/register/recruiter" element={<RegisterRecruiter />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />

              {/* Student Protected Routes */}
              <Route 
                path="/jobs" 
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <JobsList />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/resume" 
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <ResumeManager />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/applied-jobs" 
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <StudentDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/saved-jobs" 
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <StudentDashboard />
                  </ProtectedRoute>
                } 
              />

              {/* Recruiter Protected Routes */}
              <Route 
                path="/recruiter-dashboard" 
                element={
                  <ProtectedRoute allowedRoles={['recruiter']}>
                    <RecruiterDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/add-job" 
                element={
                  <ProtectedRoute allowedRoles={['recruiter']}>
                    <AddEditJob />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/edit-job/:id" 
                element={
                  <ProtectedRoute allowedRoles={['recruiter']}>
                    <AddEditJob />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/recruiter-jobs" 
                element={
                  <ProtectedRoute allowedRoles={['recruiter']}>
                    <RecruiterDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/candidates" 
                element={
                  <ProtectedRoute allowedRoles={['recruiter']}>
                    <ApplicantList />
                  </ProtectedRoute>
                } 
              />

              {/* Chat Protected Route */}
              <Route 
                path="/chat" 
                element={
                  <ProtectedRoute allowedRoles={['student', 'recruiter']}>
                    <Chat />
                  </ProtectedRoute>
                } 
              />

              {/* Admin Protected Routes */}
              <Route 
                path="/admin-dashboard" 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/recruiters" 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/users" 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
