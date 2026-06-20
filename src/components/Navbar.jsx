import React, { useState, useEffect, useRef } from "react";
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
  const navRef = useRef(null);

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
      role: localStorage.getItem("role") || "STUDENT"
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
    if (user.isLoggedIn && (user.role === "STUDENT" || user.role === "ROLE_STUDENT")) {
      const token = localStorage.getItem("token");
      axios
        .get("https://job-portal-backend-365l.onrender.com/job-portal/notifications", {
          headers: { Authorization: `Bearer ${token}` }
        })
        .then((res) => setNotifications(res.data))
        .catch((err) => console.error("Error fetching notifications:", err));
    }
  }, [user.isLoggedIn, user.role]);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setActiveDropdown(null);
        setIsMobile(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const closeAllMenus = () => {
    setIsMobile(false);
    setActiveDropdown(null);
  };

  return (
    <>
      <nav className="glass-nav" ref={navRef}>
        <div className="nav-container-fluid">
          
          {/* BRAND LOGO */}
          <div className="brand-wrapper">
            <Link to="/" className="brand-modern" onClick={closeAllMenus}>
              <div className="logo-vector-mark">
                <svg 
                  viewBox="0 0 100 100" 
                  className="vector-svg-logo" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <linearGradient id="chronoPrimary" x1="0%" y1="100%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#1b4332" /> 
                      <stop offset="100%" stopColor="#40916c" /> 
                    </linearGradient>
                    <linearGradient id="chronoDark" x1="100%" y1="100%" x2="0%" y2="0%">
                      <stop offset="0%" stopColor="#1c2421" />
                      <stop offset="100%" stopColor="#606d66" />
                    </linearGradient>
                  </defs>
                  <g>
                    <circle cx="50" cy="50" r="38" fill="none" stroke="url(#chronoPrimary)" strokeWidth="1" strokeDasharray="3 6" opacity="0.2" />
                    <path d="M 68 22 C 36 12, 14 30, 14 50 C 14 70, 36 88, 68 78 C 52 74, 28 66, 28 50 C 28 34, 52 26, 68 22 Z" fill="url(#chronoDark)" />
                    <path d="M 28 72 C 20 54, 40 48, 50 40 L 76 14" fill="none" stroke="url(#chronoPrimary)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="76" cy="14" r="3" fill="#ffffff" />
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
              <FaSearch className="segment-icon" />
              <input
                type="text"
                placeholder="Job title, skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="segment-divider"></div>
            <div className="search-segment">
              <FaMapMarkerAlt className="segment-icon" />
              <input
                type="text"
                placeholder="City or 'Remote'..."
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
              />
            </div>
            <button type="submit" className="modern-search-action-btn" aria-label="Search">
              <FaSearch />
            </button>
          </form>

          {/* NAVIGATION LINKS */}
          <ul className={`modern-menu-links ${isMobile ? "mobile-open" : "desktop-view"}`}>
            
            {/* JOBS DROP-DOWN */}
            <li className={`has-mega-dropdown ${activeDropdown === "jobs" ? "forced-open" : ""}`}>
              <button 
                type="button"
                className="modern-nav-trigger" 
                onClick={() => toggleDropdown("jobs")}
                aria-expanded={activeDropdown === "jobs"}
              >
                Find Jobs <FaChevronDown className="chevron-transition" />
              </button>
              <div className={`premium-mega-panel ${activeDropdown === "jobs" ? "mobile-visible" : "mobile-hidden"}`}>
                <div className="mega-grid">
                  <div className="mega-column">
                    <h6 className="column-title">By Domain</h6>
                    <Link to="/jobs?jobType=FULL_TIME&category=SOFTWARE_DEVELOPMENT" onClick={closeAllMenus}>Software Development</Link>
                    <Link to="/jobs?jobType=FULL_TIME&category=DATA_SCIENCE" onClick={closeAllMenus}>Data Science & AI</Link>
                    <Link to="/jobs?jobType=FULL_TIME&category=DEVOPS" onClick={closeAllMenus}>DevOps Engineering</Link>
                  </div>
                  <div className="mega-column">
                    <h6 className="column-title">By Work Mode</h6>
                    <Link to="/jobs?jobType=FULL_TIME&workMode=REMOTE" onClick={closeAllMenus} className="highlight-link">💥 Remote Jobs</Link>
                    <Link to="/jobs?jobType=FULL_TIME&workMode=HYBRID" onClick={closeAllMenus}>Hybrid Work</Link>
                    <Link to="/jobs?jobType=FULL_TIME&workMode=ONSITE" onClick={closeAllMenus}>Onsite / Office</Link>
                  </div>
                </div>
              </div>
            </li>

            {/* INTERNSHIPS DROP-DOWN */}
            <li className={`has-mega-dropdown ${activeDropdown === "internships" ? "forced-open" : ""}`}>
              <button 
                type="button"
                className="modern-nav-trigger" 
                onClick={() => toggleDropdown("internships")}
                aria-expanded={activeDropdown === "internships"}
              >
                Internships <FaChevronDown className="chevron-transition" />
              </button>
              <div className={`premium-mega-panel ${activeDropdown === "internships" ? "mobile-visible" : "mobile-hidden"}`}>
                <div className="mega-grid">
                  <div className="mega-column">
                    <h6 className="column-title">Tracks</h6>
                    <Link to="/jobs?jobType=INTERNSHIP&category=SOFTWARE_DEVELOPMENT" onClick={closeAllMenus}>Web Development</Link>
                    <Link to="/jobs?jobType=INTERNSHIP&category=DATA_SCIENCE" onClick={closeAllMenus}>Data Analytics</Link>
                  </div>
                  <div className="mega-column">
                    <h6 className="column-title">Preferences</h6>
                    <Link to="/jobs?jobType=INTERNSHIP&workMode=REMOTE" onClick={closeAllMenus}>Work From Home</Link>
                    <Link to="/jobs?jobType=INTERNSHIP&workMode=PART_TIME" onClick={closeAllMenus}>Part-Time</Link>
                  </div>
                </div>
              </div>
            </li>

            <li><Link to="/companies" className="modern-nav-trigger" onClick={closeAllMenus}>Companies</Link></li>
            <li><Link to="/courses" className="modern-nav-trigger" onClick={closeAllMenus}>Courses</Link></li>
          </ul>

          {/* RIGHT UTILITY HUB */}
          <div className="utility-action-hub">
            {user.isLoggedIn ? (
              <div className="auth-user-dashboard-controls">
                
                {/* NOTIFICATIONS */}
                {(user.role === "STUDENT" || user.role === "ROLE_STUDENT") && (
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
                          {notifications.length > 0 && <span className="pill-counter-accent">{notifications.length} New</span>}
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
                  <button className="premium-avatar-trigger-button" aria-label="User profile menu">
                    <div className="internal-avatar-gradient">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  </button>

                  {showProfile && (
                    <div className="glass-dropdown-card profile-card">
                      <div className="profile-identity-segment">
                        <p className="identity-display-name">{user.name}</p>
                        <span className="identity-display-role">{user.role.replace("ROLE_", "")}</span>
                      </div>
                      <div className="dropdown-action-list">
                        <Link className="action-row-link" to="/profile" onClick={() => setShowProfile(false)}>
                          <FaUserCircle className="row-icon" /> Profile
                        </Link>
                        {(user.role === "STUDENT" || user.role === "ROLE_STUDENT") && (
                          <Link className="action-row-link" to="/applications" onClick={() => setShowProfile(false)}>
                            <FaBriefcase className="row-icon" /> Applications
                          </Link>
                        )}
                        {(user.role === "RECRUITER" || user.role === "ROLE_RECRUITER") && (
                          <Link className="action-row-link" to="/recruiter-dashboard" onClick={() => setShowProfile(false)}>
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

            <button 
              className="mobile-hamburger-trigger" 
              onClick={() => setIsMobile(!isMobile)} 
              aria-label="Toggle menu"
              aria-expanded={isMobile}
            >
              {isMobile ? <FaTimes /> : <FaBars />}
            </button>
          </div>

        </div>
      </nav>
      
      {isAuthOpen && (
        <AuthDrawer isOpen={isAuthOpen} initialMode={authMode} onClose={() => setIsAuthOpen(false)} />
      )}
    </>
  );
};

export default Navbar;