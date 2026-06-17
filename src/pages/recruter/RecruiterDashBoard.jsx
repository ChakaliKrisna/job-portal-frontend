import React, { useEffect, useState, useMemo, useCallback } from "react";
import RecruiterNavbar from "../../components/recruter/RecruterNavbar";
import api from "../../api/api";
import "../../pages/recruter/RecruiterDashBoard.css";

import {
  FaBriefcase,
  FaUserTie,
  FaCheckCircle,
  FaCalendarCheck,
  FaGlobe,
  FaArrowUp,
  FaUsers,
  FaChartPie,
  FaDatabase
} from "react-icons/fa";

import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);

export default function RecruiterDashboard() {
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    shortlisted: 0,
    interviews: 0
  });

  const [platformStats, setPlatformStats] = useState({
    totalUsers: 0,
    totalRecruiters: 0,
    totalStudents: 0,
    totalJobs: 0,
    totalApplications: 0,
    activeJobs: 0
  });

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const [analyticsRes, platformRes] = await Promise.all([
        api.get("/job-portal/applications/dashboard/analytics"),
        api.get("/job-portal/applications/dashboard/platform-overview")
      ]);

      if (analyticsRes.data) setStats(analyticsRes.data);
      if (platformRes.data) setPlatformStats(platformRes.data);
    } catch (err) {
      console.error("Dashboard engine failed initialization:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // MEMOIZED CHART LAYOUT SYSTEMS (Prevents raw frame component canvas leaks)
  const baseChartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          boxWidth: 8,
          usePointStyle: true,
          font: { family: "Inter, sans-serif", size: 12, weight: "500" },
          padding: 20,
          color: "#64748b"
        },
      },
    },
  }), []);

  const barChartOptions = useMemo(() => ({
    ...baseChartOptions,
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: "#f1f5f9", drawTicks: false },
        border: { dash: [5, 5] },
        ticks: { font: { size: 11, family: "Inter" }, color: "#94a3b8", precision: 0 }
      },
      x: {
        grid: { display: false },
        ticks: { font: { size: 11, family: "Inter", weight: "500" }, color: "#64748b" }
      }
    }
  }), [baseChartOptions]);

  const pipelinePieData = useMemo(() => ({
    labels: ["Applications", "Shortlisted", "Interviews"],
    datasets: [
      {
        data: [stats.totalApplications ?? 0, stats.shortlisted ?? 0, stats.interviews ?? 0],
        backgroundColor: ["#3b82f6", "#10b981", "#f59e0b"],
        hoverOffset: 4,
        borderWidth: 0,
      },
    ],
  }), [stats]);

  const userCompositionBarData = useMemo(() => ({
    labels: ["Total Users", "Students", "Recruiters"],
    datasets: [
      {
        label: "Registered Accounts",
        data: [platformStats.totalUsers ?? 0, platformStats.totalStudents ?? 0, platformStats.totalRecruiters ?? 0],
        backgroundColor: "#6366f1",
        hoverBackgroundColor: "#4f46e5",
        borderRadius: 8,
        barThickness: 32,
      },
    ],
  }), [platformStats]);

  if (loading) {
    return <LoaderScreen />;
  }

  return (
    <div className="rd-layout">
      <RecruiterNavbar />

      <main className="rd-main-content">
        
        {/* BANNER HEADER CONTAINER */}
        <WorkspaceHeader />

        {/* SECTION I: PERSONAL OPERATIONAL METRICS */}
        <SectionHeader 
          icon={<FaChartPie />} 
          title="Personal Operational Overview" 
          subtitle="Hiring activity linked directly to your recruiter profile credentials." 
        />

        <div className="rd-stats-grid">
          <StatCard icon={<FaBriefcase />} label="Total Jobs Listed" value={stats.totalJobs} accentClass="indigo" />
          <StatCard icon={<FaCheckCircle />} label="Active Openings" value={stats.activeJobs} accentClass="emerald" />
          <StatCard icon={<FaUserTie />} label="Gross Applications" value={stats.totalApplications} accentClass="blue" />
          <StatCard icon={<FaCalendarCheck />} label="Shortlisted / Interviews" value={`${stats.shortlisted ?? 0} / ${stats.interviews ?? 0}`} accentClass="amber" />
        </div>

        {/* SECTION II: ANALYTICS VISUALIZATION CHARTS */}
        <div className="rd-charts-matrix">
          <div className="rd-chart-panel">
            <div className="panel-header">
              <h3>Application Funnel Breakdown</h3>
              <p>Hiring pipeline stages for your active job listings</p>
            </div>
            <div className="rd-chart-wrapper">
              <Pie data={pipelinePieData} options={baseChartOptions} />
            </div>
          </div>

          <div className="rd-chart-panel span-two-columns">
            <div className="panel-header">
              <h3>Ecosystem Demographics</h3>
              <p>Distribution profiles across global platform signups</p>
            </div>
            <div className="rd-chart-wrapper">
              <Bar data={userCompositionBarData} options={barChartOptions} />
            </div>
          </div>
        </div>

        {/* SECTION III: GLOBAL MONITORING BASELINE */}
        <SectionHeader 
          icon={<FaGlobe />} 
          title="Macro Platform Ecosystem" 
          subtitle="Global baseline indices and aggregated cluster performance tracking." 
        />

        <MacroPlatformConsole platformStats={platformStats} />

      </main>
    </div>
  );
}

