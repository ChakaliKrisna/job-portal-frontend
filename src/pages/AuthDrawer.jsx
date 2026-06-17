import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  FaTimes, FaEnvelope, FaLock, FaUser, 
  FaBriefcase, FaBuilding, FaArrowLeft, FaKey 
} from "react-icons/fa";
import "../components/Styles/authDrawer.css";

const API = import.meta.env.VITE_API_URL || "https://job-portal-backend-365l.onrender.com";

const AuthDrawer = ({ isOpen, onClose, initialMode = "login" }) => {
  const [currentView, setCurrentView] = useState(initialMode); // 'login', 'register', 'forgot'
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    role: "STUDENT",
    companyName: "",
  });

  useEffect(() => {
    setCurrentView(initialMode);
    setMessage({ type: "", text: "" });
    setFormData({ email: "", password: "", name: "", role: "STUDENT", companyName: "" });
  }, [initialMode, isOpen]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    if (currentView === "register") {
      if (formData.password.length < 8) {
        setMessage({ type: "error", text: "Password must contain at least 8 characters" });
        setLoading(false);
        return;
      }
      if (formData.role === "RECRUITER" && !formData.companyName.trim()) {
        setMessage({ type: "error", text: "Company name is required" });
        setLoading(false);
        return;
      }
    }

    const url = currentView === "login" ? `${API}/auth/login` : `${API}/auth/register`;

    try {
      const res = await axios.post(url, formData);

      if (currentView === "login") {
        const { token, role, name, email, publicId } = res.data;
        
        // 1. Commit credentials to system storage
        localStorage.setItem("token", token);
        localStorage.setItem("userName", name);
        localStorage.setItem("email", email);
        localStorage.setItem("publicId", publicId);
        localStorage.setItem("role", role);

        setMessage({ type: "success", text: "Authenticated successfully. Diverting access pathway..." });
        
        // 2. Safely normalize role values coming back from Spring Boot
        const isRecruiter = role === "ROLE_RECRUITER" || role === "RECRUITER";
        const targetRoute = isRecruiter ? "/recruiter-dashboard" : "/";

        setTimeout(() => {
          handleClose(); // Close drawer matrix cleanly
          
          // 3. FIXED: Hard location assignment forces the global routing tree 
          // to reload and read the new token/role instantly without timing bugs.
          window.location.href = targetRoute;
        }, 1200);
      } else {
        // IGNORED EMAIL VERIFICATION: Swapped out email verification note for instant profile initialization response
        setMessage({ type: "success", text: "Profile initialized successfully! Switching to sign in panel..." });
        setTimeout(() => { 
          setCurrentView("login"); 
          setMessage({ type: "", text: "" }); 
        }, 3000);
      }
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Authentication gateway error." });
    } finally {
      setLoading(false);
    }
  };

  // HANDLER CHANGED: Dead-ended forgotten verification pipeline with UI warning triggers
  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    setTimeout(() => {
      setMessage({ type: "error", text: "Identity recovery server down. Feature Coming Soon!" });
      setLoading(false);
    }, 600);
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => { 
      setCurrentView(initialMode); 
      setMessage({ type: "", text: "" }); 
    }, 400);
  };

  return (
    <>
      <div className={`premium-overlay ${isOpen ? "active" : ""}`} onClick={handleClose}></div>
      <div className={`premium-drawer ${isOpen ? "active" : ""}`}>
        <button className="premium-close-btn" onClick={handleClose} aria-label="Close panel">
          <FaTimes />
        </button>

        {/* Dynamic Structural Switcher Tabs */}
        {currentView !== "forgot" && (
          <div className="matrix-tab-navigation">
            <button 
              type="button"
              className={`matrix-tab ${currentView === "login" ? "active" : ""}`} 
              onClick={() => { setCurrentView("login"); setMessage({ type: "", text: "" }); }}
            >
              Sign In
            </button>
            <button 
              type="button"
              className={`matrix-tab ${currentView === "register" ? "active" : ""}`} 
              onClick={() => { setCurrentView("register"); setMessage({ type: "", text: "" }); }}
            >
              Register
            </button>
          </div>
        )}

        <div key={currentView} className="premium-inner-motion">
          <div className="premium-header">
            {currentView === "login" && (
              <>
                <h2>Welcome back</h2>
                <p>Provide credentials to securely cross the enterprise gateway</p>
              </>
            )}
            {currentView === "register" && (
              <>
                <h2>Create account</h2>
                <p>Formulate your hunter profile matrix to track global metrics</p>
              </>
            )}
            {currentView === "forgot" && (
              <>
                <div className="premium-icon-halo"><FaKey /></div>
                <h2>Recover identity</h2>
                <p style={{ color: "#ff4d4d", fontWeight: "bold" }}>System Notice: Recovery Protocols Offline (Coming Soon)</p>
              </>
            )}
          </div>

          {message.text && <div className={`premium-alert ${message.type}`}><span>{message.text}</span></div>}

          {currentView === "forgot" ? (
            <form onSubmit={handleForgotSubmit} className="premium-form">
              <div className="premium-input-wrapper">
                <FaEnvelope className="wrapper-icon" />
                <input name="email" type="email" placeholder=" " value={formData.email} onChange={handleChange} required disabled />
                <label className="floating-label">Registered Email</label>
              </div>
              <button type="submit" className="premium-submit-btn" style={{ opacity: 0.6, cursor: "not-allowed" }} disabled={loading}>
                {loading ? <span className="premium-spinner"></span> : <span>Dispatch Reset System (Disabled)</span>}
              </button>
              <button type="button" className="premium-back-action" onClick={() => { setCurrentView("login"); setMessage({ type: "", text: "" }); }}>
                <FaArrowLeft /> Standard Sign In Gateway
              </button>
            </form>
          ) : (
            <form onSubmit={handleAuthSubmit} className="premium-form">
              {currentView === "register" && (
                <>
                  <div className="premium-input-wrapper">
                    <FaUser className="wrapper-icon" />
                    <input name="name" type="text" placeholder=" " value={formData.name} onChange={handleChange} required minLength="2" />
                    <label className="floating-label">Full Name</label>
                  </div>

                  <div className="premium-input-wrapper">
                    <FaBriefcase className="wrapper-icon" />
                    <select name="role" onChange={handleChange} value={formData.role}>
                      <option value="STUDENT">Student / Seeker Architecture</option>
                      <option value="RECRUITER">Enterprise Recruiter Suite</option>
                    </select>
                    <label className="floating-label">Profile Context</label>
                  </div>

                  {formData.role === "RECRUITER" && (
                    <div className="premium-input-wrapper">
                      <FaBuilding className="wrapper-icon" />
                      <input name="companyName" type="text" placeholder=" " value={formData.companyName} onChange={handleChange} required />
                      <label className="floating-label">Company Entity Name</label>
                    </div>
                  )}
                </>
              )}

              <div className="premium-input-wrapper">
                <FaEnvelope className="wrapper-icon" />
                <input name="email" type="email" placeholder=" " value={formData.email} onChange={handleChange} required />
                <label className="floating-label">Email Address</label>
              </div>

              <div className="premium-input-wrapper">
                <FaLock className="wrapper-icon" />
                <input name="password" type="password" placeholder=" " value={formData.password} onChange={handleChange} required />
                <label className="floating-label">Secure Access Key</label>
              </div>

              {currentView === "login" && (
                <button type="button" className="premium-link-btn" onClick={() => { setCurrentView("forgot"); setMessage({ type: "error", text: "Notice: Recover Identity features are temporarily disabled." }); }}>
                  Forgot entry password?
                </button>
              )}

              <button type="submit" className="premium-submit-btn" disabled={loading}>
                {loading ? <span className="premium-spinner"></span> : (currentView === "login" ? <span>Authenticate Profile</span> : <span>Initialize Account</span>)}
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
};

export default AuthDrawer;