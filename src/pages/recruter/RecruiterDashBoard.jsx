import React from 'react';
import RecruiterNavbar from "../../components/recruter/RecruterNavbar";
import { 
  FaBriefcase, 
  FaUserTie, 
  FaCalendarCheck, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaChartLine 
} from "react-icons/fa";
import "../../components/Styles/home.css"; 

const RecruiterDashboard = () => {
  // Mock data for the dashboard (Later this will come from your Spring Boot API)
  const stats = [
    { id: 1, label: "Total Jobs", value: "24", icon: <FaBriefcase />, color: "#3b82f6" },
    { id: 2, label: "Active Jobs", value: "12", icon: <FaCheckCircle />, color: "#10b981" },
    { id: 3, label: "Total Applications", value: "1,248", icon: <FaUserTie />, color: "#6366f1" },
    { id: 4, label: "Shortlisted", value: "85", icon: <FaCalendarCheck />, color: "#f59e0b" },
    { id: 5, label: "Hired", value: "14", icon: <FaCheckCircle />, color: "#8b5cf6" },
    { id: 6, label: "Rejected", value: "312", icon: <FaTimesCircle />, color: "#ef4444" },
  ];

  return (
    <div className="home-wrapper">
      {/* <RecruiterNavbar /> */}
      
      <main className="section-container" style={{ padding: '2rem' }}>
        <header className="section-header" style={{ marginBottom: '30px' }}>
          <span className="badge">Employer Console</span>
          <h1 className="title-modern">Recruitment Overview</h1>
          <p style={{ color: '#94a3b8' }}>Welcome back! Here's what's happening with your job postings today.</p>
        </header>

        {/* 1. Stats Grid - High Impact Numbers */}
        <div className="stats-grid" style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '20px' 
        }}>
          {stats.map((stat) => (
            <div key={stat.id} className="stat-card-green" style={{ 
              borderLeft: `5px solid ${stat.color}`,
              padding: '20px',
              background: '#ffffff',
              borderRadius: '12px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              <div style={{ color: stat.color, fontSize: '1.5rem' }}>{stat.icon}</div>
              <h3 style={{ fontSize: '1.8rem', margin: 0, color: '#1e293b' }}>{stat.value}</h3>
              <p style={{ margin: 0, color: '#64748b', fontWeight: '500' }}>{stat.label}</p>
            </div>
          ))}
        </div>

        {/* 2. Main Content Area (Charts & Recent Activity) */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '2fr 1fr', 
          gap: '30px', 
          marginTop: '40px' 
        }}>
          
          {/* Left Side: Hiring Funnel / Activity */}
          <section className="activity-card" style={{ 
            background: '#fff', 
            padding: '25px', 
            borderRadius: '15px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.25rem', color: '#1e293b' }}>Recent Applicants</h2>
              <button style={{ color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer' }}>View All</button>
            </div>
            
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>
                  <th style={{ padding: '12px 0' }}>Candidate</th>
                  <th>Job Role</th>
                  <th>Status</th>
                  <th>Applied</th>
                </tr>
              </thead>
              <tbody style={{ color: '#334155' }}>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '15px 0' }}>Rahul Sharma</td>
                  <td>Java Developer</td>
                  <td><span style={{ color: '#f59e0b', background: '#fef3c7', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>Pending</span></td>
                  <td>2 hours ago</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '15px 0' }}>Anjali Gupta</td>
                  <td>React UI Engineer</td>
                  <td><span style={{ color: '#10b981', background: '#d1fae5', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>Shortlisted</span></td>
                  <td>Yesterday</td>
                </tr>
              </tbody>
            </table>
          </section>

          {/* Right Side: Quick Analytics */}
          <section style={{ 
            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', 
            padding: '25px', 
            borderRadius: '15px', 
            color: 'white' 
          }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FaChartLine /> Performance
            </h2>
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <p style={{ color: '#94a3b8' }}>Job reach is up by 15% this week.</p>
              {/* Placeholder for actual Chart.js / Recharts component */}
              <div style={{ height: '150px', border: '1px dashed #334155', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '20px' }}>
                Chart Visual Coming Soon
              </div>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
};

export default RecruiterDashboard;