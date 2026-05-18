import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  FaMapMarkerAlt, FaWallet, FaBriefcase, FaBuilding, 
  FaArrowLeft, FaCheckCircle, FaUser, FaBolt, FaEnvelope, FaCalendarAlt 
} from "react-icons/fa";
import "../components/Styles/jobDetails.css"; // Double-check this path matches your folder structure

const API_BASE = "http://localhost:8080/job-portal";

const JobDetails = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE}/jobs/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        setJob(res.data);
      } catch (err) {
        setError("Job listing not found or has been removed.");
      } finally {
        setLoading(false);
      }
    };
    fetchJobDetails();
  }, [id, token]);

  const formatSalary = (s) => (s ? (s / 100000).toFixed(1) : "N/A");
  
  const formatDate = (dateString) => {
    if (!dateString) return "Recently";
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  };

  if (loading) return <div className="loading-screen">Loading Opportunity...</div>;
  if (error) return <div className="error-screen">{error}</div>;
  if (!job) return null;

  return (
    <div className="job-details-page-container">
      <button className="back-btn" onClick={() => navigate(-1)}>
        <FaArrowLeft /> Back to Listings
      </button>

      <div className="job-details-hero">
        <div className="hero-content">
          {/* FIX: job.company is a string "TCS" in your JSON */}
          <div className="company-logo-xl">
            {job.company ? job.company.charAt(0) : <FaBuilding />}
          </div>
          <div className="hero-text">
            <h1>{job.title}</h1>
            <p className="hero-subtitle">
              <span className="company-name">{job.company}</span>
              <span className="separator">•</span>
              <span className="location"><FaMapMarkerAlt /> {job.location}</span>
            </p>
          </div>
        </div>
        <button 
          className="apply-main-btn"
          onClick={() => token ? navigate(`/apply/${job.publicId}`) : navigate('/login')}
        >
          Apply Now
        </button>
      </div>

      <div className="details-grid">
        <main className="main-description">
          <section className="info-section">
            <h3>Job Description</h3>
            <p className="description-text">{job.description}</p>
          </section>

          <section className="info-section">
            <h3>Skills & Requirements</h3>
            <div className="skills-list">
              {job.skillsRequired?.map((skill, index) => (
                <span key={index} className="skill-tag">{skill}</span>
              ))}
            </div>
            {job.education && (
              <p className="education-info" style={{marginTop: '20px'}}>
                <strong>Education:</strong> {job.education}
              </p>
            )}
          </section>
        </main>

        <aside className="job-stats-sidebar">
          <div className="stat-card">
            <h4>Job Overview</h4>
            <div className="stat-item">
              <FaWallet className="stat-icon" /> 
              <div>
                <label>Salary (LPA)</label>
                <span>₹{formatSalary(job.salary)}L</span>
              </div>
            </div>
            <div className="stat-item">
              <FaBriefcase className="stat-icon" /> 
              <div>
                <label>Job Type</label>
                <span>{job.jobType?.replace('_', ' ')}</span>
              </div>
            </div>
            <div className="stat-item">
              <FaBolt className="stat-icon" /> 
              <div>
                <label>Work Mode</label>
                <span>{job.workMode}</span>
              </div>
            </div>
            <div className="stat-item">
              <FaCheckCircle className="stat-icon" /> 
              <div>
                <label>Experience</label>
                <span>{job.experienceLevel}</span>
              </div>
            </div>
            <div className="stat-item">
              <FaCalendarAlt className="stat-icon" /> 
              <div>
                <label>Posted On</label>
                <span>{formatDate(job.postedDate)}</span>
              </div>
            </div>
          </div>

          <div className="recruiter-card">
            <h4>Recruiter Details</h4>
            <div className="recruiter-user">
              <div className="recruiter-avatar"><FaUser /></div>
              <div className="recruiter-details">
                {/* FIX: Your JSON uses job.recruiter.name */}
                <p><strong>{job.recruiter?.name || "N/A"}</strong></p>
                <p className="email"><FaEnvelope /> {job.recruiter?.email}</p>
              </div>
            </div>
            <div className="applicant-count" style={{marginTop: '15px', fontSize: '0.9rem', color: '#64748b'}}>
               {job.openings} Positions Available
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default JobDetails;