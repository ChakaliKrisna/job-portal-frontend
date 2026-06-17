import React, { useState, useEffect } from 'react';
import api from '../../api/api';
import SearchFilters from './SearchFilters';
import CandidateCard from './CandidateCard';
import ComparisonPanel from './ComparisonPanel';
import CandidateModal from './CandidateModal';

// Clean standard base routing path configuration to match Spring Boot @RequestMapping
const BASE_URL = "/job-portal/applications";

const SearchTalent = () => {
  const [filters, setFilters] = useState({
    keyword: '',
    minScore: 0,
    status: '',
    skill: '',
    experience: '',
    location: '',
    workMode: '',
    sortBy: 'highestMatch'
  });
  
  const [results, setResults] = useState([]);
  const [missingSkills, setMissingSkills] = useState({});
  const [loading, setLoading] = useState(false);
  const [analyzingId, setAnalyzingId] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [errorToast, setErrorToast] = useState(null);

  // Pagination Architecture State
  const [pagination, setPagination] = useState({
    currentPage: 0,
    totalPages: 1,
    pageSize: 12,
    totalElements: 0
  });

  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [comparisonList, setComparisonList] = useState([]);
  
  const [savedTalent, setSavedTalent] = useState(() => {
    const saved = localStorage.getItem('saved_talent_registry');
    return saved ? JSON.parse(saved) : [];
  });

  const [recruiterNotes, setRecruiterNotes] = useState(() => {
    const notes = localStorage.getItem('recruiter_notes_registry');
    return notes ? JSON.parse(notes) : {};
  });

  // Automatically trigger debounced search loop when criteria inputs fluctuate
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      handleSearch(0); // Reset back to first page when running updated keyword inputs
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [filters]);

  useEffect(() => {
    localStorage.setItem('saved_talent_registry', JSON.stringify(savedTalent));
  }, [savedTalent]);

  useEffect(() => {
    localStorage.setItem('recruiter_notes_registry', JSON.stringify(recruiterNotes));
  }, [recruiterNotes]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const showToast = (message) => {
    setErrorToast(message);
    setTimeout(() => setErrorToast(null), 4000);
  };

  const handleSearch = async (pageNumber = 0) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.keyword) params.append('keyword', filters.keyword);
      if (filters.minScore > 0) params.append('minScore', filters.minScore);
      if (filters.status) params.append('status', filters.status);
      if (filters.skill) params.append('skill', filters.skill);
      
      // Note: Kept parameters below for the frontend UI form persistence.
      // They pass to the request string seamlessly but are ignored safely on your backend filter mappings.
      if (filters.location) params.append('location', filters.location);
      if (filters.workMode) params.append('workMode', filters.workMode);
      if (filters.experience) params.append('experience', filters.experience);
      
      params.append('sort', filters.sortBy);
      params.append('page', pageNumber.toString());
      params.append('size', pagination.pageSize.toString());

      // FIXED: Switched path mapping structure to systematically mount via standard BASE_URL
      const res = await api.get(`${BASE_URL}/filter?${params.toString()}`);
      
      // Standard page structural mapping
      if (res.data && res.data.content) {
        setResults(res.data.content);
        setPagination(prev => ({
          ...prev,
          currentPage: res.data.number || 0,
          totalPages: res.data.totalPages || 1,
          totalElements: res.data.totalElements || res.data.content.length
        }));
      } else {
        const rawData = res.data || [];
        setResults(rawData);
        setPagination(prev => ({ ...prev, currentPage: 0, totalPages: 1, totalElements: rawData.length }));
      }
    } catch (error) {
      showToast("Failed to sync structural talent profiles from server connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleFetchMissingSkills = async (applicationId) => {
    setAnalyzingId(applicationId);
    try {
      // FIXED: Prefixed endpoint path string with standard BASE_URL context mapping matching Real Problem 2
      const res = await api.get(`${BASE_URL}/${applicationId}/missing-skills`);
      setMissingSkills(prev => ({ ...prev, [applicationId]: res.data || [] }));
    } catch (error) {
      showToast("Could not compute structural database profile skill deficiency updates.");
    } finally {
      setAnalyzingId(null);
    }
  };

  const toggleSaveCandidate = (id) => {
    setSavedTalent(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };

  const handleNoteMutation = (id, text) => {
    setRecruiterNotes(prev => ({ ...prev, [id]: text }));
  };

  const toggleComparison = (candidate) => {
    setComparisonList(prev => {
      if (prev.find(c => c.applicationId === candidate.applicationId)) {
        return prev.filter(c => c.applicationId !== candidate.applicationId);
      }
      if (prev.length >= 3) {
        showToast("Maximum comparison panel volume capped at 3 candidate profiles.");
        return prev;
      }
      return [...prev, candidate];
    });
  };

  // Derive Dynamic Recruiter Key Workspace Metric Indicators
  const analytics = {
    total: pagination.totalElements,
    avgMatch: results.length ? (results.reduce((acc, curr) => acc + Number(curr.matchScore || 0), 0) / results.length).toFixed(0) : 0,
    shortlisted: results.filter(c => c.status === 'SHORTLISTED').length,
    interviewing: results.filter(c => c.status === 'INTERVIEW').length
  };

  return (
    <div className="p-6 max-w-7xl mx-auto font-sans bg-gray-50 min-h-screen relative">
      {/* Dynamic Native Message Toast Alert Bar */}
      {errorToast && (
        <div className="fixed bottom-5 right-5 bg-slate-900 border border-slate-700 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 z-50 animate-bounce">
          <span className="text-red-400 font-bold">⚠️ Notice:</span>
          <span className="text-xs font-semibold">{errorToast}</span>
        </div>
      )}

      {/* Main Header Module Title block */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-200 pb-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Search Candidates</h2>
          <p className="text-sm text-gray-500 mt-1">Search and manage candidates across all job applications.</p>
        </div>
      </div>

      {/* Executive Recruiter Candidate Analytics Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Candidates", val: analytics.total, color: "text-blue-600" },
          { label: "Average Match Rating", val: `${analytics.avgMatch}%`, color: "text-emerald-600" },
          { label: "Shortlisted Stage", val: analytics.shortlisted, color: "text-purple-600" },
          { label: "Active Interviews", val: analytics.interviewing, color: "text-indigo-600" }
        ].map((card, i) => (
          <div key={i} className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex flex-col">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{card.label}</span>
            <span className={`text-xl font-black ${card.color} mt-1`}>{card.val}</span>
          </div>
        ))}
      </div>

      <SearchFilters 
        filters={filters} 
        handleInputChange={handleInputChange} 
        showAdvanced={showAdvanced} 
        setShowAdvanced={setShowAdvanced} 
      />

      <ComparisonPanel 
        comparisonList={comparisonList} 
        missingSkills={missingSkills} 
        onToggleComparison={toggleComparison} 
        onClear={() => setComparisonList([])} 
      />

      {/* Results Dynamic Output Engine Matrix Section */}
      {loading ? (
        /* Elegant Tailwind Skeleton Loading Cards Track Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, idx) => (
            <div key={idx} className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs flex flex-col animate-pulse space-y-4">
              <div className="flex justify-between items-center">
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                <div className="h-6 bg-gray-200 rounded w-12"></div>
              </div>
              <div className="h-12 bg-gray-100 rounded w-full"></div>
              <div className="h-8 bg-gray-100 rounded w-1/2"></div>
              <div className="h-10 bg-gray-200 rounded w-full mt-auto"></div>
            </div>
          ))}
        </div>
      ) : results.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((candidate) => (
              <CandidateCard 
                key={candidate.applicationId}
                candidate={candidate}
                isSaved={savedTalent.includes(candidate.applicationId)}
                isComparing={comparisonList.some(c => c.applicationId === candidate.applicationId)}
                note={recruiterNotes[candidate.applicationId] || ''}
                analyzingId={analyzingId}
                missingSkills={missingSkills}
                onToggleSave={toggleSaveCandidate}
                onToggleComparison={toggleComparison}
                onFetchMissingSkills={handleFetchMissingSkills}
                onSelectCandidate={setSelectedCandidate}
                onNoteChange={handleNoteMutation}
              />
            ))}
          </div>

          {/* Production Pagination Controls Interface Footer */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-between items-center mt-8 pt-4 border-t border-gray-200 text-xs">
              <span className="text-gray-500 font-medium">
                Page <b>{pagination.currentPage + 1}</b> of <b>{pagination.totalPages}</b>
              </span>
              <div className="flex items-center gap-2">
                <button 
                  disabled={pagination.currentPage === 0}
                  onClick={() => handleSearch(pagination.currentPage - 1)}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg bg-white font-bold hover:bg-gray-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button 
                  disabled={pagination.currentPage + 1 >= pagination.totalPages}
                  onClick={() => handleSearch(pagination.currentPage + 1)}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg bg-white font-bold hover:bg-gray-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        /* Clean UI Empty States Feedback Panel block */
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300 max-w-xl mx-auto mt-6 flex flex-col items-center p-6">
          <span className="text-2xl mb-2">🔍</span>
          <h4 className="text-sm font-bold text-gray-700">No candidates found</h4>
          <p className="text-xs text-gray-400 mt-1">Try adjusting your filters or search keywords to broaden your exploration parameter fields.</p>
        </div>
      )}

      <CandidateModal 
        candidate={selectedCandidate} 
        missingSkills={missingSkills} 
        onClose={() => setSelectedCandidate(null)} 
      />
    </div>
  );
};

export default SearchTalent;