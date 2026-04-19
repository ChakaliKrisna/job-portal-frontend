import React from 'react';
import RecruiterNavbar from "../../components/recruter/RecruterNavbar";
import { 
  FaBriefcase, FaUserTie, FaCalendarCheck, 
  FaCheckCircle, FaTimesCircle, FaChartLine, FaArrowUp, FaEllipsisV 
} from "react-icons/fa";
import "../Styles/rectuterdashboard.css"; 

const RecruiterDashboard = () => {
  const stats = [
    { id: 1, label: "Total Jobs", value: "24", icon: <FaBriefcase />, color: "#6366f1", trend: "+2 this month" },
    { id: 2, label: "Active Jobs", value: "12", icon: <FaCheckCircle />, color: "#10b981", trend: "Stable" },
    { id: 3, label: "Applications", value: "1,248", icon: <FaUserTie />, color: "#3b82f6", trend: "+15% vs last week" },
    { id: 4, label: "Shortlisted", value: "85", icon: <FaCalendarCheck />, color: "#f59e0b", trend: "Pending review" },
  ];

  return (
    <div className="rd-layout">
      <RecruiterNavbar />
      
      {/* MAIN CONTENT AREA - This is offset by the Navbar CSS */}
      <main className="rd-main-content">
        
        {/* WELCOME BANNER */}
        <div className="rd-welcome-banner">
          <div className="banner-text">
            <span className="rd-badge">Hunter Pro Dashboard</span>
            <h1>Welcome back, Recruitment Manager!</h1>
            <p>You have <strong>12 new applications</strong> and <strong>3 interviews</strong> scheduled for today.</p>
            <button className="rd-primary-btn">View Schedule</button>
          </div>
          <div className="banner-visual">
             <FaChartLine className="floating-icon" />
          </div>
        </div>

        {/* STATS SECTION */}
        <div className="rd-stats-grid">
          {stats.map((stat) => (
            <div key={stat.id} className="rd-stat-card glass">
              <div className="stat-icon-circle" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
                {stat.icon}
              </div>
              <div className="stat-info">
                <h3>{stat.value}</h3>
                <p>{stat.label}</p>
                <small className="stat-trend"><FaArrowUp /> {stat.trend}</small>
              </div>
            </div>
          ))}
        </div>

        <div className="rd-content-split">
          {/* LEFT: RECENT ACTIVITY TABLE */}
          <section className="rd-card glass activity-table">
            <div className="card-header">
              <h2>Recent Candidates</h2>
              <button className="text-link">View All Applications</button>
            </div>
            
            <div className="table-responsive">
              <table>
                <thead>
                  <tr>
                    <th>Candidate</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Applied</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <div className="candidate-cell">
                        <div className="c-avatar">RS</div>
                        <span>Rahul Sharma</span>
                      </div>
                    </td>
                    <td>Java Developer</td>
                    <td><span className="status-pill pending">In Review</span></td>
                    <td>2 hours ago</td>
                    <td><FaEllipsisV className="row-action" /></td>
                  </tr>
                  <tr>
                    <td>
                      <div className="candidate-cell">
                        <div className="c-avatar" style={{background: '#10b981'}}>AG</div>
                        <span>Anjali Gupta</span>
                      </div>
                    </td>
                    <td>React UI Engineer</td>
                    <td><span className="status-pill success">Shortlisted</span></td>
                    <td>Yesterday</td>
                    <td><FaEllipsisV className="row-action" /></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* RIGHT: ANALYTICS PREVIEW */}
          <aside className="rd-card dark-card analytics-preview">
             <div className="card-header">
                <h2>Talent Pool Growth</h2>
             </div>
             <div className="growth-metric">
                <div className="metric-circle">
                   <span className="metric-value">84%</span>
                   <span className="metric-label">Efficiency</span>
                </div>
                <p>Your hiring speed is <strong>12% faster</strong> than last month.</p>
             </div>
             <div className="mini-chart-placeholder">
                <div className="bar" style={{height: '40%'}}></div>
                <div className="bar" style={{height: '70%'}}></div>
                <div className="bar active" style={{height: '90%'}}></div>
                <div className="bar" style={{height: '60%'}}></div>
                <div className="bar" style={{height: '80%'}}></div>
             </div>
             <button className="rd-outline-btn">Deep Analytics</button>
          </aside>
        </div>

      </main>
    </div>
  );
};

export default RecruiterDashboard;