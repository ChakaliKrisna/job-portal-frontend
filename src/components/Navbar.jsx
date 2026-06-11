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
  FaChevronDown,
  FaGraduationCap
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

  // Modern tracking for active elements to improve mobile toggles
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

  // Read URL search parameters to keep inputs synced globally
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
        .get("http://localhost:8080/job-portal/notifications", {
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
    if (activeDropdown === menuName) {
      setActiveDropdown(null);
    } else {
      setActiveDropdown(menuName);
    }
  };

  return (
    <>
      <nav className="glass-nav">
        <div className="nav-container-fluid">
          
          {/* BRAND LOGO */}
          <Link to="/" className="brand-modern" onClick={() => setIsMobile(false)}>
            Hunter<span className="brand-dot">.</span>
          </Link>

          {/* ADVANCED INTEGRATED SEARCH BAR */}
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
          <ul className={`modern-menu-links ${isMobile ? "mobile-active" : ""}`}>
            
            {/* JOBS DROP-DOWN */}
            <li className={`has-mega-dropdown ${activeDropdown === "jobs" ? "forced-open" : ""}`}>
              <span className="modern-nav-trigger" onClick={() => toggleDropdown("jobs")}>
                Find Jobs <FaChevronDown className="chevron-transition" />
              </span>
              
              <div className="premium-mega-panel">
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
              <span className="modern-nav-trigger" onClick={() => toggleDropdown("internships")}>
                Internships <FaChevronDown className="chevron-transition" />
              </span>
              
              <div className="premium-mega-panel">
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

          {/* RIGHT CONTROLS */}
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

            <button className="mobile-hamburger-trigger" onClick={() => setIsMobile(!isMobile)} aria-label="Toggle structural layout">
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