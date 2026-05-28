import React from 'react';

const ComparisonPanel = ({ comparisonList, missingSkills, onToggleComparison, onClear }) => {
  if (comparisonList.length === 0) return null;

  return (
    <div className="bg-slate-900 text-white p-5 rounded-xl mb-6 shadow-md border border-slate-800">
      <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-2">
        <h4 className="text-sm font-bold tracking-wider uppercase text-blue-400">Candidate Comparison</h4>
        <button onClick={onClear} className="text-xs text-slate-400 hover:text-white underline">Clear Workspace</button>
      </div>
      
      <div className="overflow-x-auto pb-2">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs min-w-[600px] md:min-w-0">
          <div className="font-bold text-slate-400 hidden md:flex flex-col space-y-4 pt-10">
            <div className="h-8">Candidate</div>
            <div className="h-8">Match Progress</div>
            <div className="h-10">Skills Profile</div>
            <div className="h-8">Skill Gaps</div>
          </div>

          {comparisonList.map(candidate => (
            <div key={candidate.applicationId} className="p-3 bg-slate-800/80 rounded-lg border border-slate-700 flex flex-col justify-between">
              <div className="border-b border-slate-700 pb-2 mb-2 h-10">
                <div className="font-bold text-white truncate">{candidate.candidateName}</div>
                <div className="text-[10px] text-slate-400 truncate">{candidate.email}</div>
              </div>
              
              <div className="space-y-3">
                <div className="h-8 flex flex-col justify-center">
                  <span className="md:hidden font-bold text-slate-400 block text-[10px] uppercase">Score</span>
                  <span className="font-mono font-bold text-emerald-400 text-sm">{Number(candidate.matchScore).toFixed(0)}% Match</span>
                </div>
                
                <div className="h-10 overflow-hidden">
                  <span className="md:hidden font-bold text-slate-400 block text-[10px] uppercase">Skills</span>
                  <div className="text-[10px] text-slate-300 line-clamp-2">{candidate.skills?.join(', ') || 'None'}</div>
                </div>
                
                <div className="h-8 overflow-hidden">
                  <span className="md:hidden font-bold text-slate-400 block text-[10px] uppercase">Gaps</span>
                  <div className="text-[10px] text-red-300 truncate">
                    {missingSkills[candidate.applicationId]?.join(', ') || 'Click Analyze on card'}
                  </div>
                </div>
              </div>

              <button 
                onClick={() => onToggleComparison(candidate)} 
                className="mt-3 w-full py-1.5 text-[10px] bg-slate-700 hover:bg-red-700 text-center rounded-md transition font-medium uppercase"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ComparisonPanel;