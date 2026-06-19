import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  FaTimes, FaEnvelope, FaLock, FaUser, 
  FaBriefcase, FaBuilding, FaArrowLeft, FaKey,
  FaEye, FaEyeSlash, FaGoogle, FaLinkedin, FaGithub
} from "react-icons/fa";
import "../components/Styles/authDrawer.css";

// Dynamic API Path Clean up
const RAW_API = import.meta.env.VITE_API_URL || "https://job-portal-backend-365l.onrender.com";
const API = RAW_API.endsWith("/") ? RAW_API.slice(0, -1) : RAW_API;

const INITIAL_FORM_STATE = {
  email: "",
  password: "",
  name: "",
  role: "STUDENT",
  companyName: "",
  gstNumber: "", 
};

const AuthDrawer = ({ isOpen, onClose, initialMode = "login" }) => {
  const [currentView, setCurrentView] = useState(initialMode);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Pure Visual Enhanced UI States
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, text: "Too Short", color: "#ff4d4d" });

  const [formData, setFormData] = useState(INITIAL_FORM_STATE);

  // Synchronize drawer structure cleanly upon structural mounts
  useEffect(() => {
    setCurrentView(initialMode);
    setMessage({ type: "", text: "" });
    setFormData(INITIAL_FORM_STATE);
    setShowPassword(false);
    setPasswordStrength({ score: 0, text: "Too Short", color: "#ff4d4d" });
  }, [initialMode, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "password") {
      evaluatePasswordStrength(value);
    }
  };

  const evaluatePasswordStrength = (password) => {
    if (!password) {
      setPasswordStrength({ score: 0, text: "Empty", color: "transparent" });
      return;
    }
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    let text = "Weak 🟥";
    let color = "#ff4d4d";

    if (score >= 4 && password.length >= 8) {
      text = "Strong 🟩";
      color = "#00e676";
    } else if (score >= 2 && password.length >= 6) {
      text = "Medium 🟨";
      color = "#ffb300";
    }
    setPasswordStrength({ score, text, color });
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

      // Isolate recruiter validation checks completely
      if (formData.role === "RECRUITER") {
        if (!formData.companyName.trim()) {
          setMessage({ type: "error", text: "Company name is required" });
          setLoading(false);
          return;
        }

        const validGstTokens = ["TSAR-IT-99X", "CORP-VALID-2026", "GST-STATIC-77"];
        const cleanGstInput = formData.gstNumber?.trim().toUpperCase();

        if (!cleanGstInput || !validGstTokens.includes(cleanGstInput)) {
          setMessage({ 
            type: "error", 
            text: "Invalid Corporate Authorization Access Key / GST Registration Token." 
          });
          setLoading(false);
          return;
        }
      }
    }

    const url = currentView === "login" ? `${API}/auth/login` : `${API}/auth/register`;

    try {
      const res = await axios.post(url, formData);

      if (currentView === "login") {
        const { token, role, name, email, publicId } = res.data;
        
        // FIXED: Do not use localStorage.clear() as it wipes setup contextual variables. 
        // Explicitly clear key profile metrics instead.
        localStorage.removeItem("token");
        localStorage.removeItem("userName");
        localStorage.removeItem("email");
        localStorage.removeItem("publicId");
        localStorage.removeItem("role");

        // Commit credentials to system storage
        localStorage.setItem("token", token);
        localStorage.setItem("userName", name);
        localStorage.setItem("email", email);
        localStorage.setItem("publicId", publicId);
        localStorage.setItem("role", role);

        setMessage({ type: "success", text: "Authenticated successfully. Diverting access pathway..." });
        
        const isRecruiter = role === "ROLE_RECRUITER" || role === "RECRUITER";

        setTimeout(() => {
          handleClose(); 
          
          // CRITICAL UX ROUTING MANAGEMENT FIX:
          if (isRecruiter) {
            // Recruiters are forced out of structural user pathing directly to the administration console
            window.location.href = "/recruiter-dashboard";
          } else {
            // Students instantly refresh to commit auth state on current job / apply pathing layouts
            window.location.reload();
          }
        }, 1200);
      } else {
        setMessage({ type: "success", text: "Profile initialized successfully! Switching to sign in panel..." });
        setTimeout(() => { 
          setCurrentView("login"); 
          setMessage({ type: "", text: "" }); 
        }, 2500);
      }
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Authentication gateway error." });
    } finally {
      setLoading(false);
    }
  };

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
                    <>
                      <div className="premium-input-wrapper">
                        <FaBuilding className="wrapper-icon" />
                        <input name="companyName" type="text" placeholder=" " value={formData.companyName} onChange={handleChange} required />
                        <label className="floating-label">Company Entity Name</label>
                      </div>

                      <div className="premium-input-wrapper enterprise-secure-gateway">
                        <FaKey className="wrapper-icon" style={{ color: "#ffb300" }} />
                        <input 
                          name="gstNumber" 
                          type="text" 
                          placeholder=" " 
                          value={formData.gstNumber || ""} 
                          onChange={handleChange} 
                          required 
                          style={{ borderBottomColor: formData.gstNumber ? "#ffb300" : "" }}
                        />
                        <label className="floating-label" style={{ color: formData.gstNumber ? "#ffb300" : "" }}>
                          Enterprise Gateway Key / GST Token
                        </label>
                      </div>
                    </>
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
                <input 
                  name="password" 
                  type={showPassword ? "text" : "password"} 
                  placeholder=" " 
                  value={formData.password} 
                  onChange={handleChange} 
                  required 
                />
                <label className="floating-label">Secure Access Key</label>
                <button 
                  type="button" 
                  className="password-toggle-eye" 
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>

              {currentView === "register" && formData.password && (
                <div className="password-metrics-box">
                  <div className="metrics-meta">
                    <span>Cryptographic Strength:</span>
                    <span style={{ color: passwordStrength.color, fontWeight: "bold" }}>{passwordStrength.text}</span>
                  </div>
                  <div className="metrics-bar-track">
                    <div 
                      className="metrics-bar-fill" 
                      style={{ 
                        width: `${(passwordStrength.score / 5) * 100}%`, 
                        backgroundColor: passwordStrength.color 
                      }}
                    ></div>
                  </div>
                </div>
              )}

              {currentView === "login" && (
                <div className="form-utils-row">
                  <label className="remember-me-container">
                    <input 
                      type="checkbox" 
                      checked={rememberMe} 
                      onChange={(e) => setRememberMe(e.target.checked)} 
                    />
                    <span className="custom-checkmark"></span>
                    Keep access active
                  </label>
                  
                  <button type="button" className="premium-link-btn" onClick={() => { setCurrentView("forgot"); setMessage({ type: "error", text: "Notice: Recover Identity features are temporarily disabled." }); }}>
                    Forgot entry password?
                  </button>
                </div>
              )}

              <button type="submit" className="premium-submit-btn" disabled={loading}>
                {loading ? <span className="premium-spinner"></span> : (currentView === "login" ? <span>Authenticate Profile</span> : <span>Initialize Account</span>)}
              </button>

              <div className="social-divider">
                <span>Or cross reference gateway with</span>
              </div>

              <div className="social-auth-grid">
                <a href="mailto:manyamkrishna925@gmail.com?subject=Job%20Portal%20Gateway%20Authentication" className="social-btn google" style={{ textDecoration: 'none' }}>
                  <FaGoogle /> <span>Google</span>
                </a>
                <a href="https://www.linkedin.com/in/chakali-krishna-2bb6992a6/" target="_blank" rel="noopener noreferrer" className="social-btn linkedin" style={{ textDecoration: 'none' }}>
                  <FaLinkedin /> <span>LinkedIn</span>
                </a>
                <a href="https://github.com/ChakaliKrisna" target="_blank" rel="noopener noreferrer" className="social-btn github" style={{ textDecoration: 'none' }}>
                  <FaGithub /> <span>GitHub</span>
                </a>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
};

export default AuthDrawer;