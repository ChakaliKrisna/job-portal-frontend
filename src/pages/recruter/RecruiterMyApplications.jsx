import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:8080';
import "../../pages/recruter/RecruiterApplications.css";

export default function RecruiterApplications() {
  // Navigation, Tab, & View States
  const [activeTab, setActiveTab] = useState('by-job'); // 'by-job' or 'global'
  const [myJobs, setMyJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  
  // Data Table & Pagination States
  const [candidates, setCandidates] = useState([]);
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);

  // Sorting State
  const [sortBy, setSortBy] = useState('score-desc'); // 'score-desc', 'score-asc', 'name-asc'

  // Filter Query States
  const [filters, setFilters] = useState({
    keyword: '',
    minScore: '',
    status: '',
    skill: ''
  });

  // Debounced Filter State to prevent API slamming
  const [debouncedFilters, setDebouncedFilters] = useState(filters);

  // Interactive Feature States (Missing Skills & Resume Preview)
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [missingSkills, setMissingSkills] = useState([]);
  const [loadingSkills, setLoadingSkills] = useState(false);
  const [resumePreviewUrl, setResumePreviewUrl] = useState(null);
  
  // Real-time Update Toggles (Auto-Refresh Polling every 30s)
  const [autoRefresh, setAutoRefresh] = useState(false);

  // ---------------------------------------------------------------------------
  // 4. Native Dependency-Free Debounce Logic
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedFilters(filters);
    }, 400); // 400ms delay window

    return () => clearTimeout(handler);
  }, [filters]);

  // Fetch initial bulk jobs managed by recruiter
  useEffect(() => {
    const fetchRecruiterJobs = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_BASE}/job-portal/applications/my-jobs`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { page: 0, size: 50 }
        });
        const jobList = res.data.content || [];
        setMyJobs(jobList);
        if (jobList.length > 0) {
          setSelectedJobId(jobList[0].publicId || jobList[0].id);
        }
      } catch (err) {
        console.error("Error pulling recruiter jobs", err);
      }
    };
    fetchRecruiterJobs();
  }, []);

  // ---------------------------------------------------------------------------
  // Main Data Fetcher
  // ---------------------------------------------------------------------------
  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      let url = `${API_BASE}/job-portal/applications/filter`;
      let params = { 
        ...debouncedFilters, 
        page, 
        size,
        minScore: debouncedFilters.minScore ? parseFloat(debouncedFilters.minScore) : undefined 
      };

      if (activeTab === 'by-job' && selectedJobId) {
        url = `${API_BASE}/job-portal/applications/job/${selectedJobId}/filter`;
      }

      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
        params
      });

      setCandidates(res.data.content || []);
      setTotalPages(res.data.totalPages || 0);
    } catch (err) {
      console.error("Error fetching application tracking metrics", err);
    } finally {
      setLoading(false);
    }
  }, [activeTab, selectedJobId, debouncedFilters, page, size]);

  // Sync feed updates when parameters or debounced criteria mutate
  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  // ---------------------------------------------------------------------------
  // 7. Automated Polling Mechanism (Real-Time updates fallback)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    let intervalId = null;
    if (autoRefresh) {
      intervalId = setInterval(() => {
        fetchApplications();
      }, 30000); // Polls updates safely every 30 seconds
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [autoRefresh, fetchApplications]);

  // Track dynamic search field input mutations
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPage(0);
  };

  // Reset Filters Helper
  const handleResetFilters = () => {
    setFilters({ keyword: '', minScore: '', status: '', skill: '' });
    setPage(0);
  };

  // PATCH Application Workflow State 
  const updateCandidateStatus = async (publicId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${API_BASE}/job-portal/applications/${publicId}/status`, null, {
        headers: { Authorization: `Bearer ${token}` },
        params: { status: newStatus }
      });
      fetchApplications();
    } catch (err) {
      console.error("Failed downstream state modification transition", err);
    }
  };

  // ---------------------------------------------------------------------------
  // 1. Fetch Candidate Missing Skills & Profile Dossier
  // ---------------------------------------------------------------------------
  const viewCandidateProfile = async (appId, studentPublicId) => {
    setLoadingSkills(true);
    setMissingSkills([]);
    try {
      const token = localStorage.getItem('token');
      
      // Fetch core target user registration profile metrics
      const resProfile = await axios.get(`${API_BASE}/api/users/student/${studentPublicId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedCandidate(resProfile.data);
      setIsProfileModalOpen(true);

      // Fetch automated downstream skill gap array analytics
      const resSkills = await axios.get(`${API_BASE}/job-portal/applications/${app.applicationId}/missing-skills`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMissingSkills(resSkills.data || []);
    } catch (err) {
      console.error("Failed downstream candidate data schema compilation", err);
    } finally {
      setLoadingSkills(false);
    }
  };

  // ---------------------------------------------------------------------------
  // 5. Client-Side Native CSV Data Exporter
  // ---------------------------------------------------------------------------
  const exportToCSV = () => {
    if (candidates.length === 0) return;
    const headers = ['Candidate Name', 'Email', 'Job Applied', 'Match Score (%)', 'Status'];
    const rows = candidates.map(c => [
      c.candidateName || c.studentName || 'Anonymous',
      c.candidateEmail || c.email || 'N/A',
      c.jobTitle || 'N/A',
      (c.matchScore || c.score || 0).toFixed(0),
      c.status || 'APPLIED'
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Recruiter_Applications_Page_${page + 1}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ---------------------------------------------------------------------------
  // 6 & 8. Internal Compute: Sorting Logic & Dashboard Summary Metas
  // ---------------------------------------------------------------------------
  const processedCandidates = [...candidates].sort((a, b) => {
    const scoreA = a.matchScore || a.score || 0;
    const scoreB = b.matchScore || b.score || 0;
    if (sortBy === 'score-desc') return scoreB - scoreA;
    if (sortBy === 'score-asc') return scoreA - scoreB;
    if (sortBy === 'name-asc') {
      const nameA = (a.candidateName || a.studentName || '').toLowerCase();
      const nameB = (b.candidateName || b.studentName || '').toLowerCase();
      return nameA.localeCompare(nameB);
    }
    return 0;
  });

  const metrics = {
    total: processedCandidates.length,
    shortlisted: processedCandidates.filter(c => c.status === 'SHORTLISTED').length,
    interviewing: processedCandidates.filter(c => c.status === 'INTERVIEWING').length,
    accepted: processedCandidates.filter(c => c.status === 'ACCEPTED').length,
    avgScore: processedCandidates.reduce((acc, c) => acc + (c.matchScore || c.score || 0), 0) / (processedCandidates.length || 1)
  };

  // Helper Timeline Status Array Mapping
  const workflowTimeline = ['APPLIED', 'SHORTLISTED', 'INTERVIEWING', 'ACCEPTED'];

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 custom-portal-wrapper">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Workspace Header Section */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Application Management Portal</h1>
            <p className="text-slate-500 text-sm mt-1">Review incoming talent pools, screen matching metrics, and manage screening pipelines.</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            {/* Real-time Update Toggle */}
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-3 py-2 text-xs font-bold rounded-xl border flex items-center gap-1.5 transition-all ${
                autoRefresh ? 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm' : 'bg-white text-slate-600 border-slate-200'
              }`}
            >
              <span className={`h-2 w-2 rounded-full ${autoRefresh ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
              {autoRefresh ? 'Live Monitoring Active' : 'Enable Live Sync'}
            </button>

            {/* CSV Export Button */}
            <button
              onClick={exportToCSV}
              disabled={candidates.length === 0}
              className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-sm transition-all flex items-center gap-2"
            >
              <span>📥</span> Export View Matrix
            </button>

            {/* Tab Toggles */}
            <div className="inline-flex rounded-xl p-1 bg-slate-100 border border-slate-200">
              <button 
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === 'by-job' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
                onClick={() => { setActiveTab('by-job'); setPage(0); }}
              >
                Filter By Specific Job
              </button>
              <button 
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === 'global' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
                onClick={() => { setActiveTab('global'); setSelectedJobId(''); setPage(0); }}
              >
                Cross-Job Global Search
              </button>
            </div>
          </div>
        </div>

        {/* 6. Recruiter Dashboard Analytics Stream Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Evaluated</div>
            <div className="text-2xl font-black text-slate-800 mt-1">{metrics.total}</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Shortlisted</div>
            <div className="text-2xl font-black text-amber-600 mt-1">{metrics.shortlisted}</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Interviewing</div>
            <div className="text-2xl font-black text-indigo-600 mt-1">{metrics.interviewing}</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Offers Rolled</div>
            <div className="text-2xl font-black text-emerald-600 mt-1">{metrics.accepted}</div>
          </div>
          <div className="col-span-2 lg:col-span-1 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Avg ATS Match</div>
            <div className="text-2xl font-black text-slate-800 mt-1">{metrics.avgScore.toFixed(1)}%</div>
          </div>
        </div>

        {/* Control Panel Filter Architecture Grid */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 items-end">
            
            {activeTab === 'by-job' && (
              <div className="flex flex-col space-y-1">
                <label className="text-xs font-bold text-slate-600 tracking-wide uppercase">Select Targeted Position</label>
                <select 
                  className="w-full text-xs font-medium border border-slate-300 rounded-xl px-3 py-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all" 
                  value={selectedJobId} 
                  onChange={(e) => { setSelectedJobId(e.target.value); setPage(0); }}
                >
                  <option value="">-- Choose Job Posting --</option>
                  {myJobs.map(j => (
                    <option key={j.publicId || j.id} value={j.publicId || j.id}>
                      {j.title || j.positionName}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex flex-col space-y-1">
              <label className="text-xs font-bold text-slate-600 tracking-wide uppercase">Keyword Query</label>
              <input 
                type="text" 
                name="keyword"
                placeholder="Name, email..." 
                className="w-full text-xs font-medium border border-slate-300 rounded-xl px-3 py-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                value={filters.keyword}
                onChange={handleFilterChange}
              />
            </div>

            <div className="flex flex-col space-y-1">
              <label className="text-xs font-bold text-slate-600 tracking-wide uppercase">Core Tech / Skill</label>
              <input 
                type="text" 
                name="skill"
                placeholder="Java, React..." 
                className="w-full text-xs font-medium border border-slate-300 rounded-xl px-3 py-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                value={filters.skill}
                onChange={handleFilterChange}
              />
            </div>

            <div className="flex flex-col space-y-1">
              <label className="text-xs font-bold text-slate-600 tracking-wide uppercase">Min Score (%)</label>
              <input 
                type="number" 
                name="minScore"
                min="0" max="100"
                placeholder="e.g. 75" 
                className="w-full text-xs font-medium border border-slate-300 rounded-xl px-3 py-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                value={filters.minScore}
                onChange={handleFilterChange}
              />
            </div>

            <div className="flex flex-col space-y-1">
              <label className="text-xs font-bold text-slate-600 tracking-wide uppercase">Workflow Status</label>
              <select 
                className="w-full text-xs font-medium border border-slate-300 rounded-xl px-3 py-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
              >
                <option value="">All States</option>
                <option value="APPLIED">Applied / New</option>
                <option value="SHORTLISTED">Shortlisted</option>
                <option value="INTERVIEWING">Interviewing</option>
                <option value="ACCEPTED">Accepted / Offered</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>

            {/* 8. Active Dynamic Candidate Sorting Engine */}
            <div className="flex flex-col space-y-1">
              <label className="text-xs font-bold text-slate-600 tracking-wide uppercase">Sort Index Matrix</label>
              <select 
                className="w-full text-xs font-medium border border-slate-300 rounded-xl px-3 py-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="score-desc">ATS Score: High to Low</option>
                <option value="score-asc">ATS Score: Low to High</option>
                <option value="name-asc">Alphabetical (A-Z)</option>
              </select>
            </div>

          </div>
        </div>

        {/* Main Stream Grid Output Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
              <p className="text-slate-500 text-sm mt-4 font-medium">Parsing candidate tracking matrices...</p>
            </div>
          ) : processedCandidates.length === 0 ? (
            /* 10. Empty State Layout Improvements */
            <div className="text-center py-20 px-4">
              <span className="text-5xl inline-block animate-bounce mb-2">📂</span>
              <h3 className="text-lg font-bold text-slate-800 mt-2">No matching candidates discovered</h3>
              <p className="text-slate-500 text-xs mt-1 max-w-md mx-auto">Try resetting active dashboard filters to recover matching applicant logs.</p>
              <button 
                onClick={handleResetFilters}
                className="mt-5 px-4 py-2 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 rounded-xl transition-all"
              >
                Clear All Structural Filters
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <th className="px-6 py-4">Candidate Info</th>
                    <th className="px-6 py-4">Job Applied</th>
                    <th className="px-6 py-4">2. ATS Match Metric</th>
                    <th className="px-6 py-4">Current State Status</th>
                    <th className="px-6 py-4">Workflow Decision Updates</th>
                    <th className="px-6 py-4 text-center">Action Framework</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-xs font-medium text-slate-700">
                  {processedCandidates.map((app) => (
                    <tr key={app.publicId || app.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <span className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center text-sm font-bold shadow-sm">
                            {(app.candidateName || app.studentName || 'U').charAt(0).toUpperCase()}
                          </span>
                          <div>
                            <div className="text-sm font-bold text-slate-900">{app.candidateName || app.studentName || 'Anonymous Candidate'}</div>
                            <div className="text-slate-400 font-medium text-[11px] mt-0.5">{app.candidateEmail || app.email || 'N/A'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-slate-100 text-slate-800 border border-slate-200 rounded-md font-semibold px-2 py-1">
                          {app.jobTitle || 'Position Workspace'}
                        </span>
                      </td>
                      
                      {/* 2. Visual Match Score Progress Component Inline */}
                      <td className="px-6 py-4">
                        <div className="w-32 space-y-1">
                          <div className="flex justify-between text-[10px] font-bold text-slate-600">
                            <span>Score Alignment</span>
                            <span className={
                              (app.matchScore || app.score || 0) >= 75 ? 'text-emerald-600' : 
                              (app.matchScore || app.score || 0) >= 50 ? 'text-amber-600' : 'text-red-600'
                            }>
                              {(app.matchScore || app.score || 0).toFixed(0)}%
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${
                                (app.matchScore || app.score || 0) >= 75 ? 'bg-emerald-500' : 
                                (app.matchScore || app.score || 0) >= 50 ? 'bg-amber-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${app.matchScore || app.score || 0}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full font-bold uppercase border ${
                          (app.status || 'APPLIED') === 'ACCEPTED' ? 'bg-green-50 text-green-700 border-green-100' :
                          (app.status || 'APPLIED') === 'REJECTED' ? 'bg-red-50 text-red-700 border-red-100' :
                          'bg-indigo-50 text-indigo-700 border-indigo-100'
                        }`}>
                          {app.status || 'APPLIED'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <select 
                          className="text-xs bg-white border border-slate-300 rounded-lg p-1.5 font-semibold text-slate-700 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-all shadow-sm"
                          value={app.status || 'APPLIED'}
                          onChange={(e) => updateCandidateStatus(app.publicId || app.id, e.target.value)}
                        >
                          <option value="APPLIED">Applied</option>
                          <option value="SHORTLISTED">Shortlist</option>
                          <option value="INTERVIEWING">Interview</option>
                          <option value="ACCEPTED">Accept</option>
                          <option value="REJECTED">Reject</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button 
                          onClick={() => viewCandidateProfile(app.id || app.publicId, app.studentPublicId || app.candidatePublicId || app.publicId)}
                          className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 text-indigo-700 font-bold rounded-lg transition-colors shadow-sm"
                        >
                          Inspect Profile
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Panel Footer */}
          {totalPages > 1 && (
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button 
                disabled={page === 0}
                onClick={() => setPage(prev => Math.max(0, prev - 1))}
                className="px-4 py-2 border border-slate-300 bg-white text-slate-700 rounded-xl font-bold shadow-sm hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                Backward
              </button>
              <span className="text-xs font-bold text-slate-500">
                Page <strong className="text-slate-900">{page + 1}</strong> of {totalPages}
              </span>
              <button 
                disabled={page >= totalPages - 1}
                onClick={() => setPage(prev => prev + 1)}
                className="px-4 py-2 border border-slate-300 bg-white text-slate-700 rounded-xl font-bold shadow-sm hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                Forward
              </button>
            </div>
          )}
        </div>

        {/* Candidate Profile Inspection Modal Drawer */}
        {isProfileModalOpen && selectedCandidate && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 modal-overlay">
            <div className="bg-white rounded-2xl border border-slate-200 max-w-2xl w-full shadow-2xl overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-150">
              
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <h2 className="text-md font-extrabold text-slate-900 tracking-wide uppercase">Candidate Profile Overview Dossier</h2>
                <button className="text-slate-400 hover:text-slate-600 font-bold text-2xl transition-colors" onClick={() => setIsProfileModalOpen(false)}>&times;</button>
              </div>
              
              <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
                
                {/* 9. Visual Applicant Timeline Tracker */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <h4 className="text-xs font-bold text-slate-400 tracking-wide uppercase mb-3 text-center">Pipeline Progress Timeline</h4>
                  <div className="flex items-center justify-between relative mt-2 px-4">
                    <div className="absolute left-8 right-8 top-3 h-0.5 bg-slate-200 -z-0"></div>
                    {workflowTimeline.map((step, idx) => {
                      const currentStatusIndex = workflowTimeline.indexOf(selectedCandidate.status || 'APPLIED');
                      const isCompleted = idx <= currentStatusIndex;
                      return (
                        <div key={step} className="flex flex-col items-center relative z-10">
                          <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold border transition-all ${
                            isCompleted ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' : 'bg-white text-slate-400 border-slate-200'
                          }`}>
                            {isCompleted ? '✓' : idx + 1}
                          </div>
                          <span className={`text-[10px] font-bold mt-1.5 ${isCompleted ? 'text-indigo-600' : 'text-slate-400'}`}>{step}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex flex-col items-center text-center border-b border-slate-100 pb-5">
                  <div className="h-16 w-16 rounded-2xl bg-indigo-600 text-white font-black text-2xl shadow-md flex items-center justify-center mb-3">
                    {selectedCandidate.name ? selectedCandidate.name.charAt(0).toUpperCase() : 'C'}
                  </div>
                  <h3 className="text-lg font-black text-slate-900">{selectedCandidate.name || 'Candidate Dossier'}</h3>
                  <p className="text-xs font-semibold text-slate-500 mt-0.5">{selectedCandidate.email}</p>
                  {selectedCandidate.phoneNumber && <p className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold mt-2">{selectedCandidate.phoneNumber}</p>}
                </div>

                <div className="space-y-4">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <h4 className="text-xs font-bold text-slate-400 tracking-wide uppercase mb-1.5">Academic / Core Summary</h4>
                    <p className="text-xs text-slate-700 leading-relaxed font-medium">{selectedCandidate.about || selectedCandidate.bio || 'No profile bio summary provided by student.'}</p>
                    
                    <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-[11px] font-bold">
                      <span className="text-slate-500">Profile Completeness Profile Matrix:</span>
                      <div className="w-1/2 bg-slate-200 h-2 rounded-full overflow-hidden mx-2">
                        <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${selectedCandidate.completionPercentage || 70}%` }}></div>
                      </div>
                      <span className="text-indigo-600">{selectedCandidate.completionPercentage || 70}%</span>
                    </div>
                  </div>

                  {/* Skills Display & Missing Skills Split Layout */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <h4 className="text-xs font-bold text-slate-400 tracking-wide uppercase mb-2">Skills Inventory</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedCandidate.skills && selectedCandidate.skills.length > 0 ? (
                          selectedCandidate.skills.map((s, idx) => (
                            <span key={idx} className="bg-white border border-slate-200 text-slate-800 text-[11px] font-bold px-2.5 py-1 rounded-lg shadow-sm">{s}</span>
                          ))
                        ) : (
                          <p className="text-xs text-slate-400 font-medium italic">No coordinates matching catalog indexes.</p>
                        )}
                      </div>
                    </div>

                    {/* 1. Integrated Automated Missing Skills / Core Discrepancies Panel */}
                    <div className="bg-rose-50/50 p-4 rounded-xl border border-rose-100">
                      <h4 className="text-xs font-bold text-rose-500 tracking-wide uppercase mb-2 flex items-center gap-1">
                        ⚠️ Discovered Skill Gaps
                      </h4>
                      {loadingSkills ? (
                        <div className="text-[11px] text-slate-400 animate-pulse font-semibold">Running comparison diagnostics...</div>
                      ) : missingSkills.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {missingSkills.map((skill, idx) => (
                            <span key={idx} className="bg-white border border-rose-200 text-rose-700 text-[11px] font-black px-2.5 py-1 rounded-lg shadow-sm">
                              {skill}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-emerald-700 font-bold italic">Perfect Match! No missing skill gaps detected.</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* 3. Resume Inline Preview Frame Engine Activation */}
                {selectedCandidate.resumeUrl && (
                  <div className="space-y-3">
                    <div className="p-4 bg-gradient-to-r from-slate-900 to-indigo-950 rounded-xl text-white flex items-center justify-between shadow-md">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">📄</span>
                        <div>
                          <div className="text-xs font-extrabold tracking-wide text-slate-100">Verified Resume Document</div>
                          <div className="text-[10px] text-slate-300 font-medium mt-0.5">PDF/DOCX portfolio file mapped via user account</div>
                        </div>
                      </div>
                      <button 
                        onClick={() => setResumePreviewUrl(resumePreviewUrl ? null : selectedCandidate.resumeUrl)}
                        className="px-3 py-1.5 bg-white text-indigo-950 text-xs font-bold rounded-lg shadow-sm hover:bg-slate-100 transition-colors"
                      >
                        {resumePreviewUrl ? 'Collapse File Frame' : 'Preview Document Wireframe'}
                      </button>
                    </div>

                    {/* Embedded IFrame Engine Viewport */}
                    {resumePreviewUrl && (
                      <div className="w-full border border-slate-300 rounded-xl overflow-hidden shadow-inner bg-slate-100 relative h-96">
                        <iframe 
                          src={`${resumePreviewUrl}#toolbar=0`}
                          title="Candidate Portfolio Wireframe" 
                          className="w-full h-full border-0"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                <button className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl shadow-sm transition-colors" onClick={() => { setIsProfileModalOpen(false); setResumePreviewUrl(null); }}>Close Inspector</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}