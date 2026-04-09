import React from "react";
import "./Styles/stats.css"; // ✅ correct relative path

const statsData = [
  { number: "500+", label: "Jobs Posted", icon: "💼" },
  { number: "200+", label: "Companies Registered", icon: "🏢" },
  { number: "1000+", label: "Applications Submitted", icon: "📄" },
];

const Stats = () => (
  <section className="stats">
    <div className="stats-grid">
      {statsData.map((stat, index) => (
        <div key={index} className="stat-card">
          <span className="stat-icon">{stat.icon}</span>
          <h4>{stat.number}</h4>
          <p>{stat.label}</p>
        </div>
      ))}
    </div>
  </section>
);

export default Stats;
