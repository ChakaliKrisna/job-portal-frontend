import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import axios from "axios";
import {
  FaPlus, FaEdit, FaTrash, FaSearch, FaChevronLeft, FaChevronRight,
  FaGlobe, FaBriefcase, FaMapMarkerAlt, FaSortAmountDown,
  FaMoneyBillWave, FaCheckCircle, FaChartLine, FaClock, 
  FaUserGraduate, FaCalendarAlt, FaBuilding, FaUserTie, FaExclamationCircle, FaLock, FaLayerGroup
} from "react-icons/fa";
import "../Styles/ManageJobs.css";


export default function ManageJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
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

  const API_BASE_URL = "http://localhost:8080/job-portal/jobs";

  const isOwner = useCallback((job) => {
    if (!job || !job.recruiter || !currentUserEmail) return false;
    return job.recruiter.email?.toLowerCase().trim() === currentUserEmail.toLowerCase().trim();
  }, [currentUserEmail]);

  const fetchJobs = useCallback(async () => {
    if (abortControllerRef.current) abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();

    setLoading(true);
    try {
      const endpoint = filters.viewMode === "MY_JOBS" ? `${API_BASE_URL}/my-jobs` : API_BASE_URL;

      const params = {
        page: currentPage,
        size: 10,
        sort: filters.sortBy 
      };

      if (filters.keyword.trim()) params.keyword = filters.keyword.trim();
      if (filters.location.trim()) params.location = filters.location.trim();
      if (filters.jobType !== "ALL") params.jobType = filters.jobType;
      if (filters.workMode !== "ALL") params.workMode = filters.workMode;
      if (filters.category !== "ALL") params.category = filters.category;
      if (filters.experienceLevel !== "ALL") params.experienceLevel = filters.experienceLevel;
      if (filters.minSalary > 0) params.minSalary = filters.minSalary;

      const res = await axios.get(endpoint, {
        params,
        signal: abortControllerRef.current.signal,
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      
      const content = res.data.content || [];
      setJobs(content);
      setTotalPages(res.data.totalPages || 1);

      if (content.length > 0) {
        const stillExists = content.find(j => j.publicId === selectedJob?.publicId);
        if (!stillExists) setSelectedJob(content[0]);
      } else {
        setSelectedJob(null);
      }
    } catch (err) {
      if (!axios.isCancel(err)) console.error("Fetch failed:", err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, filters, selectedJob]);

  useEffect(() => {
    const handler = setTimeout(() => fetchJobs(), 300);
    return () => clearTimeout(handler);
  }, [fetchJobs]);

  const processedJobs = useMemo(() => {
    return [...jobs]; // Sorting is mostly handled by backend params.sort
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
        {/* Sidebar with all filters */}
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

            {/* CATEGORY FILTER - Now outside of other tags */}
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

        {/* Central List Area */}
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
                    <p>{!job.company || job.company === "N/A" ? "Direct Hire" : job.company} • {job.location}</p>
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

        {/* Detailed Pane */}
        <section className="mj-detail-pane">
          {selectedJob ? (
            <div className="mj-detail-scroll fade-in">
              <div className="mj-detail-top">
                <div className="mj-brand-header">
                   <div className="mj-company-avatar"><FaBuilding /></div>
                   <div className="mj-main-titles">
                      <span className="mj-category-tag">{selectedJob.jobType?.replace('_', ' ') || "N/A"}</span>
                      <h2>{selectedJob.title}</h2>
                      <h4>{!selectedJob.company || selectedJob.company === "N/A" ? "Company Confidential" : selectedJob.company}</h4>
                   </div>
                </div>
                
                <div className="mj-detail-actions">
                  {isOwner(selectedJob) ? (
                    <>
                      <button className="mj-btn-icon edit" title="Edit Job"><FaEdit /></button>
                      <button className="mj-btn-icon delete" title="Delete Job"><FaTrash /></button>
                    </>
                  ) : (
                    <div className="mj-view-only-badge"><FaLock /> Global View</div>
                  )}
                </div>
              </div>

              <div className="mj-analytics-grid">
                <div className="mj-analytic-card">
                   <span>Openings</span>
                   <h3>{selectedJob.openings || 1}</h3>
                </div>
                <div className="mj-analytic-card">
                   <span>Experience</span>
                   <h3>{selectedJob.experienceLevel || "Any"}</h3>
                </div>
                <div className="mj-analytic-card">
                   <span>Work Mode</span>
                   <h3>{selectedJob.workMode || "Onsite"}</h3>
                </div>
              </div>

              <div className="mj-section">
                <h5>Required Skills</h5>
                <div className="mj-pill-box">
                  {selectedJob.skillsRequired ? selectedJob.skillsRequired.split(',').map((s, idx) => (
                    <span key={idx} className="mj-skill-pill">{s.trim()}</span>
                  )) : <span className="mj-text-light">No skills listed</span>}
                </div>
              </div>

              <div className="mj-section">
                <h5>Job Intelligence</h5>
                <ul className="mj-intel-list">
                  <li><FaUserTie /> <strong>Recruiter:</strong> {selectedJob.recruiter?.name || "Independent"}</li>
                  <li><FaMapMarkerAlt /> <strong>Location:</strong> {selectedJob.location}</li>
                  <li><FaCalendarAlt /> <strong>Posted:</strong> {selectedJob.postedDate ? new Date(selectedJob.postedDate).toLocaleDateString() : "N/A"}</li>
                  <li><FaClock /> <strong>Deadline:</strong> {selectedJob.closingDate || "No Set Date"}</li>
                  <li><FaUserGraduate /> <strong>Education:</strong> {selectedJob.education || "Graduate"}</li>
                </ul>
              </div>

              <div className="mj-section">
                <h5>Job Description</h5>
                <p className="mj-description-text">
                    {selectedJob.description || `We are looking for a ${selectedJob.title} in ${selectedJob.location}.`}
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