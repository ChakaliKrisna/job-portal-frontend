import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import {
  FaBell,
  FaUserCircle,
  FaBars,
  FaTimes,
  FaSignOutAlt,
  FaSearch,
  FaBriefcase,
  FaBuilding,
  FaMapMarkerAlt,
  FaChevronDown
} from "react-icons/fa";
import AuthDrawer from "../pages/AuthDrawer";
import "./Styles/navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isMobile, setIsMobile] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [searchQuery, setSearchQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const [showProfile, setShowProfile] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null); 

  const [user, setUser] = useState({
    isLoggedIn: false,
    name: "",
    role: ""
  });

  // Sync Auth State
  useEffect(() => {
    const token = localStorage.getItem("token");
    setUser({
      isLoggedIn: !!token,
      name: localStorage.getItem("userName") || "User",
      role: localStorage.getItem("userRole") || "STUDENT"
    });
  }, [isAuthOpen]);

  // Read URL search parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSearchQuery(params.get("keyword") || "");
    setLocationQuery(params.get("location") || "");
  }, [location.search]);

  // Notification Engine 
  useEffect(() => {
    if (user.isLoggedIn && user.role === "STUDENT") {
      const token = localStorage.getItem("token");
      axios
        .get("https://job-portal-backend-365l.onrender.com/job-portal/notifications", {
          headers: { Authorization: `Bearer ${token}` }
        })
        .then((res) => setNotifications(res.data))
        .catch((err) => console.error("Error fetching notifications:", err));
    }
  }, [user.isLoggedIn, user.role]);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.append("keyword", searchQuery.trim());
    if (locationQuery.trim()) params.append("location", locationQuery.trim());
    navigate(`/jobs?${params.toString()}`);
    setIsMobile(false);
  };

  const handleLogout = () => {
    localStorage.clear();
    setUser({ isLoggedIn: false, name: "", role: "" });
    navigate("/");
    window.location.reload();
  };

  const toggleDropdown = (menuName) => {
    setActiveDropdown(activeDropdown === menuName ? null : menuName);
  };

  return (
    <>
      <nav className="glass-nav">
        <div className="nav-container-fluid">
          
          {/* BRAND LOGO - TRANSFORMED WITH CUSTOM VECTOR LOGO AND TEXT */}
         <div className="brand-wrapper">
  <Link to="/" className="brand-modern" onClick={() => setIsMobile(false)}>
<div className="logo-vector-mark">
  <svg 
    viewBox="0 0 100 100" 
    className="vector-svg-logo" 
    xmlns="http://www.w3.org/2000/svg"
    style={{ width: '100%', height: '100%', overflow: 'visible' }}
  >
    <defs>
      {/* Aurora Mesh Gradient - Deep Velvet to High-Ignition Lime & Cyan */}
      <linearGradient id="chronoPrimary" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#a855f7" />   {/* Royal Amethyst */}
        <stop offset="40%" stopColor="#3b82f6" />  {/* Hyper Blue */}
        <stop offset="80%" stopColor="#06b6d4" />  {/* Cyber Cyan */}
        <stop offset="100%" stopColor="#10b981" /> {/* Electric Emerald */}
      </linearGradient>

      {/* Shadow Hull Gradient for structural depth */}
      <linearGradient id="chronoDark" x1="100%" y1="100%" x2="0%" y2="0%">
        <stop offset="0%" stopColor="#0f172a" />
        <stop offset="100%" stopColor="#1e293b" />
      </linearGradient>

      {/* Advanced Layered Studio Glow */}
      <filter id="chronoGlow" x="-30%" y="-30%" width="160%" height="160%">
        <feDropShadow dx="0" dy="14" stdDeviation="10" floodColor="#3b82f6" floodOpacity="0.25"/>
        <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#10b981" floodOpacity="0.18"/>
      </filter>
    </defs>

    {/* Master Composition Wrapper */}
    <g filter="url(#chronoGlow)">
      
      {/* 1. MICRO-PRECISION RADAR CIRCLE (Subtle architectural background element) */}
      <circle 
        cx="50" 
        cy="50" 
        r="38" 
        fill="none" 
        stroke="url(#chronoPrimary)" 
        strokeWidth="1" 
        strokeDasharray="3 6" 
        opacity="0.18" 
      />

      {/* 2. THE RECURVE BOW HULL (Solid structural back-plate forming the 'C') */}
      <path
        d="M 68 22 
           C 36 12, 14 30, 14 50 
           C 14 70, 36 88, 68 78
           C 52 74, 28 66, 28 50
           C 28 34, 52 26, 68 22 Z"
        fill="url(#chronoDark)"
      />

      {/* 3. PRECISION TICKS (Instrument markings on the bow hull for tactical tech feel) */}
      <line x1="14" y1="50" x2="20" y2="50" stroke="#ffffff" strokeWidth="1.5" opacity="0.3" />
      <line x1="41" y1="17" x2="43" y2="23" stroke="#ffffff" strokeWidth="1" opacity="0.2" />
      <line x1="41" y1="83" x2="43" y2="77" stroke="#ffffff" strokeWidth="1" opacity="0.2" />

      {/* 4. THE INFINITY KINETIC FLIGHT RIBBON (Weaves the 'S' track into pure vector acceleration) */}
      <path
        d="M 28 72 
           C 20 54, 40 48, 50 40
           L 76 14"
        fill="none"
        stroke="url(#chronoPrimary)"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* 5. MULTI-FACETED TARGET ARROWHEAD (Aerodynamic stealth-blade segmentation) */}
      {/* Core Driving Wedge */}
      <path
        d="M 76 14 
           L 48 24 
           L 58 34 
           Z"
        fill="url(#chronoPrimary)"
      />
      {/* High-Contrast Split Wing */}
      <path
        d="M 76 14 
           L 58 34 
           L 68 44 
           Z"
        fill="#10b981"
        opacity="0.85"
      />

      {/* 6. GLASSMORPHIC EDGE HIGHLIGHT (Simulated light reflection along the main speed line) */}
      <path
        d="M 32 70 C 26 58, 38 52, 46 44 L 70 20"
        fill="none"
        stroke="#ffffff"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.4"
      />

      {/* 7. THE INTERSECTION POINT (Pure white focal ignition node) */}
      <circle 
        cx="76" 
        cy="14" 
        r="3" 
        fill="#ffffff" 
        style={{ filter: 'drop-shadow(0px 0px 6px #10b981)' }}
      />
      
    </g>
  </svg>
