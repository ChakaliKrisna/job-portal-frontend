import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaTimes, FaEnvelope, FaLock, FaUser, FaBriefcase, FaBuilding } from "react-icons/fa";
import "./Styles/authDrawer.css";

const AuthDrawer = ({ isOpen, onClose, initialMode }) => {
  const [isLogin, setIsLogin] = useState(initialMode === "login");
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
    setIsLogin(initialMode === "login");
    setMessage({ type: "", text: "" });
    // Reset form when opening/switching
    setFormData({
      email: "",
      password: "",
      name: "",
      role: "STUDENT",
      companyName: "",
    });
  }, [initialMode, isOpen]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    const url = isLogin
      ? "http://localhost:8080/auth/login"
      : "http://localhost:8080/auth/register";

    try {
      const res = await axios.post(url, formData);

      if (isLogin) {
        const { token, accessToken, jwt, role, name, username } = res.data;
        const authToken = token || accessToken || jwt;
        const userRole = role || "STUDENT";
        const displayName = name || username || "User";

        if (authToken) {
          localStorage.setItem("token", authToken);
          localStorage.setItem("userName", displayName);
          localStorage.setItem("role", userRole.toLowerCase());

          setMessage({ type: "success", text: "Login successful! Redirecting..." });

          setTimeout(() => {
            window.location.href = userRole.toLowerCase().includes("recruiter") 
              ? "/recruiter-dashboard" 
              : "/";
          }, 1200);
        }
      } else {
        setMessage({ type: "success", text: "Account created! You can now sign in." });
        setTimeout(() => {
          setIsLogin(true);
          setMessage({ type: "", text: "" });
        }, 2500);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Something went wrong. Please try again.";
      setMessage({ type: "error", text: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className={`drawer-overlay ${isOpen ? "show" : ""}`} onClick={onClose}></div>
      <div className={`auth-drawer ${isOpen ? "open" : ""}`}>
        <button className="close-btn" onClick={onClose} aria-label="Close">
          <FaTimes />
        </button>

        <div className="drawer-header">
          <h2>{isLogin ? "Welcome Back" : "Join Hunter"}</h2>
          <p>{isLogin ? "Sign in to your account" : "Create an account to get started"}</p>
        </div>

        {message.text && (
          <div className={`auth-alert ${message.type}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <>
              <div className="input-group">
                <div className="input-box">
                  <FaUser className="input-icon" />
                  <input
                    name="name"
                    type="text"
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    minLength="2"
                  />
                </div>
              </div>

              <div className="input-group">
                <div className="input-box">
                  <FaBriefcase className="input-icon" />
                  <select name="role" onChange={handleChange} value={formData.role} className="role-select">
                    <option value="STUDENT">I am a Student / Seeker</option>
                    <option value="RECRUITER">I am a Recruiter</option>
                  </select>
                </div>
              </div>

              {formData.role === "RECRUITER" && (
                <div className="input-group animated-field">
                  <div className="input-box">
                    <FaBuilding className="input-icon" />
                    <input
                      name="companyName"
                      type="text"
                      placeholder="Company Name"
                      value={formData.companyName}
                      onChange={handleChange}
                      required
                      minLength="2"
                    />
                  </div>
                </div>
              )}
            </>
          )}

          <div className="input-group">
            <div className="input-box">
              <FaEnvelope className="input-icon" />
              <input
                name="email"
                type="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <div className="input-box">
              <FaLock className="input-icon" />
              <input
                name="password"
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength="6"
              />
            </div>
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? <span className="loader"></span> : (isLogin ? "Sign In" : "Create Account")}
          </button>
        </form>

        <div className="drawer-footer">
          <p>
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button className="toggle-auth" onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? "Register Now" : "Login here"}
            </button>
          </p>
        </div>
      </div>
    </>
  );
};

export default AuthDrawer;