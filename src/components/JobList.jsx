import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
// import { useNavigate } from "react-router-dom";
import { useNavigate, useSearchParams } from "react-router-dom";
import AuthDrawer from "../pages/AuthDrawer";
import { 
  FaMapMarkerAlt, FaWallet, FaSearch, FaFilter, FaBriefcase, FaGraduationCap, 
  FaLayerGroup, FaBolt, FaBuilding, FaChevronLeft, FaChevronRight, 
  FaRegBookmark, FaBookmark, FaArrowRight, FaSort, FaExclamationCircle, FaCheckCircle,FaUser
} from "react-icons/fa";
import "../components/Styles/joblist.css";

const API_BASE = "http://localhost:8080/job-portal";

const JobPortal = ({ isHomePage = false }) => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const debounceTimer = useRef(null);

  // --- STATE ---
  const [authMode, setAuthMode] = useState("login");
  const [isAuthDrawerOpen, setAuthDrawerOpen] = useState(false);
  // const [authMode, setAuthMode] = useState("login");
  const [jobs, setJobs] = useState([]);
  const [savedJobIds, setSavedJobIds] = useState(new Set());
  const [selectedJob, setSelectedJob] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [searchParams] = useSearchParams(); 
  

  const [filters, setFilters] = useState({
    keyword: "",
    location: "",
    category: "",
    jobType: "",
    workMode: "",
    experienceLevel: "",
    minSalary: "",
    jobStatus: "OPEN",
    sort: "postedDate,desc",
    page: 0,
    size: isHomePage ? 6 : 10
  });

  // --- API CALLS ---

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const cleanParams = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== "" && v !== null)
      );

      const res = await axios.get(`${API_BASE}/jobs`, {
        params: cleanParams,
        headers: token ? { Authorization: `Bearer ${token}` } : {} 
      });

      // const res = await axios.get(`${API_BASE}/jobs`, {
      //   params: cleanParams,
      //   headers: token ? { Authorization: `Bearer ${token}` } : {} 
      // });

     const content = res.data?.content || [];
      setJobs(content);
      setTotalPages(res.data?.totalPages || 0);

      // --- LOGIC FOR SPECIFIC JOB REDIRECT ---
      const jobIdFromUrl = searchParams.get("id");
      
      if (content.length > 0 && !isHomePage) {
        if (jobIdFromUrl) {
          // Find the job that matches the ID in the URL
          const targetedJob = content.find(j => j.publicId === jobIdFromUrl);
          setSelectedJob(targetedJob || content[0]);
        } else {
          setSelectedJob(content[0]);
        }
      } else if (isHomePage) {
        setSelectedJob(null);
      }
    } catch (err) {
      setError(err.response?.status === 403 ? "Access Denied" : "Failed to load jobs.");
    } finally {
      setLoading(false);
    }
  }, [filters, token, isHomePage, searchParams]); // Add searchParams to dependency

  const fetchSavedStatus = useCallback(async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${API_BASE}/saved`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const ids = new Set(res.data.filter(item => item?.job?.publicId).map(item => item.job.publicId));
      setSavedJobIds(ids);
    } catch (err) { console.error(err); }
  }, [token]);

 const toggleSave = async (e, jobId) => {
    e.stopPropagation();
    
    // If no token, open the drawer instead of navigating
    if (!token) {
      setAuthMode("login");
      setAuthDrawerOpen(true);
      return;
    }

    try {
      if (savedJobIds.has(jobId)) {
        await axios.delete(`${API_BASE}/saved/${jobId}`, { 
          headers: { Authorization: `Bearer ${token}` } 
        });
        setSavedJobIds(prev => { 
          const n = new Set(prev); 
          n.delete(jobId); 
          return n; 
        });
      } else {
        await axios.post(`${API_BASE}/saved/${jobId}`, {}, { 
          headers: { Authorization: `Bearer ${token}` } 
        });
        setSavedJobIds(prev => new Set(prev).add(jobId));
      }
    } catch (err) { 
      console.error("Save failed", err); 
    }
  };
  const getDeadlineInfo = (closedDate) => {
  if (!closedDate) return null;
  const target = new Date(closedDate);
  const today = new Date();
  const diffTime = target - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return { text: "Expired", class: "expired" };
  if (diffDays === 0) return { text: "Ends Today!", class: "urgent" };
  if (diffDays <= 3) return { text: `${diffDays} days left`, class: "urgent" };
  return { text: `${diffDays} days left`, class: "upcoming" };
};

  // --- LOGIC ---

  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => { fetchJobs(); }, 400);
    return () => clearTimeout(debounceTimer.current);
  }, [filters, fetchJobs]);
  const handleReset = () => {
  setFilters({
    keyword: "",
    location: "",
    category: "",
    jobType: "",
    workMode: "",
    experienceLevel: "",
    minSalary: 0, // Reset slider to 0
    jobStatus: "OPEN", // Default back to active jobs
    sort: "postedDate,desc",
    page: 0,
    size: isHomePage ? 6 : 10
  });
};

  useEffect(() => { fetchSavedStatus(); }, [fetchSavedStatus]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value, page: 0 }));
  };

  const formatSalary = (s) => s ? (s / 100000).toFixed(1) : "N/A";

  const EmptyState = () => (
    <div className="empty-state">
      <FaSearch size={40} />
      <p>No jobs found.</p>
    </div>
  );

  // --- 🏠 RENDER: HOME PAGE ---
  if (isHomePage) {
    return (
      <section className="home-featured-section">
        <div className="section-header">
          <div className="title-stack">
            <h2>Trending <span className="highlight">Opportunities</span></h2>
            <p>Handpicked roles from top-tier companies</p>
          </div>
          <button className="view-all-btn" onClick={() => navigate("/jobs")}>
            Explore All <FaArrowRight />
          </button>
        </div>

        <div className="home-jobs-grid">
          {loading ? (
            [1,2,3,4,5,6].map(i => <div key={i} className="skeleton-card" />)
          ) : error ? (
            <div className="error-card">{error}</div>
          ) : jobs.length === 0 ? (
            <EmptyState />
          ) : (
            jobs.map(job => (
              <div key={job.publicId} className="modern-job-card" onClick={() => {
  setSelectedJob(job);
  navigate(`/jobs?id=${job.publicId}`, { replace: true });
}}>
                <div className="card-badge">{job.jobType?.replace('_', ' ')}</div>
                <div className="card-body">
                  <div className="company-logo-sm">{job.company?.charAt(0)}</div>
                  <h4>{job.title}</h4>
                  <p className="company-name">{job.company}</p>
                  <div className="card-meta">
                     <span><FaMapMarkerAlt /> {job.location}</span>
                     <span><FaWallet /> ₹{formatSalary(job.salary)}L</span>
                  </div>
                </div>
                <div className="card-footer">
                  <span className="mode-pill">{job.workMode}</span>
                  <button onClick={(e) => toggleSave(e, job.publicId)} className="save-icon-btn">
                     {savedJobIds.has(job.publicId) ? <FaBookmark color="#4f46e5"/> : <FaRegBookmark />}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    );
  }

  // --- 💼 RENDER: FULL PORTAL ---
  return (
    <div className="full-portal-layout">
      {/* Search Header */}
     <div className="top-search-section premium-search-hub">
  <div className="search-container">
    <div className="search-glass-wrapper">
      {/* 1. Keyword Input Group */}
      <div className="search-input-group">
        <div className="input-icon-circle">
          <FaSearch className="search-icon" />
        </div>
        <div className="input-stack">
          <label>What</label>
          <input 
            name="keyword" 
            placeholder="Role, Skill, or Company" 
            value={filters.keyword} 
            onChange={handleFilterChange} 
          />
        </div>
      </div>

      <div className="search-divider"></div>

      {/* 2. Location Input Group */}
      <div className="search-input-group">
        <div className="input-icon-circle">
          <FaMapMarkerAlt className="loc-icon" />
        </div>
        <div className="input-stack">
          <label>Where</label>
          <input 
            name="location" 
            placeholder="City, State or Remote" 
            value={filters.location} 
            onChange={handleFilterChange} 
          />
        </div>
      </div>

      {/* 3. The "Pulse" Search Button */}
      <button className="pro-search-btn" onClick={fetchJobs}>
        <span>Search Jobs</span>
        <div className="btn-glow"></div>
      </button>
    </div>

    {/* Smart Suggestions (Optional but looks great) */}
    <div className="quick-suggest-tags">
      <span className="suggest-label">Trending:</span>
      {['Java Full Stack', 'Spring Boot', 'Remote', 'React'].map(tag => (
        <button key={tag} className="tag-pill" onClick={() => handleFilterChange({target: {name: 'keyword', value: tag}})}>
          {tag}
        </button>
      ))}
    </div>
  </div>
</div>

      <div className="portal-content-grid">
     <aside className="portal-filters-sidebar premium-theme">
  <div className="filter-header-main">
    <div>
      <h3>Precision Search</h3>
      <p>Fine-tune your career match</p>
    </div>
    <button className="glass-reset" onClick={handleReset}>Reset</button>
  </div>

  {/* 1. Category: Minimalist Floating Label */}
  <div className="neo-filter-group">
    <div className="neo-label">Industry Sector</div>
    <div className="custom-select-wrapper">
       <select name="category" value={filters.category} onChange={handleFilterChange}>
         <option value="">All Categories</option>

       <option value="SOFTWARE_DEVELOPMENT">Software Development</option>



              <option value="DATA_SCIENCE">Data Science</option>



              <option value="DEVOPS">DevOps</option>



              <option value="CYBER_SECURITY">Cyber Security</option>



              <option value="QA_TESTING">QA & Testing</option>



              <option value="UI_UX">UI/UX Design</option>



              <option value="MANAGEMENT">Management</option>



              <option value="OPERATIONS">Operations</option>



              <option value="BUSINESS_ANALYST">Business Analyst</option>



              <option value="FINANCE">Finance</option>



              <option value="ACCOUNTING">Accounting</option>



              <option value="MARKETING">Marketing</option>



              <option value="SALES">Sales</option>



              <option value="DIGITAL_MARKETING">Digital Marketing</option>



              <option value="HUMAN_RESOURCES">Human Resources</option>



              <option value="CUSTOMER_SUPPORT">Customer Support</option>



              <option value="ENGINEERING">Engineering</option>



              <option value="EDUCATION">Education</option>



              <option value="HEALTHCARE">Healthcare</option>

    </select>
    </div>
  </div>

  {/* 2. Work Mode: Segmented Toggle Bar */}
  <div className="neo-filter-group">
    <div className="neo-label">Environment</div>
    <div className="segmented-control">
      {['ONSITE', 'REMOTE', 'HYBRID'].map(mode => (
        <button 
          key={mode}
          className={filters.workMode === mode ? 'active' : ''}
          onClick={() => setFilters(prev => ({...prev, workMode: prev.workMode === mode ? "" : mode}))}
        >
          {mode.charAt(0) + mode.slice(1).toLowerCase()}
        </button>
      ))}
    </div>
  </div>

  {/* 3. Salary: The Progress Bar Slider */}
  <div className="neo-filter-group">
    <div className="neo-label">Compensation Floor</div>
    <div className="salary-bar-container">
      <div className="salary-value">₹ {filters.minSalary || 0} <span>LPA</span></div>
      <input 
        type="range" 
        min="0" 
        max="50" 
        step="0.5"
        name="minSalary"
        value={filters.minSalary || 0}
        onChange={handleFilterChange}
        className="neo-range-slider"
      />
      <div className="range-labels">
        <span>0L</span>
        <span>25L</span>
        <span>50L+</span>
      </div>
    </div>
  </div>

  {/* 4. Experience & Type: Combined Grid */}
  <div className="neo-filter-group">
    <div className="neo-label">Seniority & Commitment</div>
    <div className="bento-grid-filters">
      {['FRESHER', 'INTERMEDIATE', 'SENIOR'].map(lvl => (
        <div 
          key={lvl}
          className={`bento-item ${filters.experienceLevel === lvl ? 'active' : ''}`}
          onClick={() => setFilters(prev => ({...prev, experienceLevel: prev.experienceLevel === lvl ? "" : lvl}))}
        >
          {lvl === 'INTERMEDIATE' ? 'Mid' : lvl.charAt(0) + lvl.slice(1).toLowerCase()}
        </div>
      ))}
    </div>
  </div>

  {/* 5. Quick Toggles: Status & Urgency */}
  <div className="toggle-list">
    <label className="switch-wrapper">
      <input 
        type="checkbox" 
        checked={filters.jobStatus === 'OPEN'} 
        onChange={() => setFilters(prev => ({...prev, jobStatus: prev.jobStatus === 'OPEN' ? 'CLOSED' : 'OPEN'}))}
      />
      <span className="switch-slider"></span>
      <span className="switch-text">Only Active Roles</span>
    </label>
  </div>
</aside>
        <main className="portal-main-view">
          <div className="jobs-split-view">
            {/* List */}
            <div className="job-cards-list">
              {jobs.map(job => (
                <div 
                  key={job.publicId} 
                  className={`job-item-card ${selectedJob?.publicId === job.publicId ? 'active' : ''}`}
                  // style={{ animationDelay: `${index * 0.1}s` }}
                  onClick={() => setSelectedJob(job)}
                >
                  <h4>{job.title}</h4>
                  <p>{job.company}</p>
                  <div className="card-tags">
                    <span>{job.workMode}</span>
                    <span>₹{formatSalary(job.salary)}L</span>
                  </div>
                  <button onClick={(e) => toggleSave(e, job.publicId)} className="save-btn-small">
                    {savedJobIds.has(job.publicId) ? <FaBookmark color="#4f46e5"/> : <FaRegBookmark />}
                  </button>
                </div>
              ))}
              <div className="pagination-footer">
                <button disabled={filters.page === 0} onClick={() => setFilters(f => ({...f, page: f.page - 1}))}><FaChevronLeft /></button>
                <span>{filters.page + 1} of {totalPages}</span>
                <button disabled={filters.page >= totalPages - 1} onClick={() => setFilters(f => ({...f, page: f.page + 1}))}><FaChevronRight /></button>
              </div>
            </div>

            {/* Details */}
        <div className="job-details-pane">
  {selectedJob ? (
    <div className="details-card animate-slide-up">
      {/* Header with Countdown Badge */}
      <div className="details-header">
        <div className="company-logo-large">{selectedJob.company?.charAt(0)}</div>
        <div className="header-text">
          <div className="title-row">
            <h2>{selectedJob.title}</h2>
            {selectedJob.closedDate && (
              <span className={`deadline-tag ${getDeadlineInfo(selectedJob.closedDate).class}`}>
                <FaBolt /> {getDeadlineInfo(selectedJob.closedDate).text}
              </span>
            )}
          </div>
          <p className="detail-subtitle">
            <FaBuilding /> {selectedJob.company} • <FaMapMarkerAlt /> {selectedJob.location}
          </p>
        </div>
      </div>

     <div className="action-bar">
 <div className="action-bar">
  <button 
    className="apply-now-btn" 
    onClick={() => {
      if (!token) {
        // If not logged in, show login drawer and set mode
        setAuthMode("login");
        setAuthDrawerOpen(true);
      } else {
        // If logged in, proceed to application
        navigate(`/apply/${selectedJob.publicId}`);
      }
    }}
  >
    Apply Now <FaArrowRight />
  </button>
  
  {/* Rest of your buttons... */}
</div>
  
  <button className="save-large-btn" onClick={(e) => toggleSave(e, selectedJob.publicId)}>
    {savedJobIds.has(selectedJob.publicId) ? <FaBookmark color="#10b981" /> : <FaRegBookmark />}
  </button>
</div>

      <div className="details-scroll-area">
        {/* Statistics Grid */}
        <div className="overview-grid">
          <div className="ov-item">
            <FaWallet className="ov-icon" />
            <div className="ov-info"><label>Salary</label><span>₹{formatSalary(selectedJob.salary)}L</span></div>
          </div>
          <div className="ov-item">
            <FaBriefcase className="ov-icon" />
            <div className="ov-info"><label>Type</label><span>{selectedJob.jobType?.replace('_', ' ')}</span></div>
          </div>
          <div className="ov-item">
            <FaLayerGroup className="ov-icon" />
            <div className="ov-info"><label>Openings</label><span>{selectedJob.openings} Positions</span></div>
          </div>
          <div className="ov-item">
            <FaCheckCircle className="ov-icon" />
            <div className="ov-info"><label>Level</label><span>{selectedJob.experienceLevel}</span></div>
          </div>
        </div>

        {/* Skills Section */}
        <div className="details-body">
          <h3 className="section-title">Required Skills</h3>
          <div className="skills-container">
            {selectedJob.skillsRequired.map(skill => (
              <span key={skill} className="skill-pill">{skill.trim()}</span>
            ))}
          </div>

          <h3 className="section-title">Description</h3>
          <p className="full-description">{selectedJob.description}</p>

          {/* Recruiter Card */}
          <div className="recruiter-mini-card">
            <h3 className="section-title">Posted By</h3>
            <div className="recruiter-info">
              <div className="avatar-sm"><FaUser /></div>
              <div>
                <strong>{selectedJob.recruiter?.name}</strong>
                <p>{selectedJob.recruiter?.email}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  ) : (
    <div className="empty-details">Select a job to view all details</div>
  )}
</div>
<AuthDrawer 
        isOpen={isAuthDrawerOpen} 
        onClose={() => setAuthDrawerOpen(false)} 
        initialMode={authMode} 
      />
          </div>
        </main>
      </div>
    </div>
  );
};

export default JobPortal;