import React from "react";
import { FaExternalLinkAlt, FaClock, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import "../components/Styles/applications.css";

const MyApplications = () => {
  // Mock Applications Data
  const applications = [
    {
      id: 1,
      role: "Frontend Developer",
      company: "Google",
      appliedDate: "April 05, 2026",
      status: "Shortlisted", // Options: Applied, Shortlisted, Not Selected
      logo: "https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_Reference_icon.png"
    },
    {
      id: 2,
      role: "Java Intern",
      company: "Tsar IT",
      appliedDate: "April 08, 2026",
      status: "Applied",
      logo: "https://cdn-icons-png.flaticon.com/512/5968/5968282.png"
    }
  ];

  const getStatusClass = (status) => {
    switch (status) {
      case "Shortlisted": return "status-green";
      case "Applied": return "status-blue";
      case "Not Selected": return "status-red";
      default: return "";
    }
  };

  return (
    <div className="applications-container">
      <div className="app-header">
        <h2>My Applications</h2>
        <p>Track the status of your {applications.length} active applications.</p>
      </div>

      <div className="applications-table-wrapper">
        <table className="apps-table">
          <thead>
            <tr>
              <th>Company & Role</th>
              <th>Applied On</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((app) => (
              <tr key={app.id}>
                <td className="company-cell">
                  <img src={app.logo} alt="" className="mini-logo" />
                  <div>
                    <div className="role-title">{app.role}</div>
                    <div className="company-name">{app.company}</div>
                  </div>
                </td>
                <td>
                  <div className="date-box"><FaClock /> {app.appliedDate}</div>
                </td>
                <td>
                  <span className={`status-badge ${getStatusClass(app.status)}`}>
                    {app.status === "Shortlisted" && <FaCheckCircle />}
                    {app.status === "Not Selected" && <FaTimesCircle />}
                    {app.status}
                  </span>
                </td>
                <td>
                  <button className="view-app-btn">
                    View Details <FaExternalLinkAlt />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MyApplications;