import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  FaArrowLeft, FaFilePdf, FaChartLine, FaCheckCircle, 
  FaTimesCircle, FaClock, FaExclamationTriangle, FaExternalLinkAlt 
} from "react-icons/fa";
import "../components/Styles/applicationdetails.css";
// src\components\Styles\applicationdetails.css

const API_BASE = "https://job-portal-backend-365l.onrender.com";

const ApplicationDetails = () => {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await axios.get(`${API_BASE}/job-portal/applications/${applicationId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setData(res.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load application details.");
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [applicationId, token]);

  if (loading) return <div className="loader-container"><div className="spinner"></div></div>;
  if (error) return <div className="error-screen"><FaExclamationTriangle /> <p>{error}</p> <button onClick={() => navigate(-1)}>Go Back</button></div>;

  const getStatusColor = (status) => {
    switch (status) {
      case "SELECTED": return "status-green";
      case "REJECTED": return "status-red";
      default: return "status-yellow";
    }
  };

  return (
    <div className="app-details-wrapper">
      <div className="app-container">
        {/* Navigation */}
        <button className="back-link" onClick={() => navigate(-1)}>
          <FaArrowLeft /> Back to Dashboard
        </button>

        <main className="details-grid">
          {/* Left Column: Core Info */}
          <section className="main-content">
            <header className="job-header-card glass">
              <div className="header-flex">
                <div>
                  <h1 className="job-title">{data.jobTitle}</h1>
                  <p className="company-name">{data.companyName}</p>
                </div>
                <div className={`status-badge ${getStatusColor(data.status)}`}>
                  {data.status || "PENDING"}
                </div>
              </div>
              
              <div className="meta-info">
                <span><FaClock /> Applied on {new Date(data.appliedAt).toLocaleDateString()}</span>
                <span><FaChartLine /> Match Score: <strong>{data.matchScore?.toFixed(1)}%</strong></span>
              </div>
            </header>

            {/* Missing Skills Section */}
            <div className="skills-analysis-card glass">
              <h3><FaChartLine /> Match Analysis</h3>
              <p className="subtext">Based on your profile snapshot at the time of application:</p>
              <div className="skills-grid">
                {data.missingSkills && data.missingSkills.length > 0 ? (
                  data.missingSkills.map((skill, i) => (
                    <span key={i} className="skill-tag missing">{skill}</span>
                  ))
                ) : (
                  <p className="success-msg"><FaCheckCircle /> You met all requirements for this role.</p>
                )}
              </div>
            </div>

            {/* Cover Letter */}
            <div className="cover-letter-card glass">
              <h3>Cover Letter</h3>
              <div className="letter-body">
                {data.coverLetter || "No cover letter provided."}
              </div>
            </div>
          </section>

          {/* Right Column: Resume & Timeline */}
          <aside className="sidebar">
            <div className="resume-card glass">
              <h3>Submitted Resume</h3>
              <div className="resume-preview">
                <FaFilePdf className="pdf-icon" />
                <p>resume_snapshot.pdf</p>
                <div className="resume-actions">
                  <a 
                    href={`${data.resumeUrl}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="btn-view"
                  >
                    <FaExternalLinkAlt /> View
                  </a>
                </div>
              </div>
            </div>

            <div className="timeline-card glass">
              <h3>Application Status</h3>
              <div className="timeline">
                <div className="timeline-item active">
                  <div className="dot"></div>
                  <div className="timeline-content">
                    <h4>Applied</h4>
                    <p>{new Date(data.appliedAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className={`timeline-item ${data.status !== 'PENDING' ? 'active' : ''}`}>
                  <div className="dot"></div>
                  <div className="timeline-content">
                    <h4>Review</h4>
                    <p>{data.status === 'PENDING' ? 'Recruiter is viewing' : 'Review Complete'}</p>
                  </div>
                </div>
                <div className={`timeline-item ${data.status === 'SELECTED' || data.status === 'REJECTED' ? 'active' : ''}`}>
                  <div className="dot"></div>
                  <div className="timeline-content">
                    <h4>Decision</h4>
                    <p>{data.status === 'PENDING' ? 'Final result pending' : data.status}</p>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </main>
      </div>
    </div>
  );
};

export default ApplicationDetails;