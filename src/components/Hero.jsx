import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaMapMarkerAlt, FaBolt, FaBuilding, FaUserCheck, FaArrowRight } from "react-icons/fa";
import "./Styles/hero.css";

const Hero = () => {
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [displayText, setDisplayText] = useState("");
  const navigate = useNavigate();

  const phrases = ["Greatness.", "Innovation.", "Your Future."];
  
  // Typewriter Effect for the Headline
  useEffect(() => {
    let i = 0;
    let j = 0;
    let currentPhrase = [];
    let isDeleting = false;

    function type() {
      const fullPhrase = phrases[i];
      if (isDeleting) {
        currentPhrase.pop();
      } else {
        currentPhrase.push(fullPhrase[j]);
      }

      setDisplayText(currentPhrase.join(""));

      if (!isDeleting && currentPhrase.length === fullPhrase.length) {
        setTimeout(() => (isDeleting = true), 2000);
      } else if (isDeleting && currentPhrase.length === 0) {
        isDeleting = false;
        i = (i + 1) % phrases.length;
        j = 0;
      } else {
        j = isDeleting ? j : j + 1;
      }
      setTimeout(type, isDeleting ? 100 : 200);
    }
    type();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query && !location) return;
    navigate(`/jobs?title=${encodeURIComponent(query)}&location=${encodeURIComponent(location)}`);
  };

  return (
    <section className="hero-wrap">
      {/* Background Animated Elements */}
      <div className="orb orb-1"></div>
      <div className="orb orb-2"></div>

      <div className="hero-container">
        <div className="hero-content">
          <div className="live-indicator">
            <span className="dot"></span>
            <p>2,400+ Remote Jobs Posted This Week</p>
          </div>
          
          <h1>
            Hunt for <br />
            <span className="highlight">{displayText}</span>
            <span className="cursor">|</span>
          </h1>
          
          <p className="subheadline">
            The next generation of tech careers. Skip the noise and get 
            directly connected with engineering leads at top startups.
          </p>

          <div className="search-glass-container">
            <form className="search-pill" onSubmit={handleSearch}>
              <div className="search-input-group">
                <FaSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Java, React, System Design..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <div className="divider" />
              <div className="search-input-group">
                <FaMapMarkerAlt className="search-icon" />
                <input
                  type="text"
                  placeholder="City or Remote"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
              <button type="submit" className="search-btn">
                <span>Find Roles</span>
                <FaArrowRight />
              </button>
            </form>
          </div>

          <div className="trending-row">
            <span className="trending-label">Priority Hiring:</span>
            {["Spring Boot", "Full Stack", "Data Engine", "Cloud"].map((tag) => (
              <button key={tag} className="tag-pill" onClick={() => setQuery(tag)}>
                {tag}
              </button>
            ))}
          </div>
        </div>

        <div className="hero-visual">
          <div className="glass-card main-card">
            <div className="card-header">
              <div className="user-avatar">AS</div>
              <div>
                <h4>Alexander Smith</h4>
                <p>Full Stack Engineer</p>
              </div>
            </div>
            <div className="card-stats">
              <div className="s-item"><span>4</span> Applications</div>
              <div className="s-item"><span>2</span> Interviews</div>
            </div>
          </div>
          
          <div className="glass-card floating-alert">
            <div className="alert-icon"><FaBolt /></div>
            <div>
              <p>New Match</p>
              <strong>Backend Lead @ Stripe</strong>
            </div>
          </div>
        </div>
      </div>

      <div className="bottom-bar">
        <div className="stat-box">
          <FaBuilding /> <strong>5,000+</strong> Companies
        </div>
        <div className="stat-box">
          <FaUserCheck /> <strong>12k+</strong> Placements
        </div>
        <div className="stat-box">
          <FaBolt /> <strong>48h</strong> Response Time
        </div>
      </div>
    </section>
  );
};

export default Hero;