</div>
    <div className="brand-text-group">
      <span className="brand-name-main">Career<span className="brand-name-sub">Setu</span></span>
      <span className="brand-tagline">Where Talent Meets Opportunity</span>
    </div>
  </Link>
</div>
          {/* INTEGRATED SEARCH BAR */}
          <form className="modern-search-composite" onSubmit={handleSearch}>
            <div className="search-segment">
              <FaSearch className="segment-icon search-focus-icon" />
              <input
                type="text"
                placeholder="Job title, skills, company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="segment-divider"></div>
            <div className="search-segment">
              <FaMapMarkerAlt className="segment-icon location-focus-icon" />
              <input
                type="text"
                placeholder="City or 'Remote'..."
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
              />
            </div>
            <button type="submit" className="modern-search-action-btn" aria-label="Execute Search">
              <FaSearch />
            </button>
          </form>

          {/* NAVIGATION LINKS */}
         {/* NAVIGATION LINKS */}
<ul className={`modern-menu-links ${isMobile ? "mobile-open" : "desktop-view"}`}>
  
  {/* JOBS DROP-DOWN */}
  <li className={`has-mega-dropdown ${activeDropdown === "jobs" ? "forced-open" : ""}`}>
    <span className="modern-nav-trigger cursor-pointer flex items-center justify-between" onClick={() => toggleDropdown("jobs")}>
      Find Jobs <FaChevronDown className="chevron-transition ml-1" />
    </span>
    
    {/* MEGA PANEL - Contextual toggle for mobile views */}
    <div className={`premium-mega-panel ${activeDropdown === "jobs" ? "mobile-visible" : "mobile-hidden"}`}>
      <div className="mega-grid">
        <div className="mega-column">
          <h6 className="column-title">By Domain / Category</h6>
          <Link to="/jobs?jobType=FULL_TIME&category=SOFTWARE_DEVELOPMENT" onClick={() => setIsMobile(false)}>Software Development</Link>
          <Link to="/jobs?jobType=FULL_TIME&category=DATA_SCIENCE" onClick={() => setIsMobile(false)}>Data Science & AI</Link>
          <Link to="/jobs?jobType=FULL_TIME&category=DEVOPS" onClick={() => setIsMobile(false)}>DevOps Engineering</Link>
          <Link to="/jobs?jobType=FULL_TIME&category=CYBER_SECURITY" onClick={() => setIsMobile(false)}>Cyber Security</Link>
          <Link to="/jobs?jobType=FULL_TIME&category=UI_UX" onClick={() => setIsMobile(false)}>UI/UX Design</Link>
        </div>
        <div className="mega-column">
          <h6 className="column-title">By Work Mode</h6>
          <Link to="/jobs?jobType=FULL_TIME&workMode=REMOTE" onClick={() => setIsMobile(false)} className="highlight-link">💥 Remote Jobs</Link>
          <Link to="/jobs?jobType=FULL_TIME&workMode=HYBRID" onClick={() => setIsMobile(false)}>Hybrid Work</Link>
          <Link to="/jobs?jobType=FULL_TIME&workMode=ONSITE" onClick={() => setIsMobile(false)}>Onsite / Office</Link>
        </div>
        <div className="mega-column">
          <h6 className="column-title">Business Roles</h6>
          <Link to="/jobs?jobType=FULL_TIME&category=MANAGEMENT" onClick={() => setIsMobile(false)}>Management</Link>
          <Link to="/jobs?jobType=FULL_TIME&category=MARKETING" onClick={() => setIsMobile(false)}>Digital Marketing</Link>
          <Link to="/jobs?jobType=FULL_TIME&category=FINANCE" onClick={() => setIsMobile(false)}>Finance & Accounts</Link>
          <Link to="/jobs?jobType=FULL_TIME&category=HUMAN_RESOURCES" onClick={() => setIsMobile(false)}>Human Resources</Link>
        </div>
      </div>
    </div>
  </li>

  {/* INTERNSHIPS DROP-DOWN */}
  <li className={`has-mega-dropdown ${activeDropdown === "internships" ? "forced-open" : ""}`}>
    <span className="modern-nav-trigger cursor-pointer flex items-center justify-between" onClick={() => toggleDropdown("internships")}>
      Internships <FaChevronDown className="chevron-transition ml-1" />
    </span>
    
    <div className={`premium-mega-panel ${activeDropdown === "internships" ? "mobile-visible" : "mobile-hidden"}`}>
      <div className="mega-grid">
        <div className="mega-column">
          <h6 className="column-title">Tech Tracks</h6>
          <Link to="/jobs?jobType=INTERNSHIP&category=SOFTWARE_DEVELOPMENT" onClick={() => setIsMobile(false)}>Web Development</Link>
          <Link to="/jobs?jobType=INTERNSHIP&category=DATA_SCIENCE" onClick={() => setIsMobile(false)}>Data Analytics</Link>
          <Link to="/jobs?jobType=INTERNSHIP&category=UI_UX" onClick={() => setIsMobile(false)}>Product Design</Link>
          <Link to="/jobs?jobType=INTERNSHIP&category=QA_TESTING" onClick={() => setIsMobile(false)}>QA & Testing</Link>
        </div>
        <div className="mega-column">
          <h6 className="column-title">Non-Tech Tracks</h6>
          <Link to="/jobs?jobType=INTERNSHIP&category=MARKETING" onClick={() => setIsMobile(false)}>Content Writing</Link>
          <Link to="/jobs?jobType=INTERNSHIP&category=SALES" onClick={() => setIsMobile(false)}>Business Development</Link>
          <Link to="/jobs?jobType=INTERNSHIP&category=DIGITAL_MARKETING" onClick={() => setIsMobile(false)}>Social Media Growth</Link>
        </div>
        <div className="mega-column">
          <h6 className="column-title">Preferences</h6>
          <Link to="/jobs?jobType=INTERNSHIP&workMode=REMOTE" onClick={() => setIsMobile(false)}>Work From Home (WFH)</Link>
          <Link to="/jobs?jobType=INTERNSHIP&workMode=PART_TIME" onClick={() => setIsMobile(false)}>Part-Time Allowed</Link>
        </div>
      </div>
    </div>
  </li>

  <li><Link to="/companies" className="modern-nav-trigger" onClick={() => setIsMobile(false)}>Companies</Link></li>
  <li><Link to="/courses" className="modern-nav-trigger" onClick={() => setIsMobile(false)}>Courses</Link></li>
