import React from 'react';

const PIPELINE_STEPS = ['APPLIED', 'REVIEWED', 'SHORTLISTED', 'INTERVIEW', 'HIRED'];

const CandidateModal = ({ candidate, missingSkills, onClose }) => {
  if (!candidate) return null;

  const currentStepIndex = PIPELINE_STEPS.indexOf(candidate.status);

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl border border-gray-200 max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl font-light">×</button>
        
        <div className="border-b border-gray-100 pb-4 mb-4">
          <span className="px-2 py-0.5 bg-blue-600 text-white font-mono text-[10px] font-bold rounded tracking-wide uppercase">Candidate Dossier</span>
          <h3 className="text-xl font-bold text-gray-900 mt-2">{candidate.candidateName}</h3>
          <p className="text-xs font-medium text-gray-500">{candidate.email}</p>
        </div>

        {/* Pipeline Stage Visual Timeline Progress */}
        <div className="mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
          <span className="block text-[10px] font-bold text-gray-400 uppercase mb-3 tracking-wide">Application Progress</span>
          <div className="flex items-center justify-between relative w-full">
            {PIPELINE_STEPS.map((step, idx) => {
              const isCompleted = idx <= currentStepIndex && candidate.status !== 'REJECTED';
              const isCurrent = idx === currentStepIndex;
              return (
                <div key={step} className="flex flex-col items-center flex-1 relative z-10">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border transition ${
                    candidate.status === 'REJECTED' && isCurrent 
                      ? 'bg-red-100 border-red-400 text-red-700'
                      : isCompleted 
                        ? 'bg-blue-600 border-blue-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-400'
                  }`}>
                    {candidate.status === 'REJECTED' && isCurrent ? '✕' : idx + 1}
                  </div>
                  <span className={`text-[9px] font-bold mt-1.5 ${isCurrent ? 'text-blue-600 font-extrabold' : 'text-gray-400'}`}>
                    {step}
                  </span>
                </div>
              );
            })}
            <div className="absolute top-3 left-0 right-0 h-0.5 bg-gray-200 -z-0" />
          </div>
        </div>

        <div className="space-y-4 text-xs text-gray-700">
          <div className="grid grid-cols-2 gap-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
            <div>
              <span className="font-bold text-gray-400 block uppercase text-[9px]">Target Position</span>
              <span className="font-semibold text-gray-800 text-sm">{candidate.jobTitle || 'General Application Pool'}</span>
            </div>
            <div>
              <span className="font-bold text-gray-400 block uppercase text-[9px]">ATS Match Rating</span>
              <span className="font-mono font-bold text-emerald-600 text-sm">{Number(candidate.matchScore).toFixed(0)}% Match Compliance</span>
            </div>
          </div>

          <div>
            <span className="font-bold text-gray-500 block mb-1 uppercase text-[10px]">Skills Matrix</span>
            <div className="flex flex-wrap gap-1">
              {candidate.skills?.map((skill, index) => (
                <span key={index} className="bg-blue-50 text-blue-700 border border-blue-100 font-medium px-2 py-0.5 rounded text-[10px]">
                  {skill}
                </span>
              )) || <span className="text-gray-400 italic">No structural skill nodes parsed.</span>}
            </div>
          </div>

          {missingSkills[candidate.applicationId] && (
            <div>
              <span className="font-bold text-red-600 block mb-1 uppercase text-[10px]">Skill Deficit Gap Analysis</span>
              <div className="bg-red-50 text-red-800 p-2.5 rounded-lg border border-red-100 font-medium">
                {missingSkills[candidate.applicationId].join(', ') || 'Candidate fully qualifies for target application criteria.'}
              </div>
            </div>
          )}

          {/* Embedded PDF Resume Document Frame */}
          <div>
            <span className="font-bold text-gray-500 block mb-1.5 uppercase text-[10px]">Resume Document Live View</span>
            <div className="w-full h-64 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
              <iframe 
                src={`https://job-portal-backend-365l.onrender.com${candidate.resumeUrl}#toolbar=0`} 
                title="Resume Preview" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end gap-2">
            <button onClick={onClose} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-bold transition text-xs uppercase">Close View</button>
            <a 
              href={`https://job-portal-backend-365l.onrender.com${candidate.resumeUrl}`} 
              target="_blank" 
              rel="noreferrer" 
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition text-xs shadow-sm uppercase tracking-wide"
            >
              Download Full PDF
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateModal;