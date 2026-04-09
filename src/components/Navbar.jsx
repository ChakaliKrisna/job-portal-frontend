import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { 
  FaUserCircle, FaBars, FaTimes, FaBell, 
  FaChevronDown, FaSignOutAlt, FaSearch, FaBriefcase 
} from "react-icons/fa";
import AuthDrawer from "../pages/AuthDrawer"; 
import "./Styles/navbar.css";

const Navbar = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [searchQuery, setSearchQuery] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  // 1. Unified User State
  const [user, setUser] = useState({
    isLoggedIn: !!localStorage.getItem("token"),
    name: localStorage.getItem("userName") || "User",
    role: localStorage.getItem("userRole") || "STUDENT"
  });

  // 2. Sync Logic: Updates Navbar state whenever AuthDrawer closes
  // This ensures that when a user logs in, the "Login/Register" buttons disappear instantly.
  useEffect(() => {
    if (!isAuthOpen) {
      setUser({
        isLoggedIn: !!localStorage.getItem("token"),
        name: localStorage.getItem("userName") || "User",
        role: localStorage.getItem("userRole") || "STUDENT"
      });
    }
  }, [isAuthOpen]);

  // Handle Scroll effect for glassmorphism
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menus when route changes
  useEffect(() => {
    setIsMobile(false);
    setActiveDropdown(null);
  }, [location]);

  const handleLogout = () => {
    localStorage.clear();
    setUser({ isLoggedIn: false, name: "", role: "" });
    navigate("/");
  };

  const openAuth = (mode) => {
    setAuthMode(mode);
    setIsAuthOpen(true);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/jobs?search=${searchQuery}`);
      setSearchQuery("");
    }
  };

  // Toggle dropdown for mobile (Click instead of Hover)
  const toggleDropdown = (name) => {
    if (activeDropdown === name) setActiveDropdown(null);
    else setActiveDropdown(name);
  };

  return (
    <>
      <nav className={`main-nav ${isScrolled ? "scrolled" : ""} ${isMobile ? "mobile-open" : ""}`}>
        <div className="nav-content">
          
          {/* LEFT: Logo & Mega Menus */}
          <div className="nav-left">
            <Link to="/" className="brand-logo">
              <img src="/logo.png" alt="Hunter" />
            </Link>

            <ul className={`nav-menu ${isMobile ? "active" : ""}`}>
              {/* INTERNSHIPS MEGA MENU */}
              <li 
                className="menu-item has-mega"
                onMouseEnter={() => !isMobile && setActiveDropdown('internships')}
                onMouseLeave={() => !isMobile && setActiveDropdown(null)}
                onClick={() => isMobile && toggleDropdown('internships')}
              >
                <span className="menu-trigger">
                  Internships <FaChevronDown className={activeDropdown === 'internships' ? 'rotate' : ''} />
                </span>
                <div className={`mega-box ${activeDropdown === 'internships' ? 'show' : ''}`}>
                  <div className="mega-grid">
                    <div className="mega-col bento-style">
                      <h5>By Profile</h5>
                      <Link to="/internships/web-development">Web Development</Link>
                      <Link to="/internships/marketing">Marketing</Link>
                      <Link to="/internships/design">Graphic Design</Link>
                    </div>
                    <div className="mega-col bento-style">
                      <h5>By Location</h5>
                      <Link to="/internships/remote">Work from Home</Link>
                      <Link to="/internships/delhi">Delhi</Link>
                      <Link to="/internships/mumbai">Mumbai</Link>
                    </div>
                  </div>
                </div>
              </li>

              {/* JOBS MEGA MENU */}
              <li 
                className="menu-item has-mega"
                onMouseEnter={() => !isMobile && setActiveDropdown('jobs')}
                onMouseLeave={() => !isMobile && setActiveDropdown(null)}
                onClick={() => isMobile && toggleDropdown('jobs')}
              >
                <span className="menu-trigger">
                  Jobs <FaChevronDown className={activeDropdown === 'jobs' ? 'rotate' : ''} />
                </span>
                <div className={`mega-box ${activeDropdown === 'jobs' ? 'show' : ''}`}>
                  <div className="mega-grid">
                    <div className="mega-col bento-style">
                      <h5>Role</h5>
                      <Link to="/jobs/software-engineer">Software Engineer</Link>
                      <Link to="/jobs/data-science">Data Scientist</Link>
                    </div>
                    <div className="mega-col bento-style">
                      <h5>Type</h5>
                      <Link to="/jobs/fresher">Fresher Jobs</Link>
                      <Link to="/jobs/remote">Remote Jobs</Link>
                    </div>
                  </div>
                </div>
              </li>

              <li>
                <Link to="/courses" className="menu-item">
                  Courses <span className="badge-new">Sale</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* RIGHT: Actions & Profile */}
          <div className="nav-right">
            <form className="search-bar-mini" onSubmit={handleSearchSubmit}>
              <FaSearch onClick={handleSearchSubmit} className="search-icon" />
              <input 
                type="text" 
                placeholder="Search jobs..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>

            {user.isLoggedIn ? (
              <div className="user-actions">
                <Link to="/notifications" className="icon-btn">
                  <FaBell />
                  <span className="dot"></span>
                </Link>
                
                <div 
                  className="profile-container"
                  onMouseEnter={() => !isMobile && setActiveDropdown('profile')}
                  onMouseLeave={() => !isMobile && setActiveDropdown(null)}
                  onClick={() => isMobile && toggleDropdown('profile')}
                >
                  <div className="avatar-circle">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  
                  <div className={`profile-dropdown ${activeDropdown === 'profile' ? 'show' : ''}`}>
                    <div className="user-meta">
                      <p className="user-name">{user.name}</p>
                      <p className="user-role">{user.role.toLowerCase()}</p>
                    </div>
                    <hr />
                    <Link to="/applications"><FaBriefcase /> My Applications</Link>
                    <Link to="/profile"><FaUserCircle /> View Profile</Link>
                    <button onClick={handleLogout} className="logout-link">
                      <FaSignOutAlt /> Logout
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="auth-group">
                <button className="login-btn" onClick={() => openAuth("login")}>Login</button>
                <button className="register-btn" onClick={() => openAuth("register")}>Register</button>
              </div>
            )}

            <button className="hamburger" onClick={() => setIsMobile(!isMobile)}>
              {isMobile ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>
      </nav>

      <AuthDrawer 
        isOpen={isAuthOpen} 
        initialMode={authMode} 
        onClose={() => setIsAuthOpen(false)} 
      />
    </>
  );
};

export default Navbar;