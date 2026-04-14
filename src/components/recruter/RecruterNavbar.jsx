import React, { useState, useRef, useEffect } from "react"; // Added useRef and useEffect
import { Link, useNavigate, useLocation } from "react-router-dom";
import { 
  FaThLarge, 
  FaPlusCircle, 
  FaBriefcase, 
  FaUsers, 
  FaSearch, 
  FaEnvelope, 
  FaBell, 
  FaBuilding, 
  FaCog, 
  FaSignOutAlt, 
  FaChevronDown, 
  FaCreditCard,
  FaChartBar 
} from "react-icons/fa";
import "../../components/recruter/Styles/RecruiterNavbar.css";

export default function RecruiterNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null); // FIX 1: Defined dropdownRef
  
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [msgCount] = useState(3);
  const [notifCount] = useState(5);

  const userName = localStorage.getItem("userName") || "Recruiter";

  // FIX 2: Handle clicking outside to close the dropdown
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
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userName");
    navigate("/");
    window.location.reload(); 
  };

  const isActive = (path) => location.pathname.startsWith(path) ? "active-link" : "";

  return (
    <nav className="recruiter-nav">
      <div className="nav-logo" onClick={() => navigate("/recruiter-dashboard")}>
        <FaBriefcase className="logo-icon" />
        <span>HUNTER <span>PRO</span></span>
      </div>

      <div className="nav-links">
        <Link to="/recruiter-dashboard" className={isActive("/recruiter-dashboard")} title="Dashboard">
          <FaThLarge /> <span>Dashboard</span> 
        </Link>
        
        <Link to="/post-job" className={isActive("/post-job")} title="Post a New Job">
          <FaPlusCircle /> <span>Post Job</span>
        </Link>

        <Link to="/manage-jobs" className={isActive("/manage-jobs")} title="Manage My Jobs">
          <FaBriefcase /> <span>My Jobs</span>
        </Link>

        <Link to="/applications" className={isActive("/applications")} title="View Applicants">
          <FaUsers /> <span>Applications</span>
        </Link>

        <Link to="/analytics" className={isActive("/analytics")} title="Performance Analytics">
          <FaChartBar /> <span>Analytics</span>
        </Link>

        <Link to="/search-talent" className={isActive("/search-talent")} title="Search Candidates">
          <FaSearch /> <span>Search Talent</span>
        </Link>
      </div>

      <div className="nav-actions">
        <Link to="/messages" className="icon-badge-link" title="Messages">
          <div className="icon-badge">
            <FaEnvelope />
            {msgCount > 0 && <span className="badge">{msgCount}</span>}
          </div>
        </Link>

        <Link to="/notifications" className="icon-badge-link" title="Notifications">
          <div className="icon-badge">
            <FaBell />
            {notifCount > 0 && <span className="badge">{notifCount}</span>}
          </div>
        </Link>

        {/* FIX 3: Corrected the div nesting so everything is inside profile-section */}
        <div 
          className="profile-section" 
          ref={dropdownRef}
          onClick={() => setShowProfileDropdown(!showProfileDropdown)}
        >
          <div className="avatar">{userName.charAt(0).toUpperCase()}</div>
          <span className="user-name">{userName}</span>
          <FaChevronDown className={`arrow ${showProfileDropdown ? "rotate" : ""}`} />

          {showProfileDropdown && (
            <div className="profile-dropdown" onClick={(e) => e.stopPropagation()}>
              <div className="dropdown-header">
                <strong>{userName}</strong>
                <span>Recruiter Account</span>
              </div>
              <hr />
              <Link to="/company-profile" onClick={() => setShowProfileDropdown(false)}>
                <FaBuilding /> Company Profile
              </Link>
              <Link to="/plans" onClick={() => setShowProfileDropdown(false)}>
                <FaCreditCard /> Subscription Plans
              </Link>
              <Link to="/settings" onClick={() => setShowProfileDropdown(false)}>
                <FaCog /> Account Settings
              </Link>
              <hr />
              <button onClick={handleLogout} className="logout-btn">
                <FaSignOutAlt /> Secure Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}