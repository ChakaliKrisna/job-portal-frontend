import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FaBookmark, FaBriefcase, FaSearch, FaCheckCircle,
  FaChartLine, FaMapMarkerAlt, FaMoneyBillWave,
  FaBuilding, FaCalendarAlt, FaTrash, FaClock, FaArrowLeft
} from "react-icons/fa";
import "../components/Styles/applications.css";

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
      setError("Failed to load applications.");
    }
  }, [token]);

  const unsaveJob = useCallback(async (jobId) => {
    setSavedJobs(prev => prev.filter(j => j.publicId !== jobId));
    try {
      await axios.delete(`http://localhost:8080/job-portal/saved/${jobId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      fetchSavedJobs(); // Rollback
    }
  }, [token, fetchSavedJobs]);

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
    <div className="pt-28 pb-20 px-6 bg-[#fcfcfd] min-h-screen font-sans">
      <div className="max-w-5xl mx-auto">
        
        {/* TOP BREADCRUMB */}
        <button 
          onClick={() => navigate("/jobs")} 
          className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600 transition-all mb-6 group"
        >
          <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" /> 
          Back to Browse Jobs
        </button>

        {/* HEADER SECTION */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900">
              Your <span className="text-blue-600">Workspace</span>
            </h1>
            <p className="text-slate-500 mt-2 text-lg">
              Management hub for your career growth.
            </p>
          </div>
          
          <div className="flex bg-slate-100 p-1 rounded-2xl w-fit border border-slate-200">
            <button
              className={`px-8 py-2.5 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                activeTab === "saved" ? "bg-white text-blue-600 shadow-sm border border-slate-200/50" : "text-slate-500 hover:text-slate-700"
              }`}
              onClick={() => setActiveTab("saved")}
            >
              <FaBookmark className="text-sm" /> Saved
            </button>
            <button
              className={`px-8 py-2.5 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                activeTab === "applications" ? "bg-white text-emerald-600 shadow-sm border border-slate-200/50" : "text-slate-500 hover:text-slate-700"
              }`}
              onClick={() => setActiveTab("applications")}
            >
              <FaBriefcase className="text-sm" /> Applied
            </button>
          </div>
        </header>

        {/* SEARCH BAR */}
        <div className="relative mb-8 group">
          <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
          <input
            type="text"
            placeholder="Search by title, role or company..."
            className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all text-lg"
            value={filters.keyword}
            onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
          />
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 animate-pulse">
            <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="mt-4 text-slate-400 font-medium">Syncing your dashboard...</p>
          </div>
        ) : (
          <div className="grid gap-5">
            {activeTab === "saved" ? (
              filteredSaved.length === 0 ? (
                <EmptyState icon={<FaBookmark className="text-4xl text-slate-200" />} message="No saved jobs found." />
              ) : (
                filteredSaved.map((job) => (
                  <SavedJobCard key={job.publicId} job={job} navigate={navigate} unsaveJob={unsaveJob} />
                ))
              )
            ) : (
              filteredApps.length === 0 ? (
                <EmptyState icon={<FaBriefcase className="text-4xl text-slate-200" />} message="You haven't applied to any jobs yet." />
              ) : (
                filteredApps.map((app) => (
                  <ApplicationCard key={app.applicationId} app={app} navigate={navigate} />
                ))
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// --- SUB-COMPONENTS FOR CLEANER CODE ---

const SavedJobCard = ({ job, navigate, unsaveJob }) => (
  <div className="bg-white p-6 rounded-3xl border border-slate-200 hover:border-blue-300 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col md:flex-row justify-between items-center gap-6 group">
    <div className="flex gap-5 items-center w-full">
      <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors shrink-0">
        <FaBuilding className="text-2xl" />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-slate-800">{job.title}</h2>
          {job.alreadyApplied && <span className="bg-emerald-100 text-emerald-700 text-[10px] px-2.5 py-1 rounded-full font-bold tracking-tight">APPLIED</span>}
        </div>
        <div className="flex flex-wrap gap-4 mt-2 text-sm text-slate-500 font-medium">
          <span className="flex items-center gap-1.5"><FaBuilding className="text-xs" /> {job.companyName}</span>
          <span className="flex items-center gap-1.5"><FaMapMarkerAlt className="text-xs" /> {job.location}</span>
          <span className="text-emerald-600 font-semibold">{job.salary || "Competitive Pay"}</span>
        </div>
      </div>
    </div>
    
    <div className="flex gap-3 w-full md:w-auto">
      <button 
        onClick={() => navigate(`/jobs/${job.publicId}`)}
        className="flex-1 md:px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-blue-600 transition-all whitespace-nowrap"
      >
        {job.alreadyApplied ? "View Listing" : "Apply Now"}
      </button>
      <button 
        onClick={() => unsaveJob(job.publicId)}
        className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
      >
        <FaTrash />
      </button>
    </div>
  </div>
);

const ApplicationCard = ({ app, navigate }) => (
  <div className="bg-white p-7 rounded-3xl border border-slate-200 hover:shadow-lg transition-all">
    <div className="flex justify-between items-start mb-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 leading-tight">{app.jobTitle}</h2>
        <p className="text-blue-600 font-bold text-lg">{app.companyName}</p>
      </div>
      <span className={`px-4 py-1.5 rounded-xl text-xs font-bold shadow-sm ${
        app.status === "SELECTED" ? "bg-emerald-500 text-white" :
        app.status === "REJECTED" ? "bg-rose-500 text-white" : "bg-amber-400 text-slate-900"
      }`}>
        {app.status || "IN REVIEW"}
      </span>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center">
        <span className="text-slate-500 text-sm font-semibold uppercase tracking-wider">Match Score</span>
        <span className="text-xl font-black text-slate-800">{app.matchScore?.toFixed(1)}%</span>
      </div>
      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
        <MissingSkills applicationId={app.applicationId} />
      </div>
    </div>

    <div className="flex justify-between items-center border-t border-slate-100 pt-5 mt-2">
      <span className="flex items-center gap-2 text-sm text-slate-400 font-medium">
        <FaClock /> Submitted {new Date(app.appliedAt).toLocaleDateString()}
      </span>
      <button 
        onClick={() => navigate(`/applications/${app.applicationId}`)}
        className="text-blue-600 font-bold hover:gap-3 flex items-center gap-2 transition-all"
      >
        View Details <FaArrowLeft className="rotate-180" />
      </button>
    </div>
  </div>
);

const EmptyState = ({ icon, message }) => (
  <div className="py-24 bg-white rounded-3xl border-2 border-dashed border-slate-100 text-center flex flex-col items-center">
    {icon}
    <p className="mt-4 text-slate-400 font-medium">{message}</p>
  </div>
);

// Reuse your MissingSkills Component here...
const MissingSkills = ({ applicationId }) => {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    axios.get(`http://localhost:8080/job-portal/applications/${applicationId}/missing-skills`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setSkills(Array.isArray(res.data) ? res.data : []))
      .catch(() => setSkills([]))
      .finally(() => setLoading(false));
  }, [applicationId, token]);

  if (loading) return <div className="animate-pulse h-4 w-20 bg-slate-200 rounded"></div>;

  return (
    <div className="flex gap-2 flex-wrap justify-end">
      {skills.length > 0 ? (
        skills.slice(0, 3).map((s, i) => (
          <span key={i} className="bg-rose-50 text-rose-600 px-2 py-1 rounded-lg text-[10px] font-extrabold">+ {s.toUpperCase()}</span>
        ))
      ) : (
        <span className="text-xs text-emerald-600 flex items-center gap-1 font-bold"><FaCheckCircle /> PERFECT MATCH</span>
      )}
    </div>
  );
};

export default JobSeekerDashboard;