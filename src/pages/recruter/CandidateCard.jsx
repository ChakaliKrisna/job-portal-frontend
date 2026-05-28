import React from 'react';

export const STATUS_STYLES = {
  APPLIED: "bg-blue-50 text-blue-700 border-blue-200",
  REVIEWED: "bg-amber-50 text-amber-700 border-amber-200",
  SHORTLISTED: "bg-purple-50 text-purple-700 border-purple-200",
  INTERVIEW: "bg-indigo-50 text-indigo-700 border-indigo-200",
  REJECTED: "bg-red-50 text-red-700 border-red-200",
  HIRED: "bg-emerald-50 text-emerald-700 border-emerald-200"
};

const CandidateCard = ({ 
  candidate, 
  isSaved, 
  isComparing, 
  note, 
  analyzingId, 
  missingSkills, 
  onToggleSave, 
  onToggleComparison, 
  onFetchMissingSkills, 
  onSelectCandidate,
  onNoteChange 
}) => {
  const matchScore = Number(candidate.matchScore) || 0;

  return (
    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col hover:shadow-md transition relative">
      <button 
        type="button" 
        onClick={() => onToggleSave(candidate.applicationId)} 
        className="absolute top-4 right-4 text-lg focus:outline-none hover:scale-110 transition"
      >
        {isSaved ? '⭐' : '☆'}
      </button>

      <div className="flex justify-between items-start mb-3 pr-6">
        <div className="max-w-[75%]">
          <h3 
            onClick={() => onSelectCandidate(candidate)} 
            className="text-base font-bold text-gray-900 truncate cursor-pointer hover:text-blue-600 transition"
          >
            {candidate.candidateName}
          </h3>
          <p className="text-xs text-gray-500 font-medium truncate">{candidate.email}</p>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-xs font-bold text-gray-700">{matchScore.toFixed(0)}% Match</span>
          <div className="w-16 bg-gray-200 rounded-full h-1.5 mt-1">
            <div 
              className={`h-1.5 rounded-full ${matchScore >= 80 ? 'bg-emerald-500' : matchScore >= 50 ? 'bg-amber-500' : 'bg-red-500'}`} 
              style={{ width: `${matchScore}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mb-4 p-2.5 bg-gray-50 rounded-lg border border-gray-100 text-[11px]">
        <span className="text-gray-400 font-bold block text-[9px] uppercase tracking-wide">Job Position</span>
        <div className="font-semibold text-gray-700 truncate mt-0.5">{candidate.jobTitle || 'General Applicant Pool'}</div>
        <div className="flex justify-between items-center mt-2 pt-1.5 border-t border-gray-200/60">
          <span className="text-gray-400">Status:</span>
          <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded border uppercase ${STATUS_STYLES[candidate.status] || 'bg-gray-50 text-gray-700'}`}>
            {candidate.status || 'UNASSIGNED'}
          </span>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex flex-wrap gap-1">
          {candidate.skills?.slice(0, 3).map((skill, index) => (
            <span key={index} className="bg-slate-100 text-slate-700 border border-slate-200 text-[10px] px-2 py-0.5 rounded-sm font-medium">
              {skill}
            </span>
          ))}
          {candidate.skills?.length > 3 && (
            <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-1.5 rounded-sm flex items-center">
              +{candidate.skills.length - 3} more
            </span>
          )}
        </div>
      </div>

      <div className="mb-4 mt-auto">
        <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-tight mb-1">Recruiter Notes</label>
        <textarea 
          value={note} 
          onChange={(e) => onNoteChange(candidate.applicationId, e.target.value)}
          placeholder="Add evaluation notes here..."
          className="w-full p-2 text-[11px] border border-gray-200 rounded-lg bg-gray-50/50 focus:bg-white resize-none h-12 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100">
        <button 
          type="button" 
          onClick={() => onToggleComparison(candidate)}
          className={`text-center py-1.5 px-2 text-[10px] font-bold rounded-lg transition border ${
            isComparing ? 'bg-amber-50 border-amber-300 text-amber-700' : 'bg-gray-50 hover:bg-gray-100 text-gray-600 border-gray-200'
          }`}
        >
          {isComparing ? 'Remove' : 'Compare Candidate'}
        </button>

        <button 
          type="button"
          onClick={() => onFetchMissingSkills(candidate.applicationId)}
          className="text-center bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold py-1.5 px-2 text-[10px] rounded-lg border border-blue-100 transition"
        >
          {analyzingId === candidate.applicationId ? 'Analyzing...' : 'Analyze Missing Skills'}
        </button>
      </div>

      {missingSkills[candidate.applicationId] && (
        <div className="mt-3 text-[10px] bg-red-50 text-red-800 p-2 rounded-lg border border-red-100/60">
          <span className="font-bold">Missing Skills:</span> {missingSkills[candidate.applicationId].join(', ') || 'None! Matches perfectly.'}
        </div>
      )}
    </div>
  );
};

export default CandidateCard;