import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FaBriefcase, FaClock, FaFilePdf, FaChartLine, 
  FaArrowRight, FaBookmark, FaMapMarkerAlt, 
  FaWallet, FaTrashAlt, FaSearch, FaSortAmountDown, FaArrowLeft 
} from 'react-icons/fa';
import "../components/Styles/applications.css";

const MyApplications = () => {
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('applications'); 
  const [applications, setApplications] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");

  useEffect(() => {
    fetchData();
  }, [activeTab, page]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      if (activeTab === 'applications') {
        // MATCHES: http://localhost:8080/job-portal/applications/my?page=0&size=10
        const res = await axios.get(`/job-portal/applications/my?page=${page}&size=10`, { headers });
        setApplications(res.data.content || []);
        setTotalPages(res.data.totalPages || 0);
      } else {
        // MATCHES: http://localhost:8080/job-portal/saved
        const res = await axios.get(`/job-portal/saved`, { headers });
        setSavedJobs(Array.isArray(res.data) ? res.data : []);
      }
    } catch (err) {
      console.error("API Error:", err);
      setApplications([]);
      setSavedJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUnsave = async (e, jobId) => {
    e.stopPropagation();
    try {
      await axios.delete(`/job-portal/saved/${jobId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setSavedJobs(prev => prev.filter(job => job.publicId !== jobId));
    } catch (err) {
      alert("Error removing saved job");
    }
  };

  // Redirection Logic to specific job
  // MATCHES: http://localhost:8080/job-portal/jobs/JOB_ID
  const goToJobDetails = (jobId) => {
    navigate(`/job-portal/jobs/${jobId}`);
  };

  const filteredApps = applications
    .filter(app => 
      app.jobTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.companyName?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const d1 = new Date(a.appliedAt);
      const d2 = new Date(b.appliedAt);
      return sortOrder === 'desc' ? d2 - d1 : d1 - d2;
    });

  const filteredSaved = savedJobs.filter(job => 
    job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.company?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="my-apps-container">
      <nav className="back-nav">
        {/* Navigate back to the job search hub */}
        <button className="btn-back" onClick={() => navigate('/job-portal/jobs')}>
          <FaArrowLeft /> Back to Jobs
        </button>
      </nav>

      <header className="apps-header">
        <div className="header-text">
          <h1>Student Dashboard</h1>
          <p>Track applications and manage your saved opportunities</p>
        </div>
        
        <div className="controls-row">
          <div className="search-box">
            <FaSearch />
            <input 
              type="text" 
              placeholder="Filter by title or company..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="sort-btn" onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}>
            <FaSortAmountDown /> {sortOrder === 'desc' ? 'Newest' : 'Oldest'}
          </button>
        </div>
      </header>

      <div className="tabs-nav">
        <button 
          className={activeTab === 'applications' ? 'active' : ''} 
          onClick={() => { setActiveTab('applications'); setPage(0); }}
        >
          <FaBriefcase /> My Applications
        </button>
        <button 
          className={activeTab === 'saved' ? 'active' : ''} 
          onClick={() => setActiveTab('saved')}
        >
          <FaBookmark /> Saved Jobs
        </button>
      </div>

      {loading ? (
        <div className="loader-box"><div className="spinner"></div></div>
      ) : activeTab === 'applications' ? (
        <div className="apps-list">
          {filteredApps.length > 0 ? (
            filteredApps.map((app) => (
              <div key={app.applicationId} className="app-card" onClick={() => goToJobDetails(app.jobPublicId)}>
                <div className="app-card-header">
                  <div className="job-info">
                    <h3>{app.jobTitle}</h3>
                    <p className="company-text">{app.companyName}</p>
                  </div>
                  <span className={`status-badge status-${app.status?.toLowerCase()}`}>
                    {app.status === 'APPLIED' && <FaClock />} {app.status}
                  </span>
                </div>

                <div className="app-card-body">
                  <div className="stats-row">
                    <div className="stat-item">
                      <label>Match Score</label>
                      <div className="score-pill" style={{ color: app.matchScore > 75 ? '#10b981' : '#f59e0b' }}>
                        <FaChartLine /> {app.matchScore}%
                      </div>
                    </div>
                    <div className="stat-item">
                      <label>Applied</label>
                      <span>{new Date(app.appliedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>
                    </div>
                  </div>
                </div>

                <div className="app-card-footer">
                  <a href={app.resumeUrl} target="_blank" rel="noreferrer" className="resume-link" onClick={(e) => e.stopPropagation()}>
                    <FaFilePdf /> View Resume
                  </a>
                  <button className="view-job-btn">Details <FaArrowRight /></button>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">No matching applications.</div>
          )}

          {totalPages > 1 && (
            <div className="pagination">
              <button disabled={page === 0} onClick={() => setPage(page - 1)}>Prev</button>
              <span>{page + 1} / {totalPages}</span>
              <button disabled={page === totalPages - 1} onClick={() => setPage(page + 1)}>Next</button>
            </div>
          )}
        </div>
      ) : (
        <div className="saved-jobs-grid">
          {filteredSaved.length > 0 ? (
            filteredSaved.map((job) => (
              <div key={job.publicId} className="saved-card" onClick={() => goToJobDetails(job.publicId)}>
                <div className="saved-header">
                  <div className="company-logo">{job.company?.charAt(0)}</div>
                  <button onClick={(e) => handleUnsave(e, job.publicId)} className="unsave-btn">
                    <FaTrashAlt />
                  </button>
                </div>
                <h4>{job.title}</h4>
                <p className="company-name">{job.company}</p>
                <div className="job-meta">
                  <span><FaMapMarkerAlt /> {job.location}</span>
                  <span><FaWallet /> ₹{(job.salary/1000).toFixed(0)}k</span>
                </div>
                <button className="apply-now-btn">Apply Now</button>
              </div>
            ))
          ) : (
            <div className="empty-state">Your saved list is empty.</div>
          )}
        </div>
      )}
    </div>
  );
};

export default MyApplications;