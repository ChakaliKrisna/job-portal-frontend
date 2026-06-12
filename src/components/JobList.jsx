import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";
import AuthDrawer from "../pages/AuthDrawer";
import { 
  FaMapMarkerAlt, FaWallet, FaSearch, FaFilter, FaBriefcase, FaGraduationCap, 
  FaLayerGroup, FaBolt, FaBuilding, FaChevronLeft, FaChevronRight, 
  FaRegBookmark, FaBookmark, FaArrowRight, FaSort, FaExclamationCircle, 
  FaCheckCircle, FaUser, FaGlobe, FaCalendarAlt, FaEye, FaUsers
} from "react-icons/fa";
import "../components/Styles/joblist.css";

const API_BASE = "http://localhost:8080/job-portal";

const JobPortal = ({ 
  isHomePage = false, 
  internshipMode = false 
}) => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const debounceTimer = useRef(null);
  const [searchParams, setSearchParams] = useSearchParams(); 

  // --- STATE SYSTEM ---
  const [authMode, setAuthMode] = useState("login");
  const [isAuthDrawerOpen, setAuthDrawerOpen] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [savedJobIds, setSavedJobIds] = useState(new Set());
  const [selectedJob, setSelectedJob] = useState(null);
  const [similarJobs, setSimilarJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(0);

  // CRITICAL FIX: Pre-seed the jobType state if internshipMode is explicitly passed down
  const [filters, setFilters] = useState({
    keyword: searchParams.get("keyword") || "",
    location: searchParams.get("location") || "",
    category: searchParams.get("category") || "",
    jobType: internshipMode ? "INTERNSHIP" : (searchParams.get("jobType") || ""),
    workMode: searchParams.get("workMode") || "",
    experienceLevel: searchParams.get("experienceLevel") || "",
    minSalary: searchParams.get("minSalary") || "",
    jobStatus: "OPEN",
    sort: searchParams.get("sort") || "postedDate,desc",
    page: Number(searchParams.get("page")) || 0,
    size: isHomePage ? 6 : 10
  });

  // Watch for changes in the URL search params and sync active filters (Only for full Browse page)
  useEffect(() => {
    if (isHomePage) return;
    
    setFilters(prev => ({
      ...prev,
      keyword: searchParams.get("keyword") || "",
      location: searchParams.get("location") || "",
      category: searchParams.get("category") || "",
      jobType: internshipMode ? "INTERNSHIP" : (searchParams.get("jobType") || ""),
      workMode: searchParams.get("workMode") || "",
      experienceLevel: searchParams.get("experienceLevel") || "",
      minSalary: searchParams.get("minSalary") || "",
      sort: searchParams.get("sort") || "postedDate,desc",
      page: Number(searchParams.get("page")) || 0,
    }));
  }, [searchParams, isHomePage, internshipMode]);

  // Dynamic state synchronization back downstream inside URL search space parameters
  useEffect(() => {
    if (isHomePage) return;
    
    const cleanParams = {};
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== "" && value !== null && value !== undefined && value !== 0 && value !== "0") {
        cleanParams[key] = String(value);
      }
    });

    const activeJobId = searchParams.get("id");
    if (activeJobId) {
      cleanParams.id = activeJobId;
    }

    const currentParamsString = searchParams.toString();
    const newParamsString = new URLSearchParams(cleanParams).toString();
    
    if (currentParamsString !== newParamsString) {
      setSearchParams(cleanParams, { replace: true });
    }
  }, [filters, setSearchParams, isHomePage, searchParams]);
  
  // Fetch similar jobs
  const fetchSimilarJobs = useCallback(async (jobId) => {
    if (!jobId) return;
    try {
      const res = await axios.get(`${API_BASE}/jobs/${jobId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      setSimilarJobs(res.data || []);
    } catch (err) {
      console.error("Contextual lookup failure", err);
      setSimilarJobs([]);
    }
  }, [token]);

  // --- MAIN CORE API CONTENT STREAM ---
  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Clean query inputs completely before building request package
      const cleanParams = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== "" && v !== null)
      );

      // Force safety layer assignment
      if (internshipMode) {
        cleanParams.jobType = "INTERNSHIP";
      }

      const res = await axios.get(`${API_BASE}/jobs`, {
        params: cleanParams,
        headers: token ? { Authorization: `Bearer ${token}` } : {} 
      });

      const content = res.data?.content || [];
      setJobs(content);
      setTotalPages(res.data?.totalPages || 0);

      const jobIdFromUrl = searchParams.get("id");
      
      if (content.length > 0 && !isHomePage) {
        if (jobIdFromUrl) {
          const targetedJob = content.find(j => j.publicId === jobIdFromUrl);
          const activeSelection = targetedJob || content[0];
          setSelectedJob(activeSelection);
          trackRecentlyViewed(activeSelection);
        } else {
          setSelectedJob(content[0]);
          trackRecentlyViewed(content[0]);
          
          setSearchParams(prev => {
            const current = Object.fromEntries(prev.entries());
            return { ...current, id: content[0].publicId };
          }, { replace: true });
        }
      } else if (isHomePage) {
        setSelectedJob(null);
      }
    } catch (err) {
      console.error("Fetch lifecycle failure execution context:", err);
      setError(err.response?.status === 403 ? "Access Denied" : "Failed to load jobs.");
    } finally {
      setLoading(false);
    }
  }, [filters, token, isHomePage, internshipMode, searchParams, setSearchParams]);

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

  useEffect(() => {
    if (selectedJob?.publicId) {
      fetchSimilarJobs(selectedJob.publicId);
    }
  }, [selectedJob?.publicId, fetchSimilarJobs]);

  const toggleSave = async (e, jobId) => {
    e.stopPropagation();
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
    } catch (err) { console.error(err); }
  };

  const getDeadlineInfo = (closedDate) => {
    if (!closedDate) return null;
    const target = new Date(closedDate);
    const today = new Date();
    const diffTime = target - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { text: "Expired", class: "expired", percent: 100 };
    if (diffDays === 0) return { text: "Ends Today!", class: "urgent", percent: 95 };
    if (diffDays <= 3) return { text: `${diffDays} days left`, class: "urgent", percent: 85 };
    if (diffDays <= 7) return { text: `${diffDays} days left`, class: "warning", percent: 65 };
    return { text: `${diffDays} days left`, class: "upcoming", percent: 25 };
  };

  const trackRecentlyViewed = (job) => {
    if (!job || !job.publicId) return;
    try {
      const history = JSON.parse(localStorage.getItem("recentJobs") || "[]");
      const filtered = history.filter(item => item.publicId !== job.publicId);
      const trackingMeta = {
        publicId: job.publicId,
        title: job.title,
        companyName: job.company || job.companyName || "Anonymous Venture",
        location: job.location,
        companyLogo: job.companyLogo || null
      };
      const updated = [trackingMeta, ...filtered].slice(0, 5);
      localStorage.setItem("recentJobs", JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  // Debounce Engine
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
      jobType: internshipMode ? "INTERNSHIP" : "",
      workMode: "",
      experienceLevel: "",
      minSalary: "",
      jobStatus: "OPEN",
      sort: "postedDate,desc",
      page: 0,
      size: isHomePage ? 6 : 10
    });
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value, page: 0 }));
  };

  const handleJobSelection = (job) => {
    if (isHomePage) {
      if (internshipMode) {
        navigate(`/jobs?jobType=INTERNSHIP&id=${job.publicId}`);
      } else {
        navigate(`/jobs?id=${job.publicId}`);
      }
    } else {
      setSelectedJob(job);
      trackRecentlyViewed(job);
      setSearchParams(prev => {
        const current = Object.fromEntries(prev.entries());
        return { ...current, id: job.publicId };
      }, { replace: true });
    }
  };

  const formatSalary = (s) => s ? (s / 100000).toFixed(1) : "N/A";

  // Structural Architecture Fix #12: Strategic string parsers to break down giant generic blobs into cleanly rendered fragments
  const renderStructuredDescription = (text) => {
    if (!text) return null;
    
    // Check if the source text block contains embedded structural markdown configurations
    if (text.includes("Responsibilities:") || text.includes("Requirements:")) {
      const sections = text.split(/(?=Responsibilities:|Requirements:|About Role:|Benefits:)/gi);
      return sections.map((sec, idx) => {
        const cleanSec = sec.trim();
        if (cleanSec.toLowerCase().startsWith("responsibilities:")) {
          return (
            <div key={idx} className="desc-block-segment">
              <h4>Responsibilities</h4>
              <p>{cleanSec.replace(/Responsibilities:/i, "").trim()}</p>
            </div>
          );
        }
        if (cleanSec.toLowerCase().startsWith("requirements:")) {
          return (
            <div key={idx} className="desc-block-segment">
              <h4>Requirements</h4>
              <p>{cleanSec.replace(/Requirements:/i, "").trim()}</p>
            </div>
          );
        }
        return <p key={idx} className="desc-paragraph">{cleanSec}</p>;
      });
    }

    // Default processing rules fallback strategy
    return text.split("\n\n").map((para, i) => (
      <p key={i} className="desc-paragraph">{para.trim()}</p>
    ));
  };

  const EmptyState = () => (
    <div className="empty-state">
      <FaSearch size={40} />
      <p>No jobs matching your explicit filter variables found.</p>
    </div>
  );

  // --- 🏠 RENDER MODULE: FEATURED HOVER TILES HOME AREA ---
  if (isHomePage) {
    return (
      <section className="home-featured-section">
        <div className="section-header">
          <div className="title-stack">
            <h2>Trending <span className="highlight">Opportunities</span></h2>
            <p>Handpicked roles from top-tier enterprise companies</p>
          </div>
          <button className="view-all-btn" onClick={() => navigate("/jobs")}>
            Explore All Roles <FaArrowRight />
          </button>
        </div>

        <div className="home-jobs-grid">
          {loading ? (
            [1, 2, 3, 4, 5, 6].map(i => <div key={i} className="skeleton-card" />)
          ) : error ? (
            <div className="error-card">{error}</div>
          ) : jobs.length === 0 ? (
            <EmptyState />
          ) : (
            jobs.map(job => {
              // Major Architecture Fix #3: Standardize mapping validation variables across environments
              const mappedCompany = job.company || job.companyName || "Enterprise Partner";
              return (
                <div key={job.publicId} className="modern-job-card" onClick={() => {
                  navigate(`/jobs?id=${job.publicId}`);
                }}>
                  <div className="card-badge">{job.jobType?.replace('_', ' ')}</div>
                  <div className="card-body">
                    {/* Major Architecture Fix #4: Corporate verification lookup modules layout rendering */}
                    {job.companyLogo ? (
                      <img src={job.companyLogo} alt="" className="company-logo-img-sm" onError={(e) => { e.target.style.display = 'none'; }} />
                    ) : (
                      <div className="company-logo-sm">{mappedCompany.charAt(0)}</div>
                    )}
                    <h4>{job.title}</h4>
                    <p className="company-name">{mappedCompany}</p>
                    <div className="card-meta">
                       <span><FaMapMarkerAlt /> {job.location}</span>
                       <span><FaWallet /> ₹{formatSalary(job.salary)}LPA</span>
                    </div>
                  </div>
                  <div className="card-footer">
                    <span className="mode-pill">{job.workMode}</span>
                    <button onClick={(e) => toggleSave(e, job.publicId)} className="save-icon-btn">
                       {savedJobIds.has(job.publicId) ? <FaBookmark color="#4f46e5"/> : <FaRegBookmark />}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    );
  }
  {isHomePage ? (
        /* --- 🏠 HOMEPAGE VIEW --- */
        <section className="home-featured-section">
          <div className="section-header">
            <div className="title-stack">
              <h2>Trending <span className="highlight">Opportunities</span></h2>
              <p>Handpicked roles from top-tier enterprise companies</p>
            </div>
            <button className="view-all-btn" onClick={() => navigate("/jobs")}>
              Explore All Roles <FaArrowRight />
            </button>
          </div>

          <div className="home-jobs-grid">
            {loading ? (
              [1, 2, 3, 4, 5, 6].map(i => <div key={i} className="skeleton-card" />)
            ) : error ? (
              <div className="error-card">{error}</div>
            ) : jobs.length === 0 ? (
              <EmptyState />
            ) : (
              jobs.map(job => {
                const mappedCompany = job.company || job.companyName || "Enterprise Partner";
                return (
                  <div key={job.publicId} className="modern-job-card" onClick={() => navigate(`/jobs?id=${job.publicId}`)}>
                    <div className="card-badge">{job.jobType?.replace('_', ' ')}</div>
                    <div className="card-body">
                      {job.companyLogo ? (
                        <img src={job.companyLogo} alt="" className="company-logo-img-sm" onError={(e) => { e.target.style.display = 'none'; }} />
                      ) : (
                        <div className="company-logo-sm">{mappedCompany.charAt(0)}</div>
                      )}
                      <h4>{job.title}</h4>
                      <p className="company-name">{mappedCompany}</p>
                      <div className="card-meta">
                         <span><FaMapMarkerAlt /> {job.location}</span>
                         <span><FaWallet /> ₹{formatSalary(job.salary)}LPA</span>
                      </div>
                    </div>
                    <div className="card-footer">
                      <span className="mode-pill">{job.workMode}</span>
                      <button onClick={(e) => toggleSave(e, job.publicId)} className="save-icon-btn">
                         {savedJobIds.has(job.publicId) ? <FaBookmark color="#4f46e5"/> : <FaRegBookmark />}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      ) : (
        /* --- 💼 MAIN PORTAL/RECRUITER SPLIT VIEW (When isHomePage is false) --- */
        <>
          <div className="portal-results-meta-strip">
            <div className="meta-left-count">
              <h3>{loading ? "Scanning..." : `${jobs.length} Active Positions Uncovered`}</h3>
              <p>Filtered matrix matches mapped matching rules parameters</p>
            </div>
            <div className="meta-right-sorting">
              <div className="sort-input-combo">
                <FaSort className="sort-trigger-icon" />
                <select name="sort" value={filters.sort} onChange={handleFilterChange} className="premium-sort-select">
                  <option value="postedDate,desc">Sort by: Newest Releases</option>
                  <option value="salary,desc">Sort by: Highest Compensation</option>
                  <option value="openings,desc">Sort by: Target Capacity Volume</option>
                </select>
              </div>
            </div>
          </div>

          <div className="portal-content-grid">
            <aside className="portal-filters-sidebar premium-theme">
              {/* ... Paste your Left-hand Sidebar filter options here ... */}
            </aside>

            <main className="portal-main-view">
              <div className="jobs-split-view">
                {/* ... Paste your Left Data Column Card feed list here ... */}
                {/* ... Paste your Right Data Column Detail parsing workspace here ... */}
              </div>
            </main>
          </div>
        </>
      )}

  // --- 💼 RENDER MODULE: COMPREHENSIVE SPLIT RECRUITER DESKTOP ENVIRONMENT ---
  return (
    <div className="full-portal-layout">
      
      {/* Search Architecture Header Grid Layout */}
      <div className="top-search-section premium-search-hub">
        <div className="search-container">
          <div className="search-glass-wrapper">
            <div className="search-input-group">
              <div className="input-icon-circle"><FaSearch className="search-icon" /></div>
              <div className="input-stack">
                <label>What</label>
                <input 
                  name="keyword" 
                  placeholder="Role, Skill, Keyword, or Corporate Group" 
                  value={filters.keyword} 
                  onChange={handleFilterChange} 
                />
              </div>
            </div>

            <div className="search-divider"></div>

            <div className="search-input-group">
              <div className="input-icon-circle"><FaMapMarkerAlt className="loc-icon" /></div>
              <div className="input-stack">
                <label>Where</label>
                <input 
                  name="location" 
                  placeholder="City, State, Country, or Remote" 
                  value={filters.location} 
                  onChange={handleFilterChange} 
                />
              </div>
            </div>

            <button className="pro-search-btn" onClick={fetchJobs}>
              <span>Search Database</span>
              <div className="btn-glow"></div>
            </button>
          </div>

          <div className="quick-suggest-tags">
            <span className="suggest-label">Trending Tracks:</span>
            {['Java Full Stack', 'Spring Boot', 'Remote', 'React Native'].map(tag => (
              <button key={tag} className="tag-pill" onClick={() => handleFilterChange({target: {name: 'keyword', value: tag}})}>
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Corporate Meta Information Row Header Block */}
      <div className="portal-results-meta-strip">
        {/* Major Architecture Fix #5: Dynamic search tracking labels layout panel counter */}
        <div className="meta-left-count">
          <h3>{loading ? "Scanning..." : `${jobs.length} Active Positions Uncovered`}</h3>
          <p>Filtered matrix matches mapped matching rules parameters</p>
        </div>
        
        {/* Major Architecture Fix #6: Recruiter Sort Controller Field Dropdown Menu */}
        <div className="meta-right-sorting">
          <div className="sort-input-combo">
            <FaSort className="sort-trigger-icon" />
            <select name="sort" value={filters.sort} onChange={handleFilterChange} className="premium-sort-select">
              <option value="postedDate,desc">Sort by: Newest Releases</option>
              <option value="salary,desc">Sort by: Highest Compensation</option>
              <option value="openings,desc">Sort by: Target Capacity Volume</option>
            </select>
          </div>
        </div>
      </div>

      {/* Core Platform Workspaces Interaction Grid Rails */}
      <div className="portal-content-grid">
        
        {/* Left Hand Sidebar Precision Controls Panel Container Area */}
        <aside className="portal-filters-sidebar premium-theme">
          <div className="filter-header-main">
            <div>
              <h3>Precision Filters</h3>
              <p>Refine your career match matrix</p>
            </div>
            <button className="glass-reset" onClick={handleReset}>Clear All</button>
          </div>

          <div className="neo-filter-group">
            <div className="neo-label">Industry Vertical</div>
            <div className="custom-select-wrapper">
               <select name="category" value={filters.category} onChange={handleFilterChange}>
                 <option value="">All Functional Spaces</option>
                 <option value="SOFTWARE_DEVELOPMENT">Software Engineering</option>
                 <option value="DATA_SCIENCE">Data Infrastructure & AI</option>
                 <option value="DEVOPS">DevOps & Cloud Systems</option>
                 <option value="CYBER_SECURITY">Information Security</option>
                 <option value="QA_TESTING">QA Automated Testing</option>
                 <option value="UI_UX">Product Design & Experience</option>
                 <option value="MANAGEMENT">Product Leadership</option>
                 <option value="BUSINESS_ANALYST">Business Systems Intelligence</option>
                 <option value="FINANCE">Corporate Finance</option>
                 <option value="MARKETING">Growth Marketing</option>
                 <option value="HUMAN_RESOURCES">Talent Acquisition Infrastructure</option>
               </select>
            </div>
          </div>

          <div className="neo-filter-group">
            <div className="neo-label">Operational Infrastructure</div>
            <div className="segmented-control">
              {['ONSITE', 'REMOTE', 'HYBRID'].map(mode => (
                <button 
                  key={mode}
                  className={filters.workMode === mode ? 'active' : ''}
                  onClick={() => setFilters(prev => ({...prev, workMode: prev.workMode === mode ? "" : mode, page: 0}))}
                >
                  {mode.charAt(0) + mode.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="neo-filter-group">
            <div className="neo-label">Minimum Salary Threshold</div>
            <div className="salary-bar-container">
              <div className="salary-value">₹ {filters.minSalary || 0} <span>LPA Floor</span></div>
              <input 
                type="range" 
                min="0" 
                max="60" 
                step="1"
                name="minSalary"
                value={filters.minSalary || 0}
                onChange={handleFilterChange}
                className="neo-range-slider"
              />
              <div className="range-labels">
                <span>Entry (0L)</span>
                <span>Mid (30L)</span>
                <span>Executive (60L+)</span>
              </div>
            </div>
          </div>

          <div className="neo-filter-group">
            <div className="neo-label">Seniority Alignment Spectrum</div>
            <div className="bento-grid-filters">
              {['FRESHER', 'INTERMEDIATE', 'SENIOR'].map(lvl => (
                <div 
                  key={lvl}
                  className={`bento-item ${filters.experienceLevel === lvl ? 'active' : ''}`}
                  onClick={() => setFilters(prev => ({...prev, experienceLevel: prev.experienceLevel === lvl ? "" : lvl, page: 0}))}
                >
                  {lvl === 'INTERMEDIATE' ? 'Mid Level' : lvl.charAt(0) + lvl.slice(1).toLowerCase()}
                </div>
              ))}
            </div>
          </div>

          <div className="toggle-list">
            <label className="switch-wrapper">
              <input 
                type="checkbox" 
                checked={filters.jobStatus === 'OPEN'} 
                onChange={() => setFilters(prev => ({...prev, jobStatus: prev.jobStatus === 'OPEN' ? 'CLOSED' : 'OPEN', page: 0}))}
              />
              <span className="switch-slider"></span>
              <span className="switch-text">Exclude Expired / Closed Posts</span>
            </label>
          </div>
        </aside>

        {/* Center Main Workspace Segment Split Component Controller Row */}
        <main className="portal-main-view">
          <div className="jobs-split-view">
            
            {/* Left Data Column Stream: Card Feed Listing System */}
            <div className="job-cards-list">
              {loading ? (
                [1, 2, 3, 4].map(i => <div key={i} className="list-skeleton-loader-card" />)
              ) : jobs.length === 0 ? (
                <EmptyState />
              ) : (
                jobs.map(job => {
                  const currentCompanyTitle = job.company || job.companyName || "Partner Enterprise";
                  return (
                    <div 
                      key={job.publicId} 
                      className={`job-item-card ${selectedJob?.publicId === job.publicId ? 'active' : ''}`}
                      onClick={() => handleJobSelection(job)}
                    >
                      <div className="card-main-flex-group">
                        {job.companyLogo ? (
                          <img src={job.companyLogo} alt="" className="list-card-logo-avatar" onError={(e) => { e.target.style.display = 'none'; }} />
                        ) : (
                          <div className="list-card-fallback-avatar">{currentCompanyTitle.charAt(0)}</div>
                        )}
                        <div className="list-card-textual-payload">
                          <h4>{job.title}</h4>
                          <p className="list-card-company-tag">{currentCompanyTitle}</p>
                          <div className="card-tags">
                            <span className="pill-tag-geo">{job.location}</span>
                            <span className="pill-tag-structure">{job.workMode}</span>
                            <span className="pill-tag-monetary">₹{formatSalary(job.salary)}LPA</span>
                          </div>
                        </div>
                      </div>
                      <button onClick={(e) => toggleSave(e, job.publicId)} className="save-btn-small">
                        {savedJobIds.has(job.publicId) ? <FaBookmark color="#4f46e5"/> : <FaRegBookmark />}
                      </button>
                    </div>
                  );
                })
              )}

              {/* Data Pagination Foot Controls Module Row */}
              {totalPages > 1 && (
                <div className="pagination-footer">
                  <button disabled={filters.page === 0} onClick={() => setFilters(f => ({...f, page: f.page - 1}))}><FaChevronLeft /></button>
                  <span>Metrics Interval Section: Page {filters.page + 1} of {totalPages}</span>
                  <button disabled={filters.page >= totalPages - 1} onClick={() => setFilters(f => ({...f, page: f.page + 1}))}><FaChevronRight /></button>
                </div>
              )}
            </div>

            {/* Right Data Column Viewport: Enterprise Detail Parsing Workspace Area */}
            <div className="job-details-pane">
              {loading || detailsLoading ? (
                /* Major Architecture Fix #14: Professional Details Workspace Skeleton Container Block Markup */
                <div className="details-pane-skeleton-wrapper">
                  <div className="skeleton-avatar-row-combo">
                    <div className="skeleton-circle-avatar" />
                    <div className="skeleton-textual-lines-stack">
                      <div className="skeleton-line-node header-main" />
                      <div className="skeleton-line-node sub-tag-line" />
                    </div>
                  </div>
                  <div className="skeleton-buttons-block-row" />
                  <div className="skeleton-cards-grid-layout" />
                  <div className="skeleton-long-form-text-block-line" />
                </div>
              ) : selectedJob ? (
                <div className="details-card animate-slide-up">
                  
                  {/* Workspace Detailed Title Subheader Segment Title Layout Area */}
                  <div className="details-header">
                    {selectedJob.companyLogo ? (
                      <img src={selectedJob.companyLogo} alt="" className="details-view-logo-large" onError={(e) => { e.target.style.display = 'none'; }} />
                    ) : (
                      <div className="company-logo-large">{(selectedJob.company || selectedJob.companyName || "E").charAt(0)}</div>
                    )}
                    <div className="header-text">
                      <div className="title-row">
                        <h2>{selectedJob.title}</h2>
                        {selectedJob.closedDate && (
                          <div className="urgency-timeline-metric-wrapper">
                            <span className={`deadline-tag ${getDeadlineInfo(selectedJob.closedDate).class}`}>
                              <FaBolt /> {getDeadlineInfo(selectedJob.closedDate).text}
                            </span>
                          </div>
                        )}
                      </div>
                      <p className="detail-subtitle">
                        <FaBuilding /> <span className="interactive-text-link" onClick={() => navigate(`/company/${selectedJob.companyPublicId || 'unknown'}`)}>{selectedJob.company || selectedJob.companyName}</span> • <FaMapMarkerAlt /> {selectedJob.location}
                      </p>
                    </div>
                  </div>

                  {/* Structural Urgency Linear Countdown Indicator Strip Widget Layer */}
                  {selectedJob.closedDate && (
                    <div className="urgency-progress-rail-container">
                      <div className="urgency-label-row">
                        <span>Application Window Closes Soon</span>
                        <strong>{getDeadlineInfo(selectedJob.closedDate).text}</strong>
                      </div>
                      <div className="urgency-track-line-bg">
                        <div 
                          className={`urgency-fill-line-progress ${getDeadlineInfo(selectedJob.closedDate).class}`}
                          style={{ width: `${getDeadlineInfo(selectedJob.closedDate).percent}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Operational Interactive Call to Actions Master Toolbar Controls Matrix Container Row Area */}
                  <div className="action-bar">
                    {/* Major Architecture Fix #7: Contextual Applied State Resolution Indicators Panel Button Block */}
                    {selectedJob.isApplied ? (
                      <button className="apply-now-btn applied-lockout-disabled" disabled>
                        Application Submitted <FaCheckCircle />
                      </button>
                    ) : (
                      <button 
                        className="apply-now-btn" 
                        onClick={() => {
                          if (!token) {
                            setAuthMode("login");
                            setAuthDrawerOpen(true);
                          } else {
                            navigate(`/apply/${selectedJob.publicId}`);
                          }
                        }}
                      >
                        Apply Now <FaArrowRight />
                      </button>
                    )}

                    <button 
                      className="view-full-details-btn"
                      onClick={() => navigate(`/job/${selectedJob.publicId}`)}
                    >
                      <FaEye /> Full View Page
                    </button>
                    
                    <button className="save-large-btn" onClick={(e) => toggleSave(e, selectedJob.publicId)}>
                      {savedJobIds.has(selectedJob.publicId) ? <FaBookmark color="#4f46e5" /> : <FaRegBookmark />}
                    </button>
                  </div>  

                  {/* Scrolling Inner Body Payload Workspace Area Viewport Section Layout */}
                  <div className="details-scroll-area">
                    
                    {/* Operational Core Structural Data Parameters Grid Matrix Layout Block Area */}
                    <div className="overview-grid">
                      <div className="ov-item">
                        <FaWallet className="ov-icon" />
                        <div className="ov-info"><label>Target Compensation</label><span>₹ {formatSalary(selectedJob.salary)} LPA Floor</span></div>
                      </div>
                      <div className="ov-item">
                        <FaBriefcase className="ov-icon" />
                        <div className="ov-info"><label>Operational Model</label><span>{selectedJob.jobType?.replace('_', ' ')}</span></div>
                      </div>
                      <div className="ov-item">
                        <FaLayerGroup className="ov-icon" />
                        <div className="ov-info"><label>Target Intake Bandwidth</label><span>{selectedJob.openings || 1} Open Slots</span></div>
                      </div>
                      <div className="ov-item">
                        <FaCheckCircle className="ov-icon" />
                        <div className="ov-info"><label>Required Background</label><span>{selectedJob.experienceLevel?.replace('_', ' ')} Target</span></div>
                      </div>
                    </div>

                    <div className="details-body">
                      
                      {/* Functional Technology Requirements Tags Strip Area Section Container Row Block */}
                      <h3 className="section-title">Required Competencies Cluster</h3>
                      <div className="skills-container">
                        {selectedJob.skillsRequired?.map(skill => (
                          <span key={skill} className="skill-pill">{skill.trim()}</span>
                        ))}
                      </div>

                      {/* Deep Segmented Structural Parsing Core Document Text Stream Viewport Wrapper Component */}
                      <h3 className="section-title">Functional Role Manifest</h3>
                      <div className="full-description-structured-markdown-view">
                        {renderStructuredDescription(selectedJob.description)}
                      </div>

                      {/* Major Architecture Fix #9: Isolated Corporate Entity Profiler Identity Card Grid Row Widget Wrapper */}
                      <div className="premium-corporate-profile-identity-card-widget">
                        <div className="identity-widget-header-row">
                          <FaBuilding className="identity-building-back-icon" />
                          <div className="identity-textual-block">
                            <h4>{selectedJob.company || selectedJob.companyName || "Enterprise Venture Hub"}</h4>
                            <p>{selectedJob.location || "Global Operations Base"}</p>
                          </div>
                        </div>
                        <div className="identity-widget-metadata-horizontal-strip">
                          <div className="strip-cell-element">
                            <label>Applications Traffic</label>
                            <span>{selectedJob.applicationsCount || "Moderate"} submittals</span>
                          </div>
                          <div className="strip-cell-element">
                            <label>Telemetry Views</label>
                            <span>{selectedJob.views || "120+"} interactive cycles</span>
                          </div>
                        </div>
                        {selectedJob.companyWebsite && (
                          <a href={selectedJob.companyWebsite} target="_blank" rel="noreferrer" className="identity-external-action-anchor-btn">
                            <FaGlobe /> Visit Corporate Gateway Domain
                          </a>
                        )}
                      </div>

                      {/* Major Architecture Fix #10: Contextual Vector Target Matches Lateral Matrix Recommendations Panel Area Carousel Block */}
                      {similarJobs.length > 0 && (
                        <div className="linkedin-style-similar-jobs-recommendation-engine-panel">
                          <h3 className="section-title">Similar Recommended Postings For You</h3>
                          <div className="recommendations-vertical-stack">
                            {similarJobs.map(sj => (
                              <div key={sj.publicId} className="mini-recommendation-node-card" onClick={() => handleJobSelection(sj)}>
                                <div className="recommendation-flex-group">
                                  <div className="recommendation-avatar-box-icon">{sj.title?.charAt(0)}</div>
                                  <div className="recommendation-textual-payload">
                                    <h5>{sj.title}</h5>
                                    <p>{sj.company || sj.companyName} • {sj.location}</p>
                                    <span className="recommendation-salary-pill">₹{formatSalary(sj.salary)}LPA</span>
                                  </div>
                                </div>
                                <FaChevronRight className="recommendation-arrow-action-trigger" />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Recruiter Communication Assignment Panel Section Container Layout Area */}
                      <div className="recruiter-mini-card">
                        <h3 className="section-title">Assigned Talent Acquisition Node</h3>
                        <div className="recruiter-info">
                          <div className="avatar-sm"><FaUser /></div>
                          <div>
                            <strong>{selectedJob.recruiter?.name || "Corporate Resource Desk"}</strong>
                            <p>{selectedJob.recruiter?.email || "acquisition-desk@enterprise.domain"}</p>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              ) : (
                <div className="empty-details">
                  <FaBuilding size={48} className="empty-icon-pulse" />
                  <h4>Select a posting file row item node out of the active registry database stack list feed framework to inspect comprehensive functional parameters.</h4>
                </div>
              )}
            </div>

          </div>
        </main>
      </div>
      

      <AuthDrawer 
        isOpen={isAuthDrawerOpen} 
        onClose={() => setAuthDrawerOpen(false)} 
        initialMode={authMode} 
      />
    </div>
  );
};

export default JobPortal;