</ul>

          {/* RIGHT UTILITY HUB */}
          <div className="utility-action-hub">
            {user.isLoggedIn ? (
              <div className="auth-user-dashboard-controls">
                {/* NOTIFICATIONS */}
                {user.role === "STUDENT" && (
                  <div 
                    className="wrapper-relative-notif" 
                    onMouseEnter={() => setShowNotifications(true)} 
                    onMouseLeave={() => setShowNotifications(false)}
                  >
                    <button className="minimal-icon-action-btn" aria-label="Toggle notifications">
                      <FaBell />
                      {notifications.length > 0 && <span className="pulse-badge">{notifications.length}</span>}
                    </button>
                    
                    {showNotifications && (
                      <div className="glass-dropdown-card notifications-card">
                        <div className="dropdown-card-header">
                          <h6>Notifications</h6>
                          {notifications.length > 0 && <span className="pill-counter-accent">{notifications.length} Unread</span>}
                        </div>
                        <div className="dropdown-scroll-tray">
                          {notifications.length === 0 ? (
                            <div className="empty-notif-state">No new notifications</div>
                          ) : (
                            notifications.map((n) => (
                              <div key={n.id || Math.random()} className="notif-row-item">
                                <p className="notif-text-content">{n.message || n.content}</p>
                                <span className="notif-timestamp-tag">Just Now</span>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* USER PROFILE */}
                <div 
                  className="wrapper-relative-profile" 
                  onMouseEnter={() => setShowProfile(true)} 
                  onMouseLeave={() => setShowProfile(false)}
                >
                  <button className="premium-avatar-trigger-button" aria-label="Open user operations">
                    <div className="internal-avatar-gradient">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  </button>

                  {showProfile && (
                    <div className="glass-dropdown-card profile-card">
                      <div className="profile-identity-segment">
                        <p className="identity-display-name">{user.name}</p>
                        <span className="identity-display-role">{user.role}</span>
                      </div>
                      <div className="dropdown-action-list">
                        <Link className="action-row-link" to="/profile" onClick={() => setShowProfile(false)}>
                          <FaUserCircle className="row-icon" /> Profile Details
                        </Link>
                        {user.role === "STUDENT" && (
                          <Link className="action-row-link" to="/applications" onClick={() => setShowProfile(false)}>
                            <FaBriefcase className="row-icon" /> My Applications
                          </Link>
                        )}
                        {user.role === "RECRUITER" && (
                          <Link className="action-row-link" to="/recruiter/dashboard" onClick={() => setShowProfile(false)}>
                            <FaBuilding className="row-icon" /> Recruiter Console
                          </Link>
                        )}
                        <button onClick={handleLogout} className="action-row-link extreme-logout-row">
                          <FaSignOutAlt className="row-icon" /> Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="modern-auth-trigger-group">
                <button className="btn-secondary-clean" onClick={() => { setAuthMode("login"); setIsAuthOpen(true); }}>Log In</button>
                <button className="btn-primary-gradient" onClick={() => { setAuthMode("register"); setIsAuthOpen(true); }}>Sign Up</button>
              </div>
            )}

            <button className="mobile-hamburger-trigger" onClick={() => setIsMobile(!isMobile)} aria-label="Toggle navigation menu">
              {isMobile ? <FaTimes /> : <FaBars />}
            </button>
          </div>

        </div>
      </nav>
      <AuthDrawer isOpen={isAuthOpen} initialMode={authMode} onClose={() => setIsAuthOpen(false)} />
    </>
  );
};

export default Navbar;