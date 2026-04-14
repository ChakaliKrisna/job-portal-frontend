import React, { useState, useEffect } from "react";
import { 
  FaMapMarkerAlt, FaWallet, FaRegClock, FaCheckCircle, 
  FaTimes, FaCloudUploadAlt, FaShieldAlt 
} from "react-icons/fa";
import "./Styles/joblist.css";
import "../components/Styles/jobDetails.css"; // Reuse your existing detail styles

const jobs = [
  { id: 1, title: "Frontend Developer", company: "Google", location: "Hyderabad", salary: "₹12-18 LPA", type: "Full Time", posted: "2 days ago", logo: "https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_Reference_icon.png", description: "Join Google's UI team to build next-gen interfaces using React and TypeScript. You will work on global scale products." },
  { id: 2, title: "Backend Engineer", company: "Amazon", location: "Bangalore", salary: "₹15-25 LPA", type: "Remote", posted: "Just now", logo: "https://upload.wikimedia.org/wikipedia/commons/d/de/Amazon_icon.png", description: "Scale massive distributed systems and optimize AWS cloud infrastructure. High focus on low-latency systems." },
  { id: 3, title: "Java Full Stack Intern", company: "Tsar IT", location: "Remote", salary: "₹15k-25k/mo", type: "Internship", posted: "1 day ago", logo: "https://cdn-icons-png.flaticon.com/512/5968/5968282.png", description: "Learn Spring Boot and Angular while working on real-world client projects. Mentorship provided." },
  { id: 4, title: "Software Engineer", company: "Microsoft", location: "Delhi", salary: "₹20-30 LPA", type: "Full Time", posted: "5 hours ago", logo: "https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg", description: "Develop core Windows features and integrate AI capabilities into the ecosystem." },
];

const JobBoard = () => {
  const [selectedJob, setSelectedJob] = useState(jobs[0]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [appliedJobs, setAppliedJobs] = useState([]); // Track which jobs are applied
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if current selected job is already applied
  const hasApplied = appliedJobs.includes(selectedJob.id);

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
    
    // Simulate API Call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsModalOpen(false);
      setAppliedJobs([...appliedJobs, selectedJob.id]);
    }, 1500);
  };

  return (
    <section className="job-board-section">
      {/* 1. APPLICATION MODAL */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Apply for {selectedJob.company}</h3>
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
                  <input type="file" className="file-input" accept=".pdf,.doc,.docx" />
                </div>
              </div>

              <button type="submit" disabled={isSubmitting} className="btn-primary large">
                {isSubmitting ? "Submitting..." : "Confirm Application"}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="job-board-container">
        {/* 2. LEFT SIDEBAR (List) */}
        <div className="job-list-sidebar">
          <div className="sidebar-header">
            <h2 className="list-title">Trending Jobs</h2>
          </div>
          <div className="scroll-area">
            {jobs.map((job) => (
              <div 
                key={job.id} 
                className={`mini-job-card ${selectedJob.id === job.id ? "active" : ""}`}
                onClick={() => setSelectedJob(job)}
              >
                <img src={job.logo} alt={job.company} className="mini-logo" />
                <div className="mini-info">
                  <h4>{job.title}</h4>
                  <p className={appliedJobs.includes(job.id) ? "status-applied" : ""}>
                    {job.company} {appliedJobs.includes(job.id) && "• Applied"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. RIGHT CONTENT (Details) */}
        <div className="job-details-view">
          <div className="job-main-content">
            <div className="job-header">
              <div className="title-area">
                <h1>{selectedJob.title}</h1>
                <p className="company-name-large">{selectedJob.company}</p>
              </div>
              <img src={selectedJob.logo} alt="logo" className="company-logo-large" />
            </div>

            <div className="meta-stats">
               <div className="stat-item">
                 <span className="stat-label">Location</span>
                 <span className="stat-value"><FaMapMarkerAlt /> {selectedJob.location}</span>
               </div>
               <div className="stat-item">
                 <span className="stat-label">Salary</span>
                 <span className="stat-value"><FaWallet /> {selectedJob.salary}</span>
               </div>
               <div className="stat-item">
                 <span className="stat-label">Posted</span>
                 <span className="stat-value"><FaRegClock /> {selectedJob.posted}</span>
               </div>
            </div>

            <div className="job-description-body">
              <h3>About the Role</h3>
              <p>{selectedJob.description}</p>
              
              <h3>Key Requirements</h3>
              <ul>
                <li>Relevant experience in {selectedJob.title}.</li>
                <li>Strong portfolio or GitHub profile.</li>
                <li>Ability to work in {selectedJob.location}.</li>
              </ul>
            </div>

            <div className="sticky-action-bar">
              {!hasApplied ? (
                <button onClick={handleOpenModal} className="btn-primary apply-main-btn">
                  Apply Now
                </button>
              ) : (
                <div className="success-badge-large">
                  <FaCheckCircle /> Application Sent Successfully
                </div>
              )}
              <p className="secure-text"><FaShieldAlt /> Secure Application via Hunter</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default JobBoard;