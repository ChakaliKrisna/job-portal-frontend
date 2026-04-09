import React, { useState } from "react";
import { FaUserEdit, FaCheckCircle, FaHourglassHalf, FaFileAlt } from "react-icons/fa";
import "../components/Styles/dashboard.css";

const UserDashboard = () => {
  // Mock User Data - In a real app, fetch this from your backend/localStorage
  const [userData] = useState({
    name: localStorage.getItem("userName") || "Candidate",
    bio: "Passionate Frontend Developer looking for React opportunities.",
    skills: ["React", "JavaScript", "CSS", "Node.js"],
    resume: "resume_v1.pdf",
    stats: { applied: 12, shortlisted: 3, interviews: 1 }
  });

  // Profile Strength Logic
  const calculateStrength = () => {
    let score = 0;
    if (userData.bio) score += 20;
    if (userData.resume) score += 30;
    if (userData.skills.length > 0) score += 50;
    return score;
  };

  const strength = calculateStrength();

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Welcome back, {userData.name}! 👋</h1>
        <p>Monitor your progress and manage your applications.</p>
      </header>

      {/* 1. Profile Strength Meter */}
      <section className="bento-card strength-section">
        <div className="meter-info">
          <span>Profile Strength: <strong>{strength}%</strong></span>
          <div className="progress-bar-bg">
            <div className="progress-bar-fill" style={{ width: `${strength}%` }}></div>
          </div>
        </div>
        <button className="edit-btn"><FaUserEdit /> Complete Profile</button>
      </section>

      {/* 2. Bento Grid Stats */}
      <div className="bento-grid">
        <div className="bento-card stat-card blue">
          <FaFileAlt className="stat-icon" />
          <h3>{userData.stats.applied}</h3>
          <p>Jobs Applied</p>
        </div>
        <div className="bento-card stat-card green">
          <FaCheckCircle className="stat-icon" />
          <h3>{userData.stats.shortlisted}</h3>
          <p>Shortlisted</p>
        </div>
        <div className="bento-card stat-card yellow">
          <FaHourglassHalf className="stat-icon" />
          <h3>{userData.stats.interviews}</h3>
          <p>Interviews</p>
        </div>

        {/* Bio Bento Box */}
        <div className="bento-card bio-card">
          <h3>Professional Summary</h3>
          <p>{userData.bio}</p>
        </div>

        {/* Skills Bento Box */}
        <div className="bento-card skills-card">
          <h3>Top Skills</h3>
          <div className="skills-tags">
            {userData.skills.map((skill, index) => (
              <span key={index} className="skill-pill">{skill}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;