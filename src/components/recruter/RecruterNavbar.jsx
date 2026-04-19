import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { 
  FaThLarge, FaPlusCircle, FaBriefcase, FaUsers, FaSearch, 
  FaEnvelope, FaBell, FaBuilding, FaCog, FaSignOutAlt, 
  FaChevronDown, FaCreditCard, FaChartBar 
} from "react-icons/fa";
import "../../components/recruter/Styles/RecruiterNavbar.css";

export default function RecruiterNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  const userName = localStorage.getItem("userName") || "Recruiter";
  const msgCount = 3; 
  const notifCount = 5;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
    window.location.reload(); 
  };

  const isActive = (path) => location.pathname === path ? "nav-link active" : "nav-link";

  return (
    <nav className="horizon-nav">
      <div className="nav-container">
        
        {/* 1. BRAND ZONE */}
        <div className="nav-brand" onClick={() => navigate("/recruiter-dashboard")}>
          <div className="brand-logo"><FaBriefcase /></div>
          <span className="brand-text">HUNTER<span>PRO</span></span>
        </div>

        {/* 2. CORE WORKFLOW ZONE (Restored all links) */}
        <div className="nav-links-group">
          <Link to="/recruiter-dashboard" className={isActive("/recruiter-dashboard")}>
            <FaThLarge /> <span>Dashboard</span>
          </Link>
          <Link to="/post-job" className={isActive("/post-job")}>
            <FaPlusCircle /> <span>Post Job</span>
          </Link>
          <Link to="/manage-jobs" className={isActive("/manage-jobs")}>
            <FaBriefcase /> <span>My Jobs</span>
          </Link>
          <Link to="/applications" className={isActive("/applications")}>
            <FaUsers /> <span>Applicants</span>
          </Link>
          <Link to="/search-talent" className={isActive("/search-talent")}>
            <FaSearch /> <span>Search Talent</span>
          </Link>
          <Link to="/analytics" className={isActive("/analytics")}>
            <FaChartBar /> <span>Analytics</span>
          </Link>
        </div>

        {/* 3. ENGAGEMENT & ACCOUNT ZONE */}
        <div className="nav-actions">
          {/* Messages with Badge */}
          <Link to="/messages" className="action-pill" title="Messages">
            <FaEnvelope />
            {msgCount > 0 && <span className="badge-count">{msgCount}</span>}
          </Link>
          
          {/* Notifications with Badge */}
          <Link to="/notifications" className="action-pill" title="Notifications">
            <FaBell />
            {notifCount > 0 && <span className="badge-count warning">{notifCount}</span>}
          </Link>

          {/* Profile Dropdown */}
          <div className="profile-pill" ref={dropdownRef} onClick={() => setShowProfileDropdown(!showProfileDropdown)}>
            <div className="user-avatar">{userName.charAt(0).toUpperCase()}</div>
            <div className="user-info-mini">
               <span className="u-name">{userName}</span>
               <FaChevronDown className={`chevron ${showProfileDropdown ? "rotate" : ""}`} />
            </div>

            {showProfileDropdown && (
              <div className="horizon-dropdown" onClick={(e) => e.stopPropagation()}>
                <div className="dropdown-info">
                  <p className="d-name">{userName}</p>
                  <p className="d-role">Recruiter Account</p>
                </div>
                <hr />
                <Link to="/company-profile" className="d-item" onClick={() => setShowProfileDropdown(false)}>
                   <FaBuilding /> Company Profile
                </Link>
                <Link to="/plans" className="d-item" onClick={() => setShowProfileDropdown(false)}>
                   <FaCreditCard /> Subscription Plans
                </Link>
                <Link to="/settings" className="d-item" onClick={() => setShowProfileDropdown(false)}>
                   <FaCog /> Account Settings
                </Link>
                <hr />
                <button onClick={handleLogout} className="d-logout">
                  <FaSignOutAlt /> Secure Logout
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </nav>
  );
}