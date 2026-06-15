import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import client from '../api/client';
import './AddEditJob.css';

const AddEditJob = () => {
  const { id } = useParams(); // If ID is present, we are in edit mode
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [salary, setSalary] = useState('');
  const [experience, setExperience] = useState('');
  const [location, setLocation] = useState('');
  const [skills, setSkills] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (id) {
      // Fetch job details for editing
      client.get(`jobs/${id}/`)
        .then(response => {
          const job = response.data;
          setTitle(job.title);
          setStartDate(job.start_date);
          setEndDate(job.end_date);
          setSalary(job.salary);
          setExperience(job.experience);
          setLocation(job.location);
          setSkills(job.skills);
          setDescription(job.description);
        })
        .catch(err => {
          console.error(err);
          setErrorMsg('Failed to load job details.');
        });
    }
  }, [id]);

  const handleFileChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('start_date', startDate);
    formData.append('end_date', endDate);
    formData.append('salary', salary);
    formData.append('experience', experience);
    formData.append('location', location);
    formData.append('skills', skills);
    formData.append('description', description);
    if (image) {
      formData.append('image', image);
    }

    try {
      if (id) {
        await client.put(`recruiter/jobs/${id}/`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setSuccessMsg('Job updated successfully!');
      } else {
        await client.post('recruiter/add-job/', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setSuccessMsg('Job posted successfully!');
      }
      setTimeout(() => {
        navigate('/recruiter-jobs');
      }, 1500);
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'An error occurred while saving.');
    }
    setLoading(false);
  };

  return (
    <div className="job-form-container">
      <div className="job-form-card">
        <h2>{id ? 'Edit Job Posting' : 'Post a New Job'}</h2>
        <p className="subtitle">Fill out the fields below to publish a vacancy</p>

        {errorMsg && <div className="error-alert">{errorMsg}</div>}
        {successMsg && <div className="success-alert">{successMsg}</div>}

        <form onSubmit={handleSubmit} className="job-form">
          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="title">Job Title</label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="salary">Salary (USD per year)</label>
              <input
                type="number"
                id="salary"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="startDate">Start Date</label>
              <input
                type="date"
                id="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="endDate">End Date</label>
              <input
                type="date"
                id="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="location">Location</label>
              <input
                type="text"
                id="location"
                placeholder="e.g. San Francisco, CA"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="experience">Experience Level</label>
              <input
                type="text"
                id="experience"
                placeholder="e.g. 2-5 years, Entry level"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="skills">Required Skills (Comma separated)</label>
            <input
              type="text"
              id="skills"
              placeholder="e.g. React, JavaScript, Node.js"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="description">Job Description</label>
            <textarea
              id="description"
              rows="6"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            ></textarea>
          </div>

          <div className="form-field">
            <label htmlFor="image">Company Logo / Banner</label>
            <input
              type="file"
              id="image"
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>

          <button type="submit" className="job-submit-btn" disabled={loading}>
            {loading ? 'Saving...' : id ? 'Update Listing' : 'Publish Job'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddEditJob;
