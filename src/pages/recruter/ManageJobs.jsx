import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import axios from "axios";
import {
  FaPlus, FaEdit, FaTrash, FaSearch, FaChevronLeft, FaChevronRight,
  FaGlobe, FaBriefcase, FaMapMarkerAlt, FaSortAmountDown,
  FaMoneyBillWave, FaCheckCircle, FaChartLine, FaClock, 
  FaUserGraduate, FaCalendarAlt, FaBuilding, FaUserTie, FaExclamationCircle, FaLock, FaLayerGroup,
  FaTags, FaDollarSign
} from "react-icons/fa";
import "../Styles/ManageJobs.css";

export default function ManageJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedJob, setSelectedJob] = useState(null);

  const currentUserEmail = localStorage.getItem("userEmail"); 
  const abortControllerRef = useRef(null);

  const [filters, setFilters] = useState({
    keyword: "",
    location: "",
    jobType: "ALL",
    workMode: "ALL",
    experienceLevel: "ALL", 
    viewMode: "MY_JOBS",
    category: "ALL",  
    sortBy: "postedDate,desc",
    minSalary: 0
  });

  const API_BASE_URL = "https://job-portal-backend-365l.onrender.com/job-portal/jobs";

  const isOwner = useCallback((job) => {
    if (!job || !job.recruiter || !currentUserEmail) return false;
    return job.recruiter.email?.toLowerCase().trim() === currentUserEmail.toLowerCase().trim();
  }, [currentUserEmail]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setFilters(prev => ({ ...prev, keyword: searchTerm }));
      setCurrentPage(0);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const endpoint = filters.viewMode === "MY_JOBS" ? `${API_BASE_URL}/my-jobs` : API_BASE_URL;
      
      const params = new URLSearchParams();
      params.append("page", currentPage);
      params.append("size", 10);
      params.append("sort", filters.sortBy);
      
      if (filters.keyword) params.append("keyword", filters.keyword);
      if (filters.location) params.append("location", filters.location);
      if (filters.jobType !== "ALL") params.append("jobType", filters.jobType);
      if (filters.workMode !== "ALL") params.append("workMode", filters.workMode);
      if (filters.category !== "ALL") params.append("category", filters.category);
      if (filters.experienceLevel !== "ALL") params.append("experienceLevel", filters.experienceLevel);
      if (filters.minSalary > 0) params.append("minSalary", filters.minSalary / 100000); 

      const res = await axios.get(endpoint, {
        params,
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      
      setJobs(res.data.content || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error("Fetch failed:", err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, filters]);

  useEffect(() => {
    const handler = setTimeout(() => fetchJobs(), 300);
    return () => clearTimeout(handler);
  }, [fetchJobs]);

  const processedJobs = useMemo(() => {
    return [...jobs]; 
  }, [jobs]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(0); 
  };

  const resetFilters = () => {
    setFilters({
      keyword: "",
      location: "",
      jobType: "ALL",
      workMode: "ALL",
      experienceLevel: "ALL",
      minSalary: 0,
      category: "ALL",
      viewMode: "MY_JOBS",
      sortBy: "postedDate,desc"
    });
    setCurrentPage(0);
  };

  return (
    <div className="mj-container">
      <header className="mj-header">
        <div className="mj-header-info">
          <h1>Recruiter Command Center</h1>
          <p>Active Session: <strong>{currentUserEmail || "N/A"}</strong></p>
        </div>
        
        <div className="mj-header-actions">
           <button className="mj-btn-secondary" onClick={resetFilters}>Reset Filters</button>
           <button className="mj-btn-primary"><FaPlus /> Post New Job</button>
        </div>
      </header>

      <main className="mj-grid">
        {/* Sidebar Filter Control Tower */}
        <aside className="mj-sidebar">
          <div className="mj-sidebar-scroll">
            <section className="mj-filter-group">
              <label className="mj-label"><FaGlobe /> Database Scope</label>
              <div className="mj-toggle-group">
                <button 
                  className={filters.viewMode === "MY_JOBS" ? "active" : ""} 
                  onClick={() => handleFilterChange("viewMode", "MY_JOBS")}
                >
                  My Jobs
                </button>
                <button 
                  className={filters.viewMode === "ALL_JOBS" ? "active" : ""} 
                  onClick={() => handleFilterChange("viewMode", "ALL_JOBS")}
                >
                  Global Feed
                </button>
              </div>
            </section>

            <section className="mj-filter-group">
              <label className="mj-label"><FaLayerGroup /> Category</label>
              <select 
                className="mj-select" 
                value={filters.category} 
                onChange={(e) => handleFilterChange("category", e.target.value)}
              >
                <option value="ALL">All Categories</option>
                <option value="SOFTWARE_DEVELOPMENT">Software Development</option>
                <option value="DATA_SCIENCE">Data Science</option>
                <option value="DEVOPS">DevOps</option>
                <option value="CYBER_SECURITY">Cyber Security</option>
                <option value="AI_ML">AI / ML</option>
                <option value="WEB_DEVELOPMENT">Web Development</option>
                <option value="MOBILE_DEVELOPMENT">Mobile Development</option>
                <option value="TESTING">Testing</option>
                <option value="UI_UX">UI / UX</option>
                <option value="MANAGEMENT">Management</option>
              </select>
            </section>

            <section className="mj-filter-group">
              <label className="mj-label"><FaBriefcase /> Job Type</label>
              <select className="mj-select" value={filters.jobType} onChange={(e) => handleFilterChange("jobType", e.target.value)}>
                <option value="ALL">All Types</option>
                <option value="FULL_TIME">Full Time</option>
                <option value="PART_TIME">Part Time</option>
                <option value="INTERNSHIP">Internship</option>
              </select>
            </section>

            <section className="mj-filter-group">
              <label className="mj-label"><FaUserGraduate /> Experience</label>
              <select className="mj-select" value={filters.experienceLevel} onChange={(e) => handleFilterChange("experienceLevel", e.target.value)}>
                <option value="ALL">All Levels</option>
                <option value="FRESHER">Fresher</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="SENIOR">Senior</option>
              </select>
            </section>

            <section className="mj-filter-group">
              <label className="mj-label"><FaMoneyBillWave /> Min Salary: ₹{Number(filters.minSalary).toLocaleString()}</label>
              <input type="range" min="0" max="2500000" step="50000" value={filters.minSalary} onChange={(e) => handleFilterChange("minSalary", e.target.value)} className="mj-range" />
            </section>
            
            <section className="mj-filter-group">
               <label className="mj-label"><FaSortAmountDown /> Sort By</label>
               <select className="mj-select" value={filters.sortBy} onChange={(e) => handleFilterChange("sortBy", e.target.value)}>
                  <option value="postedDate,desc">Latest First</option>
                  <option value="salary,desc">Highest Salary</option>
                  <option value="title,asc">Title (A-Z)</option>
               </select>
            </section>
          </div>
        </aside>

        {/* Central Feed List */}
        <section className="mj-list-area">
          <div className="mj-search-cluster">
            <div className="mj-input-wrapper">
              <FaSearch className="mj-input-icon" />
              <input placeholder="Search title..." value={filters.keyword} onChange={(e) => handleFilterChange("keyword", e.target.value)} />
            </div>
            <div className="mj-input-wrapper">
              <FaMapMarkerAlt className="mj-input-icon" />
              <input placeholder="City..." value={filters.location} onChange={(e) => handleFilterChange("location", e.target.value)} />
            </div>
          </div>

          <div className="mj-scroll-stack">
            {loading ? (
              <div className="mj-spinner-box"><div className="mj-spinner"></div></div>
            ) : processedJobs.length === 0 ? (
              <div className="mj-empty"><FaExclamationCircle /> No matching jobs found</div>
            ) : (
              processedJobs.map(job => (
                <div key={job.publicId} 
                     className={`mj-item-card ${selectedJob?.publicId === job.publicId ? "selected" : ""}`} 
                     onClick={() => setSelectedJob(job)}>
                  <div className="mj-item-main">
                    <h4>
                      {job.title} 
                      {isOwner(job) && <FaCheckCircle className="owner-icon" title="Your Listing"/>}
                    </h4>
                    {/* CRITICAL FIX: Evaluates object logic clearly avoiding React children validation exceptions */}
                    <p>
                      {job.company && typeof job.company === "object" && job.company.name 
                        ? String(job.company.name) 
                        : "Direct Hire"} • {job.location || "Remote"}
                    </p>
                  </div>
                  <div className="mj-item-side">
                    <div className="mj-item-salary">₹{(job.salary/100000).toFixed(1)}LPA</div>
                    <span className={`mj-status-badge ${job.status?.toLowerCase()}`}>{job.status}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          <footer className="mj-pagination">
            <button disabled={currentPage === 0} onClick={() => setCurrentPage(p => p - 1)}><FaChevronLeft/></button>
            <span>{currentPage + 1} / {totalPages || 1}</span>
            <button disabled={currentPage >= totalPages - 1} onClick={() => setCurrentPage(p => p + 1)}><FaChevronRight/></button>
          </footer>
        </section>

        {/* Detailed Inspection Pane */}
        <section className="mj-detail-pane">
          {selectedJob ? (
            <div className="mj-detail-scroll fade-in">
              
              {/* 1. BRAND HEADER & STATUS BADGES */}
              <div className="mj-detail-top">
                <div className="mj-brand-header">
                  <div className="mj-company-avatar">
                    <FaBuilding />
                  </div>
                  <div className="mj-main-titles">
                    <div className="mj-badge-row" style={{ display: 'flex', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                      {selectedJob.jobType && (
                        <span className="mj-category-tag">
                          {typeof selectedJob.jobType === 'string' 
                            ? selectedJob.jobType.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) 
                            : "N/A"}
                        </span>
                      )}
                      {selectedJob.status && (
                        <span className={`mj-status-badge ${String(selectedJob.status).toLowerCase()}`}>
                          {selectedJob.status}
                        </span>
                      )}
                    </div>
                    <h2>{selectedJob.title || "Untitled Position"}</h2>
                    {/* CRITICAL FIX: Safe deep validation string fallback guarding against raw rendering engine objects */}
                    <h4>
                      {selectedJob.company && typeof selectedJob.company === 'object' && selectedJob.company.name
                        ? String(selectedJob.company.name)
                        : "Company Confidential"}
                    </h4>
                  </div>
                </div>
                
                {/* ACTION BUTTONS */}
                <div className="mj-detail-actions">
                  {typeof isOwner === 'function' && isOwner(selectedJob) ? (
                    <>
                      <button className="mj-btn-icon edit" title="Edit Job"><FaEdit /></button>
                      <button className="mj-btn-icon delete" title="Delete Job"><FaTrash /></button>
                    </>
                  ) : (
                    <div className="mj-view-only-badge"><FaLock /> Global View</div>
                  )}
                </div>
              </div>

              {/* 2. ANALYTICS GRID */}
              <div className="mj-analytics-grid">
                <div className="mj-analytic-card">
                  <span>Openings</span>
                  <h3>{selectedJob.openings ?? 1}</h3>
                </div>
                <div className="mj-analytic-card">
                  <span>Experience</span>
                  <h3>
                    {selectedJob.experienceLevel && typeof selectedJob.experienceLevel === 'string'
                      ? selectedJob.experienceLevel.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) 
                      : "Any"}
                  </h3>
                </div>
                <div className="mj-analytic-card">
                  <span>Work Mode</span>
                  <h3>
                    {selectedJob.workMode && typeof selectedJob.workMode === 'string'
                      ? selectedJob.workMode.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) 
                      : "Onsite"}
                  </h3>
                </div>
                <div className="mj-analytic-card">
                  <span>Applicants</span>
                  <h3>{selectedJob.applicantsCount ?? 0}</h3>
                </div>
              </div>

              {/* 3. REQUIRED SKILLS SECTION */}
              <div className="mj-section">
                <h5>Required Skills</h5>
                <div className="mj-pill-box">
                  {Array.isArray(selectedJob.skillsRequired) && selectedJob.skillsRequired.length > 0 ? (
                    selectedJob.skillsRequired.map((skillObj, i) => (
                      <span key={skillObj?.id || i} className="mj-skill-pill">
                        {skillObj?.skill || (typeof skillObj === 'string' ? skillObj : "Unknown Skill")}
                      </span>
                    ))
                  ) : (
                    <span className="mj-text-light">No specific skills listed</span>
                  )}
                </div>
              </div>

              {/* 4. JOB INTELLIGENCE METADATA */}
              <div className="mj-section">
                <h5>Job Intelligence</h5>
                <ul className="mj-intel-list">
                  <li>
                    <FaTags /> <strong>Category:</strong>{" "}
                    {selectedJob.category && typeof selectedJob.category === 'string'
                      ? selectedJob.category.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) 
                      : "General"}
                  </li>
                  <li>
                    {/* PATCHED: Normalized regional configuration targeting En-IN / INR standards */}
                    <FaDollarSign /> <strong>Salary:</strong>{" "}
                    {selectedJob.salary !== null && selectedJob.salary !== undefined && !isNaN(selectedJob.salary)
                      ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(selectedJob.salary)
                      : "Not Disclosed"}
                  </li>
                  <li>
                    <FaUserTie /> <strong>Recruiter:</strong> {selectedJob.recruiter?.name || "Independent"}
                  </li>
                  <li>
                    <FaMapMarkerAlt /> <strong>Location:</strong> {selectedJob.location || "Remote / Unspecified"}
                  </li>
                  <li>
                    <FaCalendarAlt /> <strong>Posted:</strong>{" "}
                    {selectedJob.postedDate && !isNaN(Date.parse(selectedJob.postedDate))
                      ? new Date(selectedJob.postedDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) 
                      : "N/A"}
                  </li>
                  <li>
                    {/* PATCHED: Bound to matching database property closedDate */}
                    <FaClock /> <strong>Deadline:</strong>{" "}
                    {selectedJob.closedDate && !isNaN(Date.parse(selectedJob.closedDate))
                      ? new Date(selectedJob.closedDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) 
                      : "No Set Date"}
                  </li>
                  <li>
                    <FaUserGraduate /> <strong>Education:</strong> {selectedJob.education || "Not Specified"}
                  </li>
                </ul>
              </div>

              {/* 5. JOB DESCRIPTION TEXT */}
              <div className="mj-section">
                <h5>Job Description</h5>
                <p className="mj-description-text">
                  {selectedJob.description || `We are looking for a qualified ${selectedJob.title || 'professional'} to join our team in ${selectedJob.location || 'our office'}.`}
                </p>
              </div>

            </div>
          ) : (
            <div className="mj-empty-state">
              <FaChartLine size={50} />
              <p>Select a job from the list to view full details.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}