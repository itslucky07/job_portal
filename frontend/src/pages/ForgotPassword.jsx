import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import client from '../api/client';
import './Login.css'; // Reusing Login styles for visual consistency

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const response = await client.post('auth/forgot-password/', {
        email,
        mobile,
        new_password: newPassword,
      });
      setSuccessMsg(response.data.success || 'Password reset successfully!');
      setEmail('');
      setMobile('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      console.error('Password reset error:', error);
      const msg = error.response?.data?.error || 'Failed to reset password. Please check your inputs.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Reset Password</h2>
        <p className="login-subtitle">Enter your registered details below to set a new password</p>

        {errorMsg && <div className="error-banner">{errorMsg}</div>}
        {successMsg && <div className="success-banner">{successMsg}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Registered Email / Username</label>
            <input
              type="email"
              id="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="mobile">Registered Mobile Number</label>
            <input
              type="text"
              id="mobile"
              placeholder="e.g. 9876543210"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="newPassword">New Password</label>
            <input
              type="password"
              id="newPassword"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <input
              type="password"
              id="confirmPassword"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="login-submit-btn" disabled={loading}>
            {loading ? 'Resetting Password...' : 'Reset Password'}
          </button>

          <div style={{ marginTop: '15px', textAlign: 'center', fontSize: '14px' }}>
            <Link to="/login" style={{ fontWeight: '500' }}>Back to Sign In</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
