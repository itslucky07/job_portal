import React, { useState, useEffect } from 'react';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import './ResumeManager.css';

const ResumeManager = () => {
  const { user } = useAuth();
  const [description, setDescription] = useState('');
  const [experience, setExperience] = useState('');
  const [location, setLocation] = useState('');
  const [skills, setSkills] = useState('');
  const [project, setProject] = useState('');

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    client.get('student/resume/')
      .then(response => {
        const resume = response.data;
        setDescription(resume.description || '');
        setExperience(resume.experience || '');
        setLocation(resume.location || '');
        setSkills(resume.skills || '');
        setProject(resume.project || '');
        setLoading(false);
      })
      .catch(err => {
        // 404 means they don't have a resume yet, which is fine
        if (err.response?.status !== 404) {
          setErrorMsg('Failed to load resume details.');
        }
        setLoading(false);
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setSaving(true);

    try {
      await client.post('student/resume/', {
        description,
        experience,
        location,
        skills,
        project
      });
      setSuccessMsg('Resume details saved successfully!');
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Failed to save resume details.');
    }
    setSaving(false);
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading Resume Manager...</div>;
  }

  return (
    <div className="resume-page-layout">
      {/* Form Editor Column */}
      <section className="resume-editor-pane no-print">
        <div className="resume-card">
          <h2>Bio & Resume Builder</h2>
          <p className="subtitle">Enhance your application visibility by describing your professional background</p>

          {errorMsg && <div className="error-alert">{errorMsg}</div>}
          {successMsg && <div className="success-alert">{successMsg}</div>}

          <form onSubmit={handleSubmit} className="resume-form">
            <div className="form-field">
              <label htmlFor="desc">About Me (Professional Summary)</label>
              <textarea
                id="desc"
                rows="3"
                placeholder="Describe your career goals, background, or core interests..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              ></textarea>
            </div>

            <div className="form-field">
              <label htmlFor="exp">Work Experience Summary</label>
              <textarea
                id="exp"
                rows="3"
                placeholder="e.g. Intern at Wipro (6 months), Web Developer at TCS (1 year)..."
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                required
              ></textarea>
            </div>

            <div className="form-field">
              <label htmlFor="skills">Professional Skills (Comma separated)</label>
              <input
                type="text"
                id="skills"
                placeholder="e.g. React, Node.js, Python, SQL"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="project">Key Projects</label>
              <input
                type="text"
                id="project"
                placeholder="e.g. E-Commerce Platform, Chat Portal"
                value={project}
                onChange={(e) => setProject(e.target.value)}
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="loc">Preferred Job Location</label>
              <input
                type="text"
                id="loc"
                placeholder="e.g. Remote, San Francisco, CA"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="resume-submit-btn" disabled={saving}>
              {saving ? 'Saving Profile...' : 'Save Profile Resume'}
            </button>
          </form>
        </div>
      </section>

      {/* Live Preview / PDF Sheet Column */}
      <section className="resume-preview-pane">
        <div className="preview-header-row no-print">
          <h3>Live Resume Document</h3>
          <button onClick={() => window.print()} className="print-pdf-btn">
            🖨 Download PDF
          </button>
        </div>

        {/* Formatted Resume Page Sheet */}
        <div className="resume-document-sheet print-target">
          <header className="doc-header">
            <h1>{user?.first_name} {user?.last_name}</h1>
            <div className="doc-contact">
              <span>📧 {user?.username}</span>
              {user?.profile?.mobile && <span>📞 {user.profile.mobile}</span>}
              {location && <span>📍 {location}</span>}
            </div>
          </header>

          <div className="doc-body">
            <div className="doc-section">
              <h4 className="section-title">Professional Summary</h4>
              <p className="section-text">{description || 'Write your professional background summary on the left form.'}</p>
            </div>

            <div className="doc-section">
              <h4 className="section-title">Technical Skills</h4>
              <div className="doc-skills-deck">
                {skills ? (
                  skills.split(',').map((skill, index) => (
                    <span key={index} className="doc-skill-badge">{skill.trim()}</span>
                  ))
                ) : (
                  <span className="doc-placeholder-text">Skills badges will appear here...</span>
                )}
              </div>
            </div>

            <div className="doc-section">
              <h4 className="section-title">Experience History</h4>
              <p className="section-text whitespace-pre">{experience || 'Describe your previous jobs/internships.'}</p>
            </div>

            <div className="doc-section">
              <h4 className="section-title">Featured Projects</h4>
              <p className="section-text">{project || 'Add project titles and details.'}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ResumeManager;

