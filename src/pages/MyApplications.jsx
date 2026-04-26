import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FaBookmark,
  FaBriefcase,
  FaSearch,
  FaCheckCircle,
  FaChartLine,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaBuilding,
  FaCalendarAlt,
  FaTrash,
  FaExternalLinkAlt,
  FaClock
} from "react-icons/fa";

// ================= UTILS =================
const formatCurrency = (val) => {
  if (!val) return "Not Disclosed";
  return new Intl.NumberFormat('en-IN', { 
    style: 'currency', 
    currency: 'INR', 
    maximumSignificantDigits: 3 
  }).format(val);
};

const JobSeekerDashboard = () => {
  const navigate = useNavigate();
  const [savedJobs, setSavedJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [activeTab, setActiveTab] = useState("saved");
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ keyword: "" });
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");

  const fetchSavedJobs = useCallback(async () => {
    try {
      const res = await axios.get("http://localhost:8080/job-portal/saved", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSavedJobs(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Saved Jobs Fetch Error:", err);
      setError("Failed to load saved jobs.");
    }
  }, [token]);

  const fetchApplications = useCallback(async () => {
    try {
      const res = await axios.get(
        "http://localhost:8080/job-portal/applications/my?page=0&size=10",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setApplications(Array.isArray(res.data?.content) ? res.data.content : []);
    } catch (err) {
      console.error("Applications Fetch Error:", err);
      setError("Failed to load applications.");
    }
  }, [token]);

  const unsaveJob = useCallback(async (jobId) => {
    // 🟢 OPTIMISTIC UI: Remove from state immediately
    const previousSaved = [...savedJobs];
    setSavedJobs(prev => prev.filter(j => j.publicId !== jobId));

    try {
      await axios.delete(`http://localhost:8080/job-portal/saved/${jobId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.error("Unsave Error:", err);
      // Rollback if API fails
      setSavedJobs(previousSaved);
      alert("Failed to unsave job. Please try again.");
    }
  }, [token, savedJobs]);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchSavedJobs(), fetchApplications()]).finally(() => setLoading(false));
  }, [fetchSavedJobs, fetchApplications]);

  const filteredSaved = savedJobs.filter((job) =>
    job?.title?.toLowerCase()?.includes(filters.keyword.toLowerCase()) ||
    job?.companyName?.toLowerCase()?.includes(filters.keyword.toLowerCase())
  );

  const filteredApps = applications.filter((app) =>
    app?.jobTitle?.toLowerCase()?.includes(filters.keyword.toLowerCase()) ||
    app?.companyName?.toLowerCase()?.includes(filters.keyword.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen text-gray-800 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* ================= HEADER ================= */}
        <header className="mb-8">
          <h1 className="text-4xl font-extrabold text-gray-900 flex items-center gap-3">
            🎯 <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">Career Hub</span>
          </h1>
          <p className="text-gray-500 mt-2">Track your progress and manage saved opportunities.</p>
        </header>

        {error && (
            <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 flex items-center gap-2">
                <FaTrash /> {error}
            </div>
        )}

        {/* ================= SEARCH & FILTERS ================= */}
        <div className="flex flex-wrap gap-4 mb-8 bg-white p-5 rounded-2xl shadow-sm border border-gray-100 items-center">
          <div className="flex items-center border border-gray-200 px-4 py-3 rounded-xl w-full md:w-96 focus-within:ring-2 focus-within:ring-blue-500 transition-all">
            <FaSearch className="text-gray-400 mr-3" />
            <input
              type="text"
              placeholder="Search by title or company..."
              className="w-full outline-none bg-transparent"
              value={filters.keyword}
              onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
            />
          </div>
          
          <div className="flex bg-gray-100 p-1 rounded-xl">
            <button
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                activeTab === "saved" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("saved")}
            >
              <FaBookmark className="inline mr-2" /> Saved
            </button>
            <button
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                activeTab === "applications" ? "bg-white text-green-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("applications")}
            >
              <FaBriefcase className="inline mr-2" /> Applied
            </button>
          </div>
        </div>

        {/* ================= CONTENT ================= */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid gap-6">
            {activeTab === "saved" ? (
              filteredSaved.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-dashed flex flex-col items-center">
                  <p className="text-gray-400 mb-4">No saved jobs found matching your search.</p>
                  <button onClick={() => navigate("/jobs")} className="text-blue-600 font-bold hover:underline">Browse Jobs →</button>
                </div>
              ) : (
                filteredSaved.map((job) => (
                  <div key={job.publicId} className="group bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex gap-4 items-start">
                      <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 text-2xl font-bold">
                        {job.companyName?.charAt(0) || <FaBuilding />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-xl font-bold group-hover:text-blue-600 transition-colors">{job.title}</h2>
                            {job.alreadyApplied && <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full font-bold">APPLIED</span>}
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-gray-500 font-medium">
                          <span className="flex items-center gap-1"><FaBuilding /> {job.companyName}</span>
                          <span className="flex items-center gap-1"><FaMapMarkerAlt /> {job.location}</span>
                          <span className="flex items-center gap-1 text-green-600"><FaMoneyBillWave /> {formatCurrency(job.salary)}</span>
                        </div>
                        {/* 🟢 NEW FIELDS */}
                        <div className="mt-2 flex gap-3 text-xs text-gray-400">
                            <span className="bg-gray-100 px-2 py-1 rounded">{job.jobType || "Full-time"}</span>
                            <span className="bg-gray-100 px-2 py-1 rounded">{job.experience || "0-1"} yrs Exp</span>
                            <span className="flex items-center gap-1"><FaClock /> Posted: {job.postedAt || "Recently"}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                      <button 
                        onClick={() => navigate(`/jobs/${job.publicId}`)}
                        className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-semibold transition-all"
                      >
                        {job.alreadyApplied ? "View Job" : "Apply Now"}
                      </button>
                      <button 
                        onClick={() => unsaveJob(job.publicId)}
                        className="p-3 text-red-500 bg-red-50 hover:bg-red-100 rounded-xl transition-all"
                        title="Remove"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                ))
              )
            ) : (
              filteredApps.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-dashed">
                  <p className="text-gray-400">You haven't applied to any jobs yet.</p>
                </div>
              ) : (
                filteredApps.map((app) => (
                  <div key={app.applicationId} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-blue-200 transition-all">
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h2 className="text-xl font-bold">{app.jobTitle}</h2>
                            <p className="text-blue-600 font-semibold">{app.companyName}</p>
                          </div>
                          <span className={`px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm ${
                            app.status === "SELECTED" ? "bg-green-100 text-green-700" :
                            app.status === "REJECTED" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"
                          }`}>
                            {app.status || "PENDING"}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                             {/* 🟢 FIXED: Using stored score from app snapshot */}
                             <p className="text-sm font-semibold text-gray-500 flex items-center gap-2 mb-1">
                                <FaChartLine className="text-blue-500" /> Match Score
                             </p>
                             <div className="text-xl font-bold text-gray-800">
                                {app.matchScore ? `${app.matchScore.toFixed(1)}%` : "N/A"}
                             </div>
                          </div>
                          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                             {/* 🟢 FIXED: Using Application ID for context */}
                             <MissingSkills applicationId={app.applicationId} />
                          </div>
                        </div>

                        {/* 🟢 NEW: Application Snapshot Details */}
                       <div className="flex gap-4 ml-auto">
  <a
    href={encodeURI(`http://localhost:8080${app.resumeUrl}`)}
    target="_blank"
    rel="noreferrer"
    className="text-blue-600 hover:underline"
  >
    View
  </a>

  <a
    href={encodeURI(`http://localhost:8080${app.resumeUrl}`)}
    download
    className="text-green-600 hover:underline"
  >
    Download
  </a>
</div>
                      </div>
                    </div>
                    <div className="mt-4 flex justify-between items-center text-xs text-gray-400">
                       <span className="flex items-center gap-1"><FaCalendarAlt /> Applied on: {new Date(app.appliedAt).toLocaleDateString()}</span>
                       <button 
                        onClick={() => navigate(`/applications/${app.applicationId}`)}
                        className="text-blue-600 font-bold hover:underline"
                       >
                            View Details →
                       </button>
                    </div>
                  </div>
                ))
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ================= MISSING SKILLS COMPONENT =================
// 🟢 FIXED: Props changed from jobId to applicationId
const MissingSkills = ({ applicationId }) => {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    let isMounted = true;
    // 🟢 FIXED: API endpoint now targets the specific application snapshot
    axios
      .get(`http://localhost:8080/job-portal/applications/${applicationId}/missing-skills`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        if (isMounted) setSkills(Array.isArray(res.data) ? res.data : []);
      })
      .catch(() => {
        if (isMounted) setSkills([]);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => { isMounted = false; };
  }, [applicationId, token]);

  if (loading) return <p className="text-xs text-gray-400 italic">Analyzing application snapshot...</p>;

  return (
    <div>
      <p className="text-sm font-semibold text-gray-500 mb-2">Gap Analysis:</p>
      <div className="flex gap-2 flex-wrap">
        {skills.length > 0 ? (
          skills.map((skill, i) => (
            <span
              key={`${skill}-${i}`}
              className="bg-red-50 text-red-600 border border-red-100 px-2 py-0.5 rounded-lg text-[10px] font-bold"
            >
              +{skill.toUpperCase()}
            </span>
          ))
        ) : (
          <span className="text-xs text-green-600 flex items-center gap-1">
            <FaCheckCircle /> Profile met all requirements
          </span>
        )}
      </div>
    </div>
  );
};

export default JobSeekerDashboard;