import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaMapMarkerAlt, FaWallet, FaRegClock, FaArrowLeft, FaCheckCircle, FaTimes, FaCloudUploadAlt } from "react-icons/fa";
import "../components/Styles/jobDetails.css";

export default function JobDetails({ jobs }) {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [applied, setApplied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const job = jobs.find((j) => j.id.toString() === id);

  if (!job) return (
    <div className="error-container">
      <h2>Job Not Found</h2>
      <button onClick={() => navigate("/jobs")} className="back-link">Back to all jobs</button>
    </div>
  );

  const handleOpenModal = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login first to apply!");
      return;
    }
    setIsModalOpen(true);
  };

  const submitApplication = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsModalOpen(false);
      setApplied(true);
    }, 1500);
  };

  return (
    <div className="job-details-page">
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Apply for {job.company}</h3>
              <button onClick={() => setIsModalOpen(false)} className="close-btn">
                <FaTimes />
              </button>
            </div>

            <form onSubmit={submitApplication} className="modal-form">
              <div className="form-group">
                <label>Contact Number</label>
                <input required type="tel" placeholder="+91 00000-00000" />
              </div>

              <div className="form-group">
                <label>Resume / CV</label>
                <div className="upload-zone">
                  <FaCloudUploadAlt className="upload-icon" />
                  <p className="upload-text">Click to upload or drag and drop</p>
                  <p className="upload-hint">PDF, DOC (Max 5MB)</p>
                  <input type="file" className="file-input" accept=".pdf,.doc,.docx" />
                </div>
              </div>

              <button type="submit" disabled={isSubmitting} className="btn-primary large">
                {isSubmitting ? <span className="spinner"></span> : "Confirm Application"}
              </button>
            </form>
          </div>
        </div>
      )}

      <nav className="job-nav">
        <div className="container">
          <button onClick={() => navigate(-1)} className="btn-back">
            <FaArrowLeft /> Back to Listings
          </button>
        </div>
      </nav>

      <main className="container job-grid">
        <div className="job-main-content">
          <section className="bento-card main-info">
            <div className="job-header">
              <div className="title-area">
                <h1>{job.title}</h1>
                <p className="company-name">{job.company}</p>
              </div>
              <img src={job.logo} alt="logo" className="company-logo" />
            </div>

            <div className="meta-stats">
               <div className="stat-item">
                 <span className="stat-label">Location</span>
                 <span className="stat-value"><FaMapMarkerAlt /> {job.location}</span>
               </div>
               <div className="stat-item">
                 <span className="stat-label">Salary</span>
                 <span className="stat-value"><FaWallet /> {job.salary}</span>
               </div>
               <div className="stat-item">
                 <span className="stat-label">Posted</span>
                 <span className="stat-value"><FaRegClock /> {job.posted}</span>
               </div>
            </div>

            <div className="job-description">
              <h3>About the Role</h3>
              <p>{job.description}</p>
            </div>
          </section>
        </div>

        <aside className="job-sidebar">
          <div className="bento-card sticky-sidebar">
            <h3>Application Summary</h3>
            {!applied ? (
              <button onClick={handleOpenModal} className="btn-primary full-width">
                Apply Now
              </button>
            ) : (
              <div className="success-badge">
                <FaCheckCircle />
                <span>Application Sent!</span>
              </div>
            )}
            <p className="secure-footer">Verified by Hunter Secure</p>
          </div>
        </aside>
      </main>
    </div>
  );
}