/* ==========================================================================
   SUB-COMPONENT ARCHITECTURES
   ========================================================================== */

const LoaderScreen = () => (
  <div className="rd-loader-screen">
    <div className="rd-spinner-wrapper">
      <div className="rd-spinner-ring"></div>
      <div className="rd-spinner-dot"></div>
    </div>
    <p className="rd-loader-text">Compiling Macro Intelligence Workspace...</p>
  </div>
);

const WorkspaceHeader = () => (
  <div className="rd-welcome-banner">
    <div className="banner-left">
      <div className="banner-badge">
        <FaDatabase /> Workspace Operations
      </div>
      <h1>Recruiter Analytics Dashboard</h1>
      <p>Real-time hiring metrics, core pipeline indicators, and global platform telemetry tracking.</p>
    </div>
    <div className="live-status-container">
      <span className="live-pulse-ring">
        <span className="pulse-wave"></span>
        <span className="pulse-dot"></span>
      </span>
      <span className="live-status-tag">Live Sync Active</span>
    </div>
  </div>
);

const SectionHeader = ({ icon, title, subtitle }) => (
  <div className="rd-section-title">
    <h2>{icon} {title}</h2>
    <p>{subtitle}</p>
  </div>
);

const StatCard = ({ icon, label, value, accentClass }) => {
  const displayValue = typeof value === 'number' ? value.toLocaleString() : (value ?? 0);
  
  return (
    <div className={`rd-stat-card theme-${accentClass}`}>
      <div className="card-content">
        <div className="card-info">
          <p className="card-label">{label}</p>
          <h2 className="card-value">{displayValue}</h2>
        </div>
        <div className="icon-badge">{icon}</div>
      </div>
      <div className="card-progress-bar">
        <div className="progress-fill"></div>
      </div>
    </div>
  );
};

const MacroPlatformConsole = ({ platformStats }) => (
  <div className="rd-macro-console">
    <div className="macro-card-main">
      <div className="macro-globe-icon">
        <FaGlobe className="spinning-globe" />
      </div>
      <div className="macro-meta-text">
        <h3>Systemic Infrastructure Log</h3>
        <p>Aggregated telemetry operating dynamically across the complete cloud cluster platform instances.</p>
      </div>
    </div>

    <div className="macro-metrics-row">
      <div className="macro-metric-tile">
        <div className="tile-header">
          <span className="tile-icon students"><FaUsers /></span>
          <p>Global Talent Pool</p>
        </div>
        <div className="tile-body">
          <h3>{(platformStats.totalStudents ?? 0).toLocaleString()}</h3>
          <span className="growth-tag"><FaArrowUp /> Verified Candidates</span>
        </div>
      </div>

      <div className="macro-metric-tile">
        <div className="tile-header">
          <span className="tile-icon jobs"><FaBriefcase /></span>
          <p>System Post Volume</p>
        </div>
        <div className="tile-body">
          <h3>{(platformStats.totalJobs ?? 0).toLocaleString()}</h3>
          <span className="growth-tag jobs-tag">
            <FaArrowUp /> {platformStats.activeJobs ?? 0} Active Now
          </span>
        </div>
      </div>

      <div className="macro-metric-tile">
        <div className="tile-header">
          <span className="tile-icon apps"><FaUserTie /></span>
          <p>Total Conversions</p>
        </div>
        <div className="tile-body">
          <h3>{(platformStats.totalApplications ?? 0).toLocaleString()}</h3>
          <span className="growth-tag apps-tag">Applications Processed</span>
        </div>
      </div>
    </div>
  </div>
);