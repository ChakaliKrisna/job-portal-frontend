import { useState } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "https://job-portal-backend-365l.onrender.com";

function ForgotPassword() {

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {

    e.preventDefault();
    setLoading(true);

    try {

      const res = await axios.post(
        `${API}/auth/forgot-password`,
        { email }
      );

      setMessage(res.data.message);

    } catch (err) {

      setMessage(
        err.response?.data?.message ||
        "Failed to send reset link"
      );

    } finally {

      setLoading(false);

    }
  };

  return (
    <div className="container">

      <h2>Forgot Password</h2>

      <form onSubmit={handleSubmit}>

        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Sending..." : "Send Reset Link"}
        </button>

      </form>

      {message && <p>{message}</p>}

    </div>
  );
}

export default ForgotPassword;