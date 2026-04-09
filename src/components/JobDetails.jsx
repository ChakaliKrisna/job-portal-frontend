import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaMapMarkerAlt, FaWallet, FaRegClock, FaCheckCircle, FaTimes, FaCloudUploadAlt, FaBriefcase } from "react-icons/fa";
import "../components/Styles/jobDetails.css"; // Ensure you add the CSS below

export default function JobsPage({ jobs }) {
  const navigate = useNavigate();
  
  // State for the "Side View" selection
  const [selectedJob, setSelectedJob] = useState(jobs[0]);
  
  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [appliedJobs, setAppliedJobs] = useState([]); // Track which IDs are applied
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      setAppliedJobs([...appliedJobs, selectedJob.id]);
    }, 1500);
  };

  return (
    <div className="jobs-master-container">
      {/* 1. APPLY MODAL */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Apply for {selectedJob.company}</h3>
              <button onClick={() => setIsModalOpen(false)} className="close-btn"><FaTimes /></button>
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
                  <p>Click to upload Resume</p>
                  <input type="file" className="file-input" accept=".pdf,.doc" required />
                </div>
              </div>
              <button type="submit" disabled={isSubmitting} className="btn-confirm-apply">
                {isSubmitting ? "Submitting..." : "Confirm Application"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 2. MAIN LAYOUT */}
      <div className="jobs-layout-grid">
        
        {/* LEFT COLUMN: VERTICAL LIST */}
        <aside className="jobs-vertical-list">
          <div className="list-header">
            <h3>Available Jobs ({jobs.length})</h3>
          </div>
          <div className="scrollable-cards">
            {jobs.map((job) => (
              <div 
                key={job.id} 
                className={`mini-job-card ${selectedJob?.id === job.id ? "active" : ""}`}
                onClick={() => setSelectedJob(job)}
              >
                <img src={job.logo} alt="logo" className="mini-logo" />
                <div className="mini-info">
                  <h4>{job.title}</h4>
                  <p>{job.company}</p>
                  <div className="mini-meta">
                    <span><FaMapMarkerAlt /> {job.location}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* RIGHT COLUMN: SIDE VIEW DESCRIPTION */}
        <main className="job-side-detail">
          {selectedJob ? (
            <div className="detail-wrapper">
              <div className="detail-header-main">
                <div className="header-info">
                  <img src={selectedJob.logo} alt="logo" />
                  <div>
                    <h1>{selectedJob.title}</h1>
                    <p className="company-text">{selectedJob.company}</p>
                  </div>
                </div>
                
                <div className="action-area">
                  {appliedJobs.includes(selectedJob.id) ? (
                    <div className="success-badge-inline">
                      <FaCheckCircle /> Applied
                    </div>
                  ) : (
                    <button onClick={handleOpenModal} className="btn-apply-primary">
                      Apply Now
                    </button>
                  )}
                </div>
              </div>

              <div className="quick-stats">
                <div className="q-stat"><FaWallet /> <span>{selectedJob.salary}</span></div>
                <div className="q-stat"><FaBriefcase /> <span>{selectedJob.type}</span></div>
                <div className="q-stat"><FaRegClock /> <span>{selectedJob.posted}</span></div>
              </div>

              <div className="description-scroll">
                <h3>About the job</h3>
                <p>{selectedJob.description || "No description provided for this role."}</p>
                
                <h3>Key Responsibilities</h3>
                <ul>
                  <li>Collaborate with the engineering team to build scalable products.</li>
                  <li>Maintain high standards of code quality and documentation.</li>
                  <li>Identify and resolve performance bottlenecks.</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="empty-state">Select a job to view details</div>
          )}
        </main>
      </div>
    </div>
  );
}