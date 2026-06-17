import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Backend Enum Synchronization
const APPLICATION_STATUSES = [
    { value: 'APPLIED', label: 'Applied' },
    { value: 'REVIEWED', label: 'Reviewed' },
    { value: 'SHORTLISTED', label: 'Shortlisted' },
    { value: 'INTERVIEW', label: 'Interview' },
    { value: 'REJECTED', label: 'Rejected' },
    { value: 'HIRED', label: 'Hired' }
];

const RecruiterMyApplications = () => {
    const [jobs, setJobs] = useState([]);
    const [selectedJob, setSelectedJob] = useState('');
    const [applications, setApplications] = useState([]);
    const [missingSkills, setMissingSkills] = useState({});
    const [loading, setLoading] = useState(false);

    // Advanced Filter and Sort States
    const [filters, setFilters] = useState({
        keyword: '',
        minScore: 0,
        status: '',
        skill: ''
    });
    const [sortBy, setSortBy] = useState('highestScore');
    const [currentPage, setCurrentPage] = useState(0);
    const pageSize = 5;

    const BASE_URL = 'https://job-portal-backend-365l.onrender.com/job-portal';

    const getAuthHeaders = () => ({
        headers: { 
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
        }
    });

    useEffect(() => {
        fetchMyJobs();
    }, []);

    useEffect(() => {
        if (selectedJob) {
            fetchApplicationsForJob(selectedJob);
        } else {
            setApplications([]);
        }
        setCurrentPage(0);
    }, [selectedJob, filters]);

    const fetchMyJobs = async () => {
        try {
            const res = await axios.get(`${BASE_URL}/applications/my-jobs?page=0&size=50`, getAuthHeaders());
            setJobs(res.data?.content || []);
        } catch (error) {
            console.error("Error fetching recruiter jobs:", error);
        }
    };

    const fetchApplicationsForJob = async (jobPublicId) => {
        setLoading(true);
        try {
            const hasFilters = filters.keyword || filters.minScore > 0 || filters.status || filters.skill;
            let url = `${BASE_URL}/applications/job/${jobPublicId}?page=0&size=100`;
            
            if (hasFilters) {
                const params = new URLSearchParams();
                if (filters.keyword) params.append('keyword', filters.keyword);
                if (filters.minScore) params.append('minScore', filters.minScore);
                if (filters.status) params.append('status', filters.status);
                if (filters.skill) params.append('skill', filters.skill);
                url = `${BASE_URL}/applications/job/${jobPublicId}/filter?${params.toString()}`;
            }

            const res = await axios.get(url, getAuthHeaders());
            setApplications(res.data?.content || res.data || []);
        } catch (error) {
            console.error("Error fetching applications for job:", error);
            setApplications([]);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (applicationId, newStatus) => {
        try {
            await axios.patch(
                `${BASE_URL}/applications/${applicationId}/status?status=${newStatus}`, 
                {}, 
                getAuthHeaders()
            );
            
            setApplications(prevApps => 
                prevApps.map(app => 
                    app.applicationId === applicationId ? { ...app, status: newStatus } : app
                )
            );
        } catch (error) {
            console.error("Error updating application status:", error);
            alert("Failed to sync status mutation update with backend registry.");
        }
    };

    const handleFetchMissingSkills = async (applicationId) => {
        try {
            const res = await axios.get(`${BASE_URL}/applications/${applicationId}/missing-skills`, getAuthHeaders());
            setMissingSkills(prev => ({ 
                ...prev, 
                [applicationId]: res.data || [] 
            }));
        } catch (error) {
            console.error("Error fetching missing skills:", error);
        }
    };

    const getMatchScoreTier = (score) => {
        if (score >= 90) return { label: 'Excellent Match', color: 'text-emerald-700 bg-emerald-50 border-emerald-200', bar: 'bg-emerald-500' };
        if (score >= 70) return { label: 'Good Match', color: 'text-blue-700 bg-blue-50 border-blue-200', bar: 'bg-blue-500' };
        return { label: 'Low Match', color: 'text-amber-700 bg-amber-50 border-amber-200', bar: 'bg-amber-500' };
    };

    const computeAnalytics = () => {
        const total = applications.length;
        const shortlisted = applications.filter(a => a.status === 'SHORTLISTED' || a.status === 'INTERVIEW').length;
        const rejected = applications.filter(a => a.status === 'REJECTED').length;
        const avgScore = total > 0 ? (applications.reduce((acc, curr) => acc + (curr.matchScore || 0), 0) / total).toFixed(1) : 0;
        return { total, shortlisted, rejected, avgScore };
    };

    const stats = computeAnalytics();

    const sortedApplications = [...applications].sort((a, b) => {
        if (sortBy === 'highestScore') return b.matchScore - a.matchScore;
        if (sortBy === 'latestApplied') return new Date(b.appliedAt || b.appliedDate) - new Date(a.appliedAt || a.appliedDate);
        if (sortBy === 'alphabetical') return (a.candidateName || '').localeCompare(b.candidateName || '');
        return 0;
    });

    const pageCount = Math.ceil(sortedApplications.length / pageSize);
    const displayedApplications = sortedApplications.slice(currentPage * pageSize, (currentPage + 1) * pageSize);

    return (
        <div className="p-6 max-w-7xl mx-auto font-sans bg-gray-50 min-h-screen">
            <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-200 pb-5">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Recruiter Applications Dashboard</h2>
                    <p className="text-sm text-gray-500 mt-1">Track applicant pipelines, match index parameters, and update hiring statuses.</p>
                </div>
                
                <div className="mt-4 md:mt-0 w-full md:w-72">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Active Core Positions</label>
                    <select 
                        className="w-full p-2 border border-gray-300 rounded-lg shadow-sm bg-white text-sm focus:ring-2 focus:ring-blue-500 text-gray-700 font-medium cursor-pointer"
                        value={selectedJob} 
                        onChange={(e) => setSelectedJob(e.target.value)}
                    >
                        <option value="">-- Choose Job Pipeline --</option>
                        {jobs.map(job => (
                            <option key={job.publicId} value={job.publicId}>
                                {job.title} ({job.company?.name || 'Active Context'})
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {selectedJob && (
                <>
                    {/* Live Recruiter Analytics Panel */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Applicants</span>
                            <div className="text-2xl font-black text-gray-800 mt-1">{stats.total}</div>
                            <div className="w-full bg-gray-100 h-1.5 rounded-full mt-2 overflow-hidden"><div className="bg-blue-500 h-full w-full"></div></div>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">In Pipeline / Shortlisted</span>
                            <div className="text-2xl font-black text-purple-700 mt-1">{stats.shortlisted}</div>
                            <div className="w-full bg-gray-100 h-1.5 rounded-full mt-2 overflow-hidden">
                                <div className="bg-purple-500 h-full" style={{ width: `${stats.total ? (stats.shortlisted / stats.total) * 100 : 0}%` }}></div>
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Rejected Profiles</span>
                            <div className="text-2xl font-black text-red-600 mt-1">{stats.rejected}</div>
                            <div className="w-full bg-gray-100 h-1.5 rounded-full mt-2 overflow-hidden">
                                <div className="bg-red-400 h-full" style={{ width: `${stats.total ? (stats.rejected / stats.total) * 100 : 0}%` }}></div>
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Avg Index Match Score</span>
                            <div className="text-2xl font-black text-emerald-600 mt-1">{stats.avgScore}%</div>
                            <div className="w-full bg-gray-100 h-1.5 rounded-full mt-2 overflow-hidden">
                                <div className="bg-emerald-500 h-full" style={{ width: `${stats.avgScore}%` }}></div>
                            </div>
                        </div>
                    </div>

                    {/* Filters and Sorting Layout */}
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
                        <div>
                            <label className="block text-[11px] font-bold text-gray-500 mb-1 uppercase tracking-tight">Keyword</label>
                            <input type="text" placeholder="Name or Email" className="p-2 border text-xs rounded-lg w-full bg-gray-50 focus:bg-white focus:outline-none"
                                value={filters.keyword} onChange={e => setFilters({...filters, keyword: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-gray-500 mb-1 uppercase tracking-tight">Min Score ({filters.minScore}%)</label>
                            <input type="range" min="0" max="100" className="w-full h-2 bg-gray-200 rounded-lg cursor-pointer"
                                value={filters.minScore} onChange={e => setFilters({...filters, minScore: parseInt(e.target.value)})} />
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-gray-500 mb-1 uppercase tracking-tight">Pipeline Status</label>
                            <select className="p-2 border text-xs rounded-lg w-full bg-white focus:outline-none cursor-pointer"
                                value={filters.status} onChange={e => setFilters({...filters, status: e.target.value})}>
                                <option value="">All Statuses</option>
                                {APPLICATION_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-gray-500 mb-1 uppercase tracking-tight">Target Skill</label>
                            <input type="text" placeholder="e.g. React" className="p-2 border text-xs rounded-lg w-full bg-gray-50 focus:bg-white focus:outline-none"
                                value={filters.skill} onChange={e => setFilters({...filters, skill: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-blue-600 mb-1 uppercase tracking-wider font-mono">Sort Order Index</label>
                            <select className="p-2 border text-xs rounded-lg w-full bg-blue-50/60 font-semibold text-blue-800 focus:outline-none cursor-pointer"
                                value={sortBy} onChange={e => setSortBy(e.target.value)}>
                                <option value="highestScore">Highest Match Score</option>
                                <option value="latestApplied">Latest Applied</option>
                                <option value="alphabetical">Alphabetical Name</option>
                            </select>
                        </div>
                    </div>
                </>
            )}

            {/* Applications Table Data Area */}
            {loading ? (
                <div className="text-center py-12 text-gray-500 font-medium animate-pulse">Querying relational position tables...</div>
            ) : displayedApplications.length > 0 ? (
                <div className="overflow-hidden bg-white rounded-xl shadow-xs border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Candidate Details</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-48">Match Index Indices</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status Action</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Skill Mapping Architecture</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Artifact Vault</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {displayedApplications.map((app) => {
                                const tier = getMatchScoreTier(app.matchScore);
                                return (
                                    <tr key={app.applicationId} className="hover:bg-gray-50/60 transition">
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-gray-900 text-sm">{app.candidateName}</div>
                                            <div className="text-xs text-gray-500 font-mono mt-0.5">{app.candidateEmail || app.email}</div>
                                            <div className="text-[10px] font-medium text-gray-400 mt-1 uppercase tracking-tight">
                                                Registry Log: {new Date(app.appliedAt || app.appliedDate || Date.now()).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex justify-between items-center text-xs">
                                                    <span className={`px-1.5 py-0.5 font-bold rounded-sm text-[10px] border uppercase ${tier.color}`}>
                                                        {tier.label}
                                                    </span>
                                                    <span className="font-bold font-mono text-gray-700">{Number(app.matchScore || 0).toFixed(0)}%</span>
                                                </div>
                                                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden shadow-inner">
                                                    <div className={`h-full transition-all duration-300 ${tier.bar}`} style={{ width: `${app.matchScore}%` }}></div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <select 
                                                value={app.status || 'APPLIED'}
                                                onChange={(e) => handleStatusChange(app.applicationId, e.target.value)}
                                                className="border border-gray-300 rounded-lg p-1.5 text-xs font-semibold bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition cursor-pointer shadow-xs"
                                            >
                                                ={APPLICATION_STATUSES.map(status => (
                                                    <option key={status.value} value={status.value}>{status.label}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="px-6 py-4 max-w-xs">
                                            <div className="flex flex-wrap gap-1 mb-2">
                                                {/* Safely check if skill is an object or primitive string */}
                                                {app.skills?.map((skillItem, index) => {
                                                    const skillName = typeof skillItem === 'object' ? skillItem.skill : skillItem;
                                                    return (
                                                        <span key={index} className="bg-slate-100 border border-slate-200 text-slate-700 text-[10px] px-2 py-0.5 rounded-md font-medium tracking-tight">
                                                            {skillName}
                                                        </span>
                                                    );
                                                }) || <span className="text-xs text-gray-400 italic">None cataloged</span>}
                                            </div>
                                            
                                            {missingSkills[app.applicationId] ? (
                                                <div className="text-[11px] text-red-700 bg-red-50 p-2 rounded-lg border border-red-100">
                                                    <span className="font-bold">Missing Frameworks:</span> {missingSkills[app.applicationId].join(', ') || '0 Delta (Complete match)'}
                                                </div>
                                            ) : (
                                                <button 
                                                    onClick={() => handleFetchMissingSkills(app.applicationId)}
                                                    className="text-[10px] font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 py-1 px-2 rounded border border-blue-200 transition tracking-wide uppercase"
                                                >
                                                    Run Delta Assessment
                                                </button>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <a 
                                                href={app.resumeUrl?.startsWith('http') ? app.resumeUrl : `https://job-portal-backend-365l.onrender.com${app.resumeUrl}`} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center text-[11px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-md border border-blue-100 transition tracking-tight"
                                            >
                                                View Document PDF
                                            </a>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    {/* Pagination Interface Footer */}
                    {pageCount > 1 && (
                        <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-t border-gray-200">
                            <span className="text-xs text-gray-500">Showing page {currentPage + 1} of {pageCount} ({sortedApplications.length} records parsed)</span>
                            <div className="inline-flex gap-1.5">
                                <button disabled={currentPage === 0} onClick={() => setCurrentPage(prev => prev - 1)}
                                    className="px-3 py-1 bg-white border border-gray-300 rounded text-xs font-semibold hover:bg-gray-50 transition disabled:opacity-40">Previous</button>
                                <button disabled={currentPage === pageCount - 1} onClick={() => setCurrentPage(prev => prev + 1)}
                                    className="px-3 py-1 bg-white border border-gray-300 rounded text-xs font-semibold hover:bg-gray-50 transition disabled:opacity-40">Next</button>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                selectedJob && (
                    <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300 text-gray-400 font-medium">
                        No active applicant vectors correspond with the assigned filters.
                    </div>
                )
            )}
        </div>
    );
};

export default RecruiterMyApplications;