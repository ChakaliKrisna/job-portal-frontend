import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaLock, FaKey } from "react-icons/fa";
import "../components/Styles/ResetPassword.css";

const API = import.meta.env.VITE_API_URL || "https://job-portal-backend-365l.onrender.com";

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "Password parameters do not align." });
      setLoading(false);
      return;
    }

    if (newPassword.length < 8) {
      setMessage({ type: "error", text: "Security structure must be at least 8 elements." });
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post(`${API}/auth/reset-password`, {
        token,
        newPassword
      });

      setMessage({ type: "success", text: res.data.message || "Credential reset successful! Routing to system baseline..." });
      
      setTimeout(() => {
        navigate("/");
      }, 2200);

    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Cryptographic reset verification failed."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-page-canvas">
      <div className="reset-card-viewport">
        <div className="premium-header">
          <div className="premium-icon-halo">
            <FaKey />
          </div>
          <h2>Reset Authorization Key</h2>
          <p>Re-establish your decentralized profile encryption profile below.</p>
        </div>

        {message.text && (
          <div className={`premium-alert ${message.type}`}>
            <span>{message.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="premium-form">
          <div className="premium-input-wrapper">
            <FaLock className="wrapper-icon" />
            <input
              type="password"
              placeholder=" "
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <label className="floating-label">New Password Block</label>
          </div>

          <div className="premium-input-wrapper">
            <FaLock className="wrapper-icon" />
            <input
              type="password"
              placeholder=" "
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <label className="floating-label">Confirm New Password Block</label>
          </div>

          <button type="submit" className="premium-submit-btn" disabled={loading}>
            {loading ? <span className="premium-spinner"></span> : <span>Commit New Credentials</span>}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ResetPassword;