import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FaSearch, FaMapMarkerAlt, FaBolt, FaBuilding, 
  FaUserCheck, FaArrowRight, FaLaptopCode, FaBrain, 
  FaPalette, FaCloud, FaShieldAlt, FaBriefcase 
} from "react-icons/fa";
import axios from "axios";
import "./Styles/hero.css";

const API_BASE = "http://localhost:8080/job-portal";

const Hero = () => {
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [remote, setRemote] = useState(false);
  const [displayText, setDisplayText] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const [calculatedStats, setCalculatedStats] = useState({
    totalJobs: 0,
    totalOpenings: 0,
    totalCompanies: 0,
    totalApplicants: 0 
  });
  const [latestJob, setLatestJob] = useState(null);

  const phrases = ["Greatness.", "Innovation.", "Your Future."];
  const frontendSkillsList = ["Java", "Spring Boot", "React", "AWS", "Docker", "PostgreSQL", "Tailwind"];

  const categoryChips = [
    { label: "Software", value: "SOFTWARE_DEVELOPMENT", icon: <FaLaptopCode /> },
    { label: "AI/ML", value: "AI_ML", icon: <FaBrain /> },
    { label: "UI/UX", value: "UI_UX", icon: <FaPalette /> },
    { label: "Cyber Security", value: "CYBER_SECURITY", icon: <FaShieldAlt /> },
    { label: "Cloud Engine", value: "CLOUD_COMPUTING", icon: <FaCloud /> }
  ];

  useEffect(() => {
    const fetchAndCalculateMetrics = async () => {
      try {
        const res = await axios.get(`${API_BASE}/jobs?sort=postedDate,desc&size=50`);
        let jobsArray = [];
        
        if (res.data && Array.isArray(res.data.content)) jobsArray = res.data.content;
        else if (Array.isArray(res.data)) jobsArray = res.data;

        if (jobsArray.length > 0) {
          const totalJobs = jobsArray.length;
          const totalOpenings = jobsArray.reduce((sum, job) => sum + (job.openings || 0), 0);
          const uniqueCompanyIds = new Set(jobsArray.map(job => job.companyPublicId).filter(Boolean));
          const totalCompanies = uniqueCompanyIds.size;
          const totalApplicants = jobsArray.reduce((sum, job) => sum + (job.applicationsCount || 0), 0);

          setCalculatedStats({ totalJobs, totalOpenings, totalCompanies, totalApplicants });
          const recentJob = jobsArray[0];
          setLatestJob({ title: recentJob.title, companyName: recentJob.companyName || "Verified Enterprise" });
        }
      } catch (err) { console.error("Error fetching metrics:", err); }
    };
    fetchAndCalculateMetrics();
  }, []);

  useEffect(() => {
    let i = 0, j = 0;
    let currentPhrase = [];
    let isDeleting = false;

    function type() {
      const fullPhrase = phrases[i];
      if (isDeleting) currentPhrase.pop();
      else currentPhrase.push(fullPhrase[j]);
      setDisplayText(currentPhrase.join(""));

      if (!isDeleting && currentPhrase.length === fullPhrase.length) setTimeout(() => (isDeleting = true), 2000);
      else if (isDeleting && currentPhrase.length === 0) {
        isDeleting = false;
        i = (i + 1) % phrases.length;
        j = 0;
      } else j = isDeleting ? j : j + 1;
      setTimeout(type, isDeleting ? 80 : 150);
    }
    const timer = setTimeout(type, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    let url = `/jobs?keyword=${encodeURIComponent(query.trim())}&location=${encodeURIComponent(location.trim())}`;
    if (remote) url += "&workMode=REMOTE";
    navigate(url);
  };

  return (
    <section className="hero-wrap">
      <div className="hero-container">
        
        {/* Left Side Content */}
        <div className="hero-content">
          <h1>Find Your Dream Job.<br />Build Your Future.</h1>
          <p className="subheadline">
            Launch your career with top companies. Get directly connected 
            with engineering leads through our dynamic platform.
          </p>

          <form className="search-pill" onSubmit={handleSearch}>
            <div className="search-input-group">
              <FaSearch className="search-icon" />
              <input type="text" placeholder="Job title, skills..." value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
            <div className="divider" />
            <div className="search-input-group">
              <FaMapMarkerAlt className="search-icon" />
              <input type="text" placeholder="City or State" value={location} onChange={(e) => setLocation(e.target.value)} />
            </div>
            <button type="submit" className="search-btn">Find Roles</button>
          </form>

          <div className="category-chips-row">
            {categoryChips.map((chip) => (
              <div key={chip.value} className="category-chip" onClick={() => navigate(`/jobs?category=${chip.value}`)}>
                {chip.icon} {chip.label}
              </div>
            ))}
          </div>

          <div className="trusted-by">
            <span>Trusted by:</span>
            <div className="brand-list">TCS | Infosys | Wipro | Accenture</div>
          </div>
        </div>

        {/* Right Side Visual (Bento Grid) */}
        <div className="hero-visual">
          <div className="stats-grid">
            <div className="stat-card"><h3>{calculatedStats.totalOpenings}</h3><p>Open Jobs</p></div>
            <div className="stat-card"><h3>{calculatedStats.totalCompanies}</h3><p>Active Firms</p></div>
            <div className="stat-card"><h3>{calculatedStats.totalApplicants}</h3><p>Applications</p></div>
            <div className="stat-card"><h3>{calculatedStats.totalJobs}</h3><p>Active Streams</p></div>
          </div>

          {latestJob && (
            <div className="glass-card floating-alert">
              <FaBolt className="alert-icon" />
              <div>
                <strong>New Job Posted</strong>
                <p>{latestJob.title} at {latestJob.companyName}</p>
              </div>
            </div>
          )}
        </div>

      </div>
    </section>
  );
};

export default Hero;