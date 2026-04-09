import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaTimes, FaEnvelope, FaLock, FaUser, FaArrowRight, FaBriefcase } from "react-icons/fa";
import "../components/Styles/authDrawer.css";

const AuthDrawer = ({ isOpen, onClose, initialMode }) => {
  const [isLogin, setIsLogin] = useState(initialMode === "login");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  
  const [formData, setFormData] = useState({ 
    email: "", 
    password: "", 
    name: "", 
    role: "STUDENT" 
  });

  useEffect(() => {
    setIsLogin(initialMode === "login");
    setMessage({ type: "", text: "" });
  }, [initialMode, isOpen]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    // Ensure no trailing slashes or typos in these URLs
    const url = isLogin 
      ? "http://localhost:8080/auth/login" 
      : "http://localhost:8080/auth/register";
    
    try {
      // Spring Boot expects a JSON object that matches your DTO/Entity
      const res = await axios.post(url, formData, {
        headers: { "Content-Type": "application/json" }
      });

      console.log("Success Response:", res.data);

      if (isLogin) {
        // Handle different possible backend response structures
        const token = res.data.token || res.data.accessToken || res.data.jwt;
        const name = res.data.name || res.data.username || "Hunter";

        // Inside AuthDrawer's handleSubmit success block:
if (res.data.token) {
  localStorage.setItem("token", res.data.token);
  localStorage.setItem("userName", res.data.name || "Alex");
  localStorage.setItem("userRole", res.data.role || "STUDENT"); // Save role!
          setMessage({ type: "success", text: "Login successful!" });
          
          setTimeout(() => {
            window.location.reload(); 
          }, 500);
        } else {
          setMessage({ type: "error", text: "Backend didn't return a token." });
        }
      } else {
        setMessage({ type: "success", text: "Registered! Switching to login..." });
        setTimeout(() => setIsLogin(true), 1500);
      }
    } catch (err) {
      // This helps you see the REAL error in the console
      console.error("Full Error Object:", err);
      
      const errorMsg = err.response?.data?.message || err.response?.data || "Server connection failed.";
      setMessage({ type: "error", text: typeof errorMsg === 'string' ? errorMsg : "Check Backend Console" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className={`drawer-overlay ${isOpen ? "show" : ""}`} onClick={onClose}></div>
      <div className={`auth-drawer ${isOpen ? "open" : ""}`}>
        <button className="close-btn" onClick={onClose}><FaTimes /></button>
        
        <div className="drawer-header">
          <h2>{isLogin ? "Welcome Back" : "Join Hunter"}</h2>
          <p>{isLogin ? "Sign in to your account." : "Start your journey today."}</p>
        </div>

        {message.text && (
          <div className={`auth-alert ${message.type}`}>{message.text}</div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <>
              <div className="input-box">
                <FaUser className="input-icon" />
                <input name="name" placeholder="Full Name" onChange={handleChange} required />
              </div>
              <div className="input-box">
                <FaBriefcase className="input-icon" />
                <select name="role" onChange={handleChange} className="role-select">
                  <option value="STUDENT">STUDENT</option>
                  <option value="RECRUITER">RECRUITER</option>
                </select>
              </div>
            </>
          )}
          
          <div className="input-box">
            <FaEnvelope className="input-icon" />
            <input name="email" type="email" placeholder="Email" onChange={handleChange} required />
          </div>

          <div className="input-box">
            <FaLock className="input-icon" />
            <input name="password" type="password" placeholder="Password" onChange={handleChange} required />
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Please wait..." : (isLogin ? "Sign In" : "Create Account")}
          </button>
        </form>
      </div>
    </>
  );
};

export default AuthDrawer;