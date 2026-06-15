import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate('/login');
  };

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <Link to="/" onClick={handleLinkClick}>🚀 TalentPulse</Link>
      </div>

      <button 
        className={`nav-toggle ${isOpen ? 'open' : ''}`} 
        onClick={() => setIsOpen(!isOpen)} 
        aria-label="Toggle navigation"
      >
        <span className="bar"></span>
        <span className="bar"></span>
        <span className="bar"></span>
      </button>

      <div className={`nav-links ${isOpen ? 'open' : ''}`}>
        <Link to="/" className="nav-link" onClick={handleLinkClick}>Home</Link>

        {isAuthenticated ? (
          <>
            {/* Student Navigation - Streamlined */}
            {user.role === 'student' && (
              <>
                <Link to="/jobs" className="nav-link" onClick={handleLinkClick}>Explore Jobs</Link>
                <Link to="/applied-jobs" className="nav-link" onClick={handleLinkClick}>My Dashboard</Link>
                <Link to="/resume" className="nav-link" onClick={handleLinkClick}>Resume Builder</Link>
                <Link to="/chat" className="nav-link" onClick={handleLinkClick}>Messages</Link>
              </>
            )}

            {/* Recruiter Navigation - Streamlined */}
            {user.role === 'recruiter' && (
              <>
                <Link to="/recruiter-dashboard" className="nav-link" onClick={handleLinkClick}>Dashboard</Link>
                <Link to="/candidates" className="nav-link" onClick={handleLinkClick}>Applicants</Link>
                <Link to="/chat" className="nav-link" onClick={handleLinkClick}>Messages</Link>
              </>
            )}

            {/* Admin Navigation - Streamlined */}
            {user.role === 'admin' && (
              <>
                <Link to="/admin-dashboard" className="nav-link" onClick={handleLinkClick}>Admin Console</Link>
              </>
            )}

            <div className="user-profile-menu">
              <span className="user-greeting">Hi, {user.first_name || user.username} ({user.role})</span>
              <button onClick={handleLogout} className="logout-btn">Logout</button>
            </div>
          </>
        ) : (
          <div className="guest-links">
            <Link to="/login" className="login-btn" onClick={handleLinkClick}>Login</Link>
            <div className="dropdown">
              <button className="dropbtn">Register</button>
              <div className="dropdown-content">
                <Link to="/register/student" onClick={handleLinkClick}>Register as Student</Link>
                <Link to="/register/recruiter" onClick={handleLinkClick}>Register as Recruiter</Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
