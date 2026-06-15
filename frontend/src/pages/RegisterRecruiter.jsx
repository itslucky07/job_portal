import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css'; // sharing basic card styles

const RegisterRecruiter = () => {
  const [fname, setFname] = useState('');
  const [lname, setLname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [contact, setContact] = useState('');
  const [gender, setGender] = useState('Male');
  const [company, setCompany] = useState('');
  const [image, setImage] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const { registerRecruiter } = useAuth();
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    const formData = new FormData();
    formData.append('fname', fname);
    formData.append('lname', lname);
    formData.append('email', email);
    formData.append('password', password);
    formData.append('contact', contact);
    formData.append('gender', gender);
    formData.append('company', company);
    if (image) {
      formData.append('image', image);
    }

    const result = await registerRecruiter(formData);
    setLoading(false);

    if (result.success) {
      setSuccessMsg('Recruiter account submitted! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } else {
      setErrorMsg(result.error);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card large">
        <h2>Recruiter Registration</h2>
        <p className="login-subtitle">Join as a recruiter to post jobs and review candidates</p>

        {errorMsg && <div className="error-banner">{errorMsg}</div>}
        {successMsg && <div className="success-banner" style={{
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          border: '1px solid rgba(34, 197, 94, 0.2)',
          color: '#16a34a',
          padding: '12px',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: '500',
          marginBottom: '20px'
        }}>{successMsg}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-row-grid">
            <div className="form-group">
              <label htmlFor="fname">First Name</label>
              <input
                type="text"
                id="fname"
                value={fname}
                onChange={(e) => setFname(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="lname">Last Name</label>
              <input
                type="text"
                id="lname"
                value={lname}
                onChange={(e) => setLname(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-row-grid">
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-row-grid">
            <div className="form-group">
              <label htmlFor="contact">Contact Mobile</label>
              <input
                type="text"
                id="contact"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="company">Company Name</label>
              <input
                type="text"
                id="company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-row-grid">
            <div className="form-group">
              <label htmlFor="gender">Gender</label>
              <select
                id="gender"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                style={{
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  backgroundColor: 'var(--bg)',
                  color: 'var(--text-h)',
                  fontSize: '14px',
                  outline: 'none'
                }}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="image">Profile Photo</label>
              <input
                type="file"
                id="image"
                className="form-file-input"
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>
          </div>

          <button type="submit" className="login-submit-btn" disabled={loading}>
            {loading ? 'Submitting Registration...' : 'Register'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterRecruiter;
