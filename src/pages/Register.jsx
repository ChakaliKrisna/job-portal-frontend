import { useState } from "react";
import axios from "axios";
import "../components/Styles/home.css"; 

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); // State for matching
  const [name, setName] = useState(""); 
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();

    // --- FRONTEND CONSTRAINTS ---
    
    // 1. Password Length Check
    if (password.length < 8) {
      return setMessage({ type: "error", text: "Password must be at least 8 characters long." });
    }

    // 2. Confirm Password Match Check
    if (password !== confirmPassword) {
      return setMessage({ type: "error", text: "Passwords do not match!" });
    }

    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await axios.post("http://localhost:8080/auth/register", {
        email,
        password,
        name,
        role: "STUDENT",
      });

      const serverData = response.data;

      // Handle the "Email already exists" 200 OK case
      if (typeof serverData === "string" && serverData.toLowerCase().includes("exists")) {
        setMessage({ type: "error", text: serverData });
      } else {
        setMessage({ 
          type: "success", 
          text: "Registration successful! You can now login." 
        });
      }
    } catch (error) {
      const errorMsg = error.response?.data || "Something went wrong. Please try again.";
      setMessage({ type: "error", text: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-wrapper" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <div className="job-form-container" style={{ width: '100%', maxWidth: '400px' }}>
        <h2 className="title-modern" style={{ fontSize: '1.8rem', textAlign: 'center' }}>Create Account</h2>
        
        {message.text && (
          <div className={`message-banner ${message.type}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleRegister} style={{ marginTop: '20px' }}>
          <label>Full Name</label>
          <input 
            type="text"
            className="input-field" 
            placeholder="John Doe" 
            required
            minLength="3" // Constraint: Name too short
            onChange={(e) => setName(e.target.value)} 
          />

          <label>Email Address</label>
          <input 
            type="email"
            className="input-field" 
            placeholder="name@company.com" 
            required
            onChange={(e) => setEmail(e.target.value)} 
          />

          <label>Password</label>
          <input 
            type="password" 
            className="input-field" 
            placeholder="Min. 8 characters" 
            required
            minLength="8" // HTML5 constraint
            onChange={(e) => setPassword(e.target.value)} 
          />

          <label>Confirm Password</label>
          <input 
            type="password" 
            className="input-field" 
            placeholder="Re-enter password" 
            required
            onChange={(e) => setConfirmPassword(e.target.value)} 
          />

          <button 
            type="submit" 
            className="newsletter-btn" 
            style={{ 
                width: '100%', 
                opacity: loading ? 0.7 : 1, 
                marginTop: '15px',
                cursor: loading ? 'not-allowed' : 'pointer' 
            }}
            disabled={loading}
          >
            {loading ? "Validating..." : "Create Account"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Register;