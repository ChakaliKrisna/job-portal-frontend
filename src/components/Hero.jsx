import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FaSearch, FaMapMarkerAlt, FaBolt, FaBuilding, 
  FaUserCheck, FaArrowRight, FaLaptopCode, FaBrain, 
  FaPalette, FaCloud, FaShieldAlt, FaBriefcase 
} from "react-icons/fa";
import axios from "axios";
import "./Styles/hero.css";

// 1. Normalize backend string declaration safely to strip trailing slashes automatically
const RAW_API = import.meta.env.VITE_API_URL || "https://job-portal-backend-365l.onrender.com";
const API_BASE = RAW_API.endsWith("/") ? RAW_API.slice(0, -1) : RAW_API;

const Hero = () => {
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [remote, setRemote] = useState(false);
  const [displayText, setDisplayText] = useState("");
  
  const [calculatedStats, setCalculatedStats] = useState({
    totalJobs: 0,
    totalOpenings: 0,
    totalCompanies: 0,
    totalApplicants: 0 
  });
  const [latestJob, setLatestJob] = useState(null);

  // Human-focused typewriter phrases
  const phrases = ["your career.", "your future in tech.", "your potential."];
  const frontendSkillsList = ["Java", "Spring Boot", "React", "AWS", "Docker", "PostgreSQL", "Tailwind"];

  // Polished category chips for better readability
  const categoryChips = [
    { label: "Software Development", value: "SOFTWARE_DEVELOPMENT", icon: <FaLaptopCode /> },
    { label: "AI & Machine Learning", value: "AI_ML", icon: <FaBrain /> },
    { label: "UI/UX Design", value: "UI_UX", icon: <FaPalette /> },
    { label: "Cybersecurity", value: "CYBER_SECURITY", icon: <FaShieldAlt /> },
    { label: "Cloud Computing", value: "CLOUD_COMPUTING", icon: <FaCloud /> }
  ];

  // Fetch metrics safely from Spring Boot
  useEffect(() => {
    const fetchAndCalculateMetrics = async () => {
      try {
        // 2. FIXED: Applied secure base target context structure cleanly
        const res = await axios.get(`${API_BASE}/job-portal/jobs?sort=postedDate,desc&size=50`);
        let jobsArray = [];
        
        if (res.data && Array.isArray(res.data.content)) {
          jobsArray = res.data.content;
        } else if (Array.isArray(res.data)) {
          jobsArray = res.data;
        }

        if (jobsArray.length > 0) {
          const totalJobs = jobsArray.length;
          
          // Calculate openings safely
          const totalOpenings = jobsArray.reduce((sum, job) => sum + (job.openings || 1), 0);
          
          // Map unique companies securely
          const uniqueCompanyNames = new Set(jobsArray.map(job => job.companyName).filter(Boolean));
          const totalCompanies = uniqueCompanyNames.size;
          
          // Calculate applicants safely
          const totalApplicants = jobsArray.reduce((sum, job) => sum + (job.applicationsCount || 0), 0);

          setCalculatedStats({ totalJobs, totalOpenings, totalCompanies, totalApplicants });
          
          const recentJob = jobsArray[0];
          setLatestJob({ title: recentJob.title, companyName: recentJob.companyName || "Top Company" });
        }
      } catch (err) { 
        console.error("Error fetching metrics from endpoint gateway:", err); 
      }
    };
    fetchAndCalculateMetrics();
  }, []);

  // Strict-Mode Stable Typewriter Loop
  useEffect(() => {
    let phraseIdx = 0;
    let charIdx = 0;
    let isDeleting = false;
    let timeoutId = null;

    const tick = () => {
      const currentFullText = phrases[phraseIdx];
      
      if (isDeleting) {
        setDisplayText(currentFullText.substring(0, charIdx - 1));
        charIdx--;
      } else {
        setDisplayText(currentFullText.substring(0, charIdx + 1));
        charIdx++;
      }

      let typeSpeed = isDeleting ? 60 : 120;

      if (!isDeleting && charIdx === currentFullText.length) {
        typeSpeed = 2000; 
        isDeleting = true;
      } else if (isDeleting && charIdx === 0) {
        isDeleting = false;
        phraseIdx = (phraseIdx + 1) % phrases.length;
        typeSpeed = 400; 
      }

      timeoutId = setTimeout(tick, typeSpeed);
    };

    timeoutId = setTimeout(tick, 500);
    return () => clearTimeout(timeoutId);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    let url = `/jobs?keyword=${encodeURIComponent(query.trim())}&location=${encodeURIComponent(location.trim())}`;
    if (remote) url += "&workMode=REMOTE";
    navigate(url);
  };

  return (
    <section className="modern-hero-wrap">
      <div className="hero-glow-orb orb-1"></div>
      <div className="hero-glow-orb orb-2"></div>

      <div className="modern-hero-container">
        {/* Left Interactive Panel */}
        <div className="hero-content-deck">
          <div className="context-tagline">
            <span className="pulse-dot"></span>
            Accelerating <span className="typewriter-text">{displayText}</span>
          </div>

          <h1 className="hero-main-title">
            Find your dream job. <br />
            <span className="gradient-text">Start your tech career today.</span>
          </h1>
          
          <p className="hero-subheadline">
            Skip long queues. Connect directly with recruiters and top companies 
            hiring for roles that match your technical expertise and career goals.
          </p>

          <form className="premium-search-pill" onSubmit={handleSearch}>
            <div className="search-field-segment">
              <FaSearch className="pill-segment-icon" />
              <input 
                type="text" 
                placeholder="Search jobs, skills, or companies..." 
                value={query} 
                onChange={(e) => setQuery(e.target.value)} 
              />
            </div>
            
            <div className="pill-segment-divider" />
            
            <div className="search-field-segment">
              <FaMapMarkerAlt className="pill-segment-icon" />
              <input 
                type="text" 
                placeholder="Location (city or remote)" 
                value={location} 
                onChange={(e) => setLocation(e.target.value)} 
              />
            </div>

            <div className="pill-segment-divider" />

            <div className="remote-toggle-module">
              <label className="switch-container">
                <input 
                  type="checkbox" 
                  checked={remote} 
                  onChange={(e) => setRemote(e.target.checked)} 
                />
                <span className="toggle-slider"></span>
              </label>
              <span className="toggle-label">Remote Only</span>
            </div>
            
            <button type="submit" className="pill-submit-action">
              <span>Search Jobs</span>
              <FaArrowRight size={13} />
            </button>
          </form>

          <div className="hero-category-chips-deck">
            {categoryChips.map((chip) => (
              <button 
                type="button"
                key={chip.value} 
                className="modern-category-chip" 
                onClick={() => navigate(`/jobs?category=${chip.value}`)}
              >
                {chip.icon}
                <span>{chip.label}</span>
              </button>
            ))}
          </div>

          <div className="trending-stack-row">
            <span className="stack-label">Popular Skills:</span>
            <div className="stack-tags-wrapper">
              {frontendSkillsList.map((skill) => (
                <span key={skill} className="stack-mini-tag">{skill}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Dashboard Visualization Block */}
        <div className="hero-visual-deck">
          <div className="bento-metrics-grid">
            
            <div className="metric-bento-card card-glow-blue">
              <div className="card-header-icon"><FaBriefcase /></div>
              <h3>{calculatedStats.totalOpenings || "120+"}</h3>
              <p>Available Jobs</p>
            </div>

            <div className="metric-bento-card card-glow-purple">
              <div className="card-header-icon"><FaBuilding /></div>
              <h3>{calculatedStats.totalCompanies || "45"}</h3>
              <p>Hiring Companies</p>
            </div>

            <div className="metric-bento-card card-glow-emerald">
              <div className="card-header-icon"><FaUserCheck /></div>
              <h3>{calculatedStats.totalApplicants || "1.8K"}</h3>
              <p>Job Seekers</p>
            </div>

            <div className="metric-bento-card card-glow-amber">
              <div className="card-header-icon"><FaBolt /></div>
              <h3>{calculatedStats.totalJobs || "8"}</h3>
              <p>Active Listings</p>
            </div>

          </div>

          {latestJob && (
            <div className="glass-stream-alert-card">
              <div className="alert-pulse-icon-halo">
                <FaBolt />
              </div>
              <div className="alert-stream-details">
                <div className="stream-badge-row">
                  <span className="live-pill">Just Posted</span>
                  <span className="time-stamp">Just now</span>
                </div>
                <h4>{latestJob.title}</h4>
                <p>by {latestJob.companyName}</p>
              </div>
            </div>
          )}
        </div>

      </div>
    </section>
  );
};

export default Hero;