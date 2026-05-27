import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:8080';

export default function SearchTalent() {
  // Navigation tabs toggle
  const [activeTab, setActiveTab] = useState('by-job'); // 'by-job' or 'global'
  const [myJobs, setMyJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  
  // Grid Data Core Metrics
  const [candidates, setCandidates] = useState([]);
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);

  // Advanced Filters State Management
  const [filters, setFilters] = useState({
    keyword: '',
    minScore: '',
    status: '',
    skill: ''
  });

  // Modal Profile Drawer States
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Fetch all recruiter specific job distributions
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
          setSelectedJobId(jobList[0].jobPublicId || jobList[0].publicId || jobList[0].id);
        }
      } catch (err) {
        console.error("Error drawing active positions catalog details:", err);
      }
    };
    fetchRecruiterJobs();
  }, []);

  // Sync feed queries
  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      let url = `${API_BASE}/job-portal/applications/filter`;
      let params = { 
        ...filters, 
        page, 
        size,
        minScore: filters.minScore ? parseFloat(filters.minScore) : undefined 
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
      console.error("Downstream evaluation retrieval execution error:", err);
    } finally {
      setLoading(false);
    }
  }, [activeTab, selectedJobId, filters, page, size]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPage(0);
  };

  // Status flow state engine execution logic (PATCH)
  const updateCandidateStatus = async (publicId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${API_BASE}/job-portal/applications/${publicId}/status`, null, {
        headers: { Authorization: `Bearer ${token}` },
        params: { status: newStatus }
      });
      fetchApplications(); // Hot-reload data tables matrix grid map
    } catch (err) {
      console.error("Failed transition state update pipeline step:", err);
    }
  };

  // View Candidate Profile (GET)
  const viewCandidateProfile = async (candidatePublicId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE}/api/users/student/${candidatePublicId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedCandidate(res.data);
      setIsProfileModalOpen(true);
    } catch (err) {
      console.error("Failed structural candidate scheme retrieval mapping:", err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Workspace Hub Dashboard Banner Header */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Search Talent & Pipeline Center</h1>
            <p className="text-slate-500 text-sm mt-0.5">Filter unified applicants pools, modify application states, and screen automated core compatibility matching logic rules.</p>
          </div>
          
          {/* Navigation Matrix Tabs Toggle buttons */}
          <div className="inline-flex rounded-xl p-1 bg-slate-100 border border-slate-200 self-start md:self-auto">
            <button
              onClick={() => { setActiveTab('by-job'); setPage(0); }}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'by-job' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Target Job Distribution Filter
            </button>
            <button
              onClick={() => { setActiveTab('global'); setSelectedJobId(''); setPage(0); }}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'global' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Cross-Job Global Search
            </button>
          </div>
        </div>

        {/* Filter Query Architecture Controls Grid Block */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            
            {activeTab === 'by-job' && (
              <div className="flex flex-col space-y-1 lg:col-span-1">
                <label className="text-xs font-bold text-slate-600 tracking-wide uppercase">Active Positions Catalog</label>
                <select
                  value={selectedJobId}
                  onChange={(e) => { setSelectedJobId(e.target.value); setPage(0); }}
                  className="w-full text-xs font-medium border border-slate-300 rounded-xl px-3 py-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                >
                  <option value="">-- Choose Target Job Posting --</option>
                  {myJobs.map(job => (
                    <option key={job.jobPublicId || job.publicId || job.id} value={job.jobPublicId || job.publicId || job.id}>
                      {job.title || job.positionName}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className={`flex flex-col space-y-1 ${activeTab === 'by-job' ? 'lg:col-span-1' : 'lg:col-span-2'}`}>
              <label className="text-xs font-bold text-slate-600 tracking-wide uppercase">Keyword Query</label>
              <input
                type="text"
                name="keyword"
                value={filters.keyword}
                onChange={handleFilterChange}
                placeholder="Name, index details, emails..."
                className="w-full text-xs font-medium border border-slate-300 rounded-xl px-3 py-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              />
            </div>

            <div className="flex flex-col space-y-1">
              <label className="text-xs font-bold text-slate-600 tracking-wide uppercase">Core Skill / Tool Stack</label>
              <input
                type="text"
                name="skill"
                value={filters.skill}
                onChange={handleFilterChange}
                placeholder="Java, React, MySQL..."
                className="w-full text-xs font-medium border border-slate-300 rounded-xl px-3 py-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              />
            </div>

            <div className="flex flex-col space-y-1">
              <label className="text-xs font-bold text-slate-600 tracking-wide uppercase">Min Score Match (%)</label>
              <input
                type="number"
                name="minScore"
                min="0" max="100"
                value={filters.minScore}
                onChange={handleFilterChange}
                placeholder="e.g. 75"
                className="w-full text-xs font-medium border border-slate-300 rounded-xl px-3 py-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              />
            </div>

            <div className="flex flex-col space-y-1">
              <label className="text-xs font-bold text-slate-600 tracking-wide uppercase">Pipeline Workflow Status</label>
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="w-full text-xs font-medium border border-slate-300 rounded-xl px-3 py-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              >
                <option value="">All States Matrix</option>
                <option value="APPLIED">Applied / New</option>
                <option value="SHORTLISTED">Shortlisted</option>
                <option value="INTERVIEWING">Interviewing</option>
                <option value="ACCEPTED">Accepted / Offered</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>

          </div>
        </div>

        {/* Data Output Matrix Grid Viewport */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
              <p className="text-slate-500 text-sm font-semibold mt-4 tracking-wide">Parsing complex application metrics matrix pools...</p>
            </div>
          ) : candidates.length === 0 ? (
            <div className="text-center py-20 px-4">
              <span className="text-4xl">📂</span>
              <h3 className="text-lg font-bold text-slate-800 mt-4">No matching profiles discovered</h3>
              <p className="text-slate-500 text-xs mt-1 max-w-md mx-auto">Try lowering match thresholds, clearing keyword targets, or altering target assignment parameters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <th className="px-6 py-4">Candidate Info Mapping</th>
                    <th className="px-6 py-4">Position Scope</th>
                    <th className="px-6 py-4">Automated Match Score</th>
                    <th className="px-6 py-4">Workflow Status Phase</th>
                    <th className="px-6 py-4">Workflow Actions Trigger</th>
                    <th className="px-6 py-4 text-center">Inspection Desk</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-xs font-medium text-slate-700">
                  {candidates.map((app) => (
                    <tr key={app.id || app.publicId} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center text-sm font-bold shadow-sm">
                            {(app.candidateName || app.studentName || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-slate-900">{app.candidateName || app.studentName || 'Anonymous Candidate'}</div>
                            <div className="text-slate-400 font-medium text-[11px] mt-0.5">{app.candidateEmail || app.email || 'N/A'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-slate-100 text-slate-800 border border-slate-200 rounded-md font-semibold px-2 py-1">
                          {app.jobTitle || 'Active Target Profile'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-block font-extrabold px-2.5 py-1 rounded-full text-[11px] border ${
                          (app.matchScore || app.score) >= 80 ? 'bg-green-50 text-green-700 border-green-200' :
                          (app.matchScore || app.score) >= 50 ? 'bg-amber-50 text-amber-700 border-amber-200' :
                          'bg-red-50 text-red-700 border-red-200'
                        }`}>
                          {app.matchScore || app.score ? `${(app.matchScore || app.score).toFixed(0)}%` : '0%'}
                        </span>
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
                          value={app.status || 'APPLIED'}
                          onChange={(e) => updateCandidateStatus(app.id || app.publicId, e.target.value)}
                          className="text-xs bg-white border border-slate-300 rounded-lg p-1.5 font-semibold text-slate-700 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-all shadow-sm"
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
                          onClick={() => viewCandidateProfile(app.studentPublicId || app.candidatePublicId || app.publicId)}
                          className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 font-bold rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
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

          {/* Pagination Matrix Grid Controls Layout footer */}
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

        {/* Student/Candidate Deep Profile Dossier Inspection Overlaid Scrim Modal Canvas */}
        {isProfileModalOpen && selectedCandidate && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl border border-slate-200 max-w-xl w-full shadow-2xl overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-150">
              
              {/* Modal Header bar context */}
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <h3 className="text-md font-extrabold text-slate-900 tracking-wide uppercase">Candidate Profile Overview Dossier</h3>
                <button
                  onClick={() => setIsProfileModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 font-bold text-2xl transition-colors"
                >
                  &times;
                </button>
              </div>

              {/* Modal Body Scroll Container workspace */}
              <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
                
                {/* Hero Avatar Metadata segment */}
                <div className="flex flex-col items-center text-center border-b border-slate-100 pb-5">
                  <div className="h-16 w-16 rounded-2xl bg-indigo-600 text-white font-black text-2xl shadow-md flex items-center justify-center mb-3">
                    {selectedCandidate.name ? selectedCandidate.name.charAt(0).toUpperCase() : 'C'}
                  </div>
                  <h4 className="text-lg font-black text-slate-900">{selectedCandidate.name || 'Candidate Name'}</h4>
                  <p className="text-xs font-semibold text-slate-500 mt-0.5">{selectedCandidate.email}</p>
                  {selectedCandidate.phoneNumber && (
                    <p className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold mt-2">{selectedCandidate.phoneNumber}</p>
                  )}
                </div>

                {/* Grid Layout properties segment */}
                <div className="space-y-4">
                  
                  {/* Summary / About */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <h5 className="text-xs font-bold text-slate-400 tracking-wide uppercase mb-1.5">Academic / Core Summary</h5>
                    <p className="text-xs text-slate-700 leading-relaxed font-medium">
                      {selectedCandidate.about || selectedCandidate.bio || 'No structural background profile overview bio submitted by candidate profile registry.'}
                    </p>
                    
                    {/* Progress tracking line widget mapping profile */}
                    <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-[11px] font-bold">
                      <span className="text-slate-500">Profile Completeness Index Matrix:</span>
                      <div className="w-1/2 bg-slate-200 h-2 rounded-full overflow-hidden mx-2">
                        <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${selectedCandidate.completionPercentage || 70}%` }}></div>
                      </div>
                      <span className="text-indigo-600">{selectedCandidate.completionPercentage || 70}%</span>
                    </div>
                  </div>

                  {/* Skills badge matrix architecture widget layout */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <h5 className="text-xs font-bold text-slate-400 tracking-wide uppercase mb-2">Technical Skills Competency Inventory</h5>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedCandidate.skills && selectedCandidate.skills.length > 0 ? (
                        selectedCandidate.skills.map((skill, index) => (
                          <span key={index} className="bg-white border border-slate-200 text-slate-800 text-xs font-bold px-2.5 py-1 rounded-lg shadow-sm">
                            {skill}
                          </span>
                        ))
                      ) : (
                        <p className="text-xs text-slate-400 font-medium italic">No structural skills tags mapped inside candidate database tree schema profile.</p>
                      )}
                    </div>
                  </div>

                </div>

                {/* Portfolio attachment actions layout row link elements */}
                {selectedCandidate.resumeUrl && (
                  <div className="p-4 bg-gradient-to-r from-slate-900 to-indigo-950 rounded-xl text-white flex items-center justify-between shadow-md">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">📄</span>
                      <div>
                        <div className="text-xs font-extrabold tracking-wide text-slate-100">Verified Candidate Resume Document</div>
                        <div className="text-[10px] text-slate-300 font-medium mt-0.5">PDF / Word file attachment index</div>
                      </div>
                    </div>
                    <a
                      href={selectedCandidate.resumeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 bg-white text-indigo-950 text-xs font-bold rounded-lg shadow-sm hover:bg-slate-100 transition-colors"
                    >
                      Launch Document View
                    </a>
                  </div>
                )}
              </div>

              {/* Modal Footer actions desk controls */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => setIsProfileModalOpen(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl shadow-sm transition-colors"
                >
                  Close Inspection Workspace
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}