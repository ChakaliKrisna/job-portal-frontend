import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios"; // FIXED: Imported cleanly from 'axios' module
import AuthDrawer from "../pages/AuthDrawer"; // Adjust the path based on your folder structure
import {
  FaMapMarkerAlt,
  FaWallet,
  FaBriefcase,
  FaBuilding,
  FaArrowLeft,
  FaCheckCircle,
  FaUser,
  FaBolt,
  FaEnvelope,
  FaUsers,
  FaRegClock,
  FaExternalLinkAlt,
  FaShareAlt
} from "react-icons/fa";

import "../components/Styles/jobDetails.css";

const API_BASE = "https://job-portal-backend-365l.onrender.com/job-portal";

const JobDetails = () => {
  const { jobPublicId } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [logoError, setLogoError] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // States for recommendations
  const [moreCompanyJobs, setMoreCompanyJobs] = useState([]);
  const [similarJobs, setSimilarJobs] = useState([]);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(
          `${API_BASE}/jobs/${jobPublicId}`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
          }
        );

        const jobData = response.data;
        setJob(jobData);
        setLogoError(false);

        // Safely parse target corporate tracking references
        const activeCompanyId = jobData?.company?.publicId || jobData?.companyPublicId;

        // Fetch More Jobs From This Company
        if (activeCompanyId) {
          try {
            const companyJobsRes = await axios.get(
              `${API_BASE}/jobs/company/${activeCompanyId}`
            );
            const companyJobs = companyJobsRes.data.content || [];
            const filteredCompanyJobs = companyJobs.filter(
              j => j.publicId !== jobData.publicId
            );
            setMoreCompanyJobs(filteredCompanyJobs);
          } catch (err) {
            console.error("Failed to fetch more company jobs:", err);
          }
        }

        // Fetch Similar Jobs via Context Matching Rules
        try {
          const allJobsRes = await axios.get(`${API_BASE}/jobs`);
          const jobs = allJobsRes.data.content || [];
          
          const filteredSimilar = jobs.filter(
            j => j.category === jobData.category && j.publicId !== jobData.publicId
          );
          setSimilarJobs(filteredSimilar);
        } catch (err) {
          console.error("Failed to fetch similar jobs:", err);
        }

      } catch (err) {
        console.error(err);
        setError("Job listing not found or has been removed.");
      } finally {
        setLoading(false);
      }
    };

    if (jobPublicId) {
      fetchJobDetails();
    }
  }, [jobPublicId, token]);

  const formatSalary = (salary) => {
    if (!salary) return "N/A";
    return (salary / 100000).toFixed(1);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Recently";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };

  // Calculate Urgency Days Remaining
  const getDaysRemaining = (closedDateStr) => {
    if (!closedDateStr) return null;
    const closedDate = new Date(closedDateStr);
    const today = new Date();
    const diffTime = closedDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  // Share Link Action
  const handleShareJob = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 3000);
  };

  if (loading) return <div className="loading-screen">Loading Opportunity...</div>;
  if (error) return <div className="error-screen">{error}</div>;
  if (!job) return null;

  // Structural Extraction Bindings Map
  const {
    title,
    salary,
    jobType,
    workMode,
    experienceLevel,
    skillsRequired,
    education,
    openings,
    postedDate,
    closedDate,
    category,
    description,
    recruiter,
    company, // Extracted Object Structure
    applicationsCount,
    publicId
  } = job;

  // Resolve consistent references across multiple payload variations
  const computedCompanyName = company?.name || job.companyName || "Verified Enterprise";
  const computedCompanyLogo = company?.logoUrl || job.companyLogo;
  const computedCompanyLocation = company?.location || job.companyLocation || job.location || "Global Field Operations";
  const computedCompanyId = company?.publicId || job.companyPublicId;
  const computedCompanyWebsite = company?.website || job.companyWebsite;

  const daysRemaining = getDaysRemaining(closedDate);
  
  const handleApplyClick = () => {
    if (token) {
      // If logged in, go straight to the apply screen
      navigate(`/apply/${publicId}`);
    } else {
      // If NOT logged in, slide open your premium AuthDrawer immediately!
      setIsAuthOpen(true);
    }
  };

  return (
    <div className="job-details-page-container">
      {/* Top Navbar Back Action */}
      <div className="job-details-back-nav">
        <button 
          className="back-btn" 
          onClick={(e) => {
            e.stopPropagation(); 
            if (window.history.state && window.history.state.idx > 0) {
              navigate(-1);
            } else {
              navigate("/");
            }
          }}
        >
          <FaArrowLeft /> Back to Listings
        </button>
      </div>

      {/* Hero Header Area */}
      <div className="job-details-hero">
        <div className="hero-content">
          <div 
            className="company-logo-xl clickable"
            onClick={() => computedCompanyId && navigate(`/companies/${computedCompanyId}`)}
          >
            {computedCompanyLogo && !logoError ? (
              <img src={computedCompanyLogo} alt={computedCompanyName} onError={() => setLogoError(true)} />
            ) : (
              <div className="logo-placeholder">
                {computedCompanyName ? computedCompanyName.charAt(0) : <FaBuilding />}
              </div>
            )}
          </div>

          <div className="hero-text">
            <div className="title-row">
              <h1>{title}</h1>
              {category && (
                <div className="category-chip">
                  {category.replaceAll("_", " ")}
                </div>
              )}
            </div>

            <div className="hero-subtitle">
              <span
                className="company-name clickable"
                onClick={() => computedCompanyId && navigate(`/companies/${computedCompanyId}`)}
              >
                {computedCompanyName}
              </span>

              <span className="separator">•</span>

              <span className="location">
                <FaMapMarkerAlt /> {computedCompanyLocation}
              </span>
            </div>
          </div>
        </div>

        {/* Core Actions Container */}
      {/* Core Actions Container */}
<div className="hero-actions">
          <button className="share-btn" onClick={handleShareJob}>
            <FaShareAlt /> {copySuccess ? "Link Copied!" : "Share Job"}
          </button>
          
          {/* UPDATED APPLY NOW BUTTON */}
          <button
            className="apply-main-btn"
            onClick={handleApplyClick}
          >
            Apply Now
          </button>
        </div>
      </div>

      {/* Content Layout Grid */}
      <div className="details-grid">
        <main className="main-description">
          
          {/* Quick Urgency / Deadline Alert Banner */}
          {daysRemaining !== null && (
            <div className="deadline-box-container">
              <div className="deadline-box">
                <FaRegClock /> Apply Before: <strong>{formatDate(closedDate)}</strong>
              </div>
              {daysRemaining <= 30 && daysRemaining > 0 && (
                <span className="urgency-badge">🔥 {daysRemaining} Days Remaining</span>
              )}
            </div>
          )}

          {/* Core Insights Module */}
          <section className="info-section insights-section">
            <h3>Job Insights</h3>
            <div className="insights-grid">
              <div className="insight-item">✔ {openings || 1} Openings</div>
              <div className="insight-item">✔ {experienceLevel === "ENTRY_LEVEL" || experienceLevel === "JUNIOR" || experienceLevel === "FRESHER" ? "Freshers Eligible" : "Experienced Role"}</div>
              <div className="insight-item">✔ {workMode ? workMode.replaceAll("_", " ") : "N/A"}</div>
              <div className="insight-item">✔ {category ? category.replaceAll("_", " ") : "General Corporate"}</div>
              <div className="insight-item">✔ Posted {formatDate(postedDate)}</div>
            </div>
          </section>

          <section className="info-section">
            <h3>Job Description</h3>
            <p className="description-text">{description}</p>
          </section>

          <section className="info-section">
            <h3>Required Skills</h3>
            <div className="skills-list">
              {skillsRequired && skillsRequired.length > 0 ? (
                skillsRequired.map((skill, index) => (
                  <span key={index} className="skill-tag">{skill}</span>
                ))
              ) : (
                <span className="no-skills">General profile evaluation</span>
              )}
            </div>

            {education && (
              <div className="education-info">
                <h4>Education</h4>
                <p>{education}</p>
              </div>
            )}
          </section>

          {/* Skills Match Indicator Module */}
          <section className="info-section match-percentage-section">
            <div className="match-header">
              <h3>Skills Match</h3>
              <span className="match-badge">75% Match</span>
            </div>
            <p className="match-description-text">You have 3 out of 4 skills required for this job matching your core profile parameters.</p>
          </section>
        </main>

        {/* Sidebar Info Panels */}
        <aside className="job-stats-sidebar">
          <div className="stat-card">
            <h4>Job Overview</h4>

            <div className="stat-item">
              <FaUsers className="stat-icon" />
              <div>
                <label>Applicants</label>
                <span>{applicationsCount ?? 0} applied</span>
              </div>
            </div>

            <div className="stat-item">
              <FaWallet className="stat-icon" />
              <div>
                <label>Salary</label>
                <span>₹{formatSalary(salary)} LPA</span>
              </div>
            </div>

            <div className="stat-item">
              <FaBriefcase className="stat-icon" />
              <div>
                <label>Job Type</label>
                <span>{jobType ? jobType.replaceAll("_", " ") : "N/A"}</span>
              </div>
            </div>

            <div className="stat-item">
              <FaBolt className="stat-icon" />
              <div>
                <label>Work Mode</label>
                <span>{workMode ? workMode.replaceAll("_", " ") : "N/A"}</span>
              </div>
            </div>

            <div className="stat-item">
              <FaCheckCircle className="stat-icon" />
              <div>
                <label>Experience</label>
                <span>{experienceLevel ? experienceLevel.replaceAll("_", " ") : "N/A"}</span>
              </div>
            </div>
          </div>

          {/* Quick Identity Profile Card */}
          <div className="company-quick-card">
            <div className="company-card-header">
              {computedCompanyLogo && !logoError ? (
                <img src={computedCompanyLogo} alt={computedCompanyName} className="company-card-logo" onError={() => setLogoError(true)} />
              ) : (
                <div className="company-card-placeholder">{computedCompanyName?.charAt(0)}</div>
              )}
              <div>
                <h4>{computedCompanyName}</h4>
                <p>{computedCompanyLocation}</p>
              </div>
            </div>
            
            <div className="company-card-actions">
              <button 
                className="view-profile-btn"
                onClick={() => computedCompanyId && navigate(`/companies/${computedCompanyId}`)}
              >
                View Profile
              </button>
              
              {computedCompanyWebsite && (
                <a href={computedCompanyWebsite} target="_blank" rel="noreferrer" className="website-external-btn">
                  Visit Website <FaExternalLinkAlt size={11} />
                </a>
              )}
            </div>
          </div>

          {/* Enhanced Recruiter Component Panel */}
          <div className="recruiter-card">
            <h4>Posted By</h4>
            <div className="recruiter-user">
              <div className="recruiter-avatar"><FaUser /></div>
              <div className="recruiter-details">
                <p><strong>{recruiter?.name || "HR Team"}</strong></p>
                <p className="recruiter-role-label">Recruiter</p>
                {recruiter?.email && (
                  <p className="email"><FaEnvelope /> {recruiter.email}</p>
                )}
              </div>
            </div>
            <button className="message-recruiter-btn" disabled>
              Message Recruiter (Coming Soon)
            </button>
          </div>
        </aside>
      </div>

      {/* Dynamic Recommendation Blocks Area at Footer */}
      <footer className="job-details-recommendations-footer">
        {moreCompanyJobs.length > 0 && (
          <div className="recommendation-block-section">
            <h3>More Jobs From {computedCompanyName}</h3>
            <div className="recommendations-grid">
              {moreCompanyJobs.slice(0, 3).map((compJob) => (
                <div key={compJob.publicId} className="mini-job-card" onClick={() => navigate(`/job/${compJob.publicId}`)}>
                  <h5>{compJob.title}</h5>
                  <p>{compJob.workMode ? compJob.workMode.replaceAll("_", " ") : "N/A"} • ₹{formatSalary(compJob.salary)}L</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {similarJobs.length > 0 && (
          <div className="recommendation-block-section">
            <h3>Similar Jobs</h3>
            <div className="recommendations-grid">
              {similarJobs.slice(0, 3).map((simJob) => (
                <div key={simJob.publicId} className="mini-job-card" onClick={() => navigate(`/job/${simJob.publicId}`)}>
                  <h5>{simJob.title}</h5>
                  <p className="company-lbl">{simJob.companyName || "Verified Enterprise"}</p>
                  <p>{simJob.workMode ? simJob.workMode.replaceAll("_", " ") : "N/A"} • {simJob.location}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </footer>
    </div>
  );
};

export default JobDetails;