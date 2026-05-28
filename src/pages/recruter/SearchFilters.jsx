import React from 'react';

const SearchFilters = ({ filters, handleInputChange, showAdvanced, setShowAdvanced }) => {
  return (
    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm mb-6 flex flex-col gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Keyword Search</label>
          <input 
            type="text" 
            name="keyword" 
            value={filters.keyword} 
            onChange={handleInputChange} 
            className="w-full p-2.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50" 
            placeholder="Search by name, email, or role..." 
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Minimum Match Score ({filters.minScore}%)</label>
          <input 
            type="range" 
            min="0" 
            max="100" 
            name="minScore" 
            value={filters.minScore} 
            onChange={handleInputChange} 
            className="w-full h-2 bg-gray-200 rounded-lg cursor-pointer accent-blue-600" 
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Application Status</label>
          <select 
            name="status" 
            value={filters.status} 
            onChange={handleInputChange} 
            className="w-full p-2.5 text-xs border border-gray-300 rounded-lg bg-white cursor-pointer focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Applications</option>
            <option value="APPLIED">Applied</option>
            <option value="REVIEWED">Reviewed</option>
            <option value="SHORTLISTED">Shortlisted</option>
            <option value="INTERVIEW">Interview</option>
            <option value="REJECTED">Rejected</option>
            <option value="HIRED">Hired</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Sort Candidates</label>
          <select 
            name="sortBy" 
            value={filters.sortBy} 
            onChange={handleInputChange} 
            className="w-full p-2.5 text-xs border border-gray-300 rounded-lg bg-white cursor-pointer focus:ring-2 focus:ring-blue-500"
          >
            <option value="highestMatch">Highest Match</option>
            <option value="lowestMatch">Lowest Match</option>
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>

      {showAdvanced && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-gray-100 transition-all">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Location</label>
            <input 
              type="text" 
              name="location" 
              value={filters.location} 
              onChange={handleInputChange} 
              placeholder="e.g. Remote, Mumbai" 
              className="w-full p-2.5 text-xs border border-gray-200 rounded-lg bg-gray-50" 
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Work Mode</label>
            <select 
              name="workMode" 
              value={filters.workMode} 
              onChange={handleInputChange} 
              className="w-full p-2.5 text-xs border border-gray-200 rounded-lg bg-white cursor-pointer"
            >
              <option value="">Any Mode</option>
              <option value="REMOTE">Remote</option>
              <option value="HYBRID">Hybrid</option>
              <option value="ONSITE">Onsite</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Experience Level</label>
            <input 
              type="text" 
              name="experience" 
              value={filters.experience} 
              onChange={handleInputChange} 
              placeholder="e.g. Entry, 2+ Years" 
              className="w-full p-2.5 text-xs border border-gray-200 rounded-lg bg-gray-50" 
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Skill Filter</label>
            <input 
              type="text" 
              name="skill" 
              value={filters.skill} 
              onChange={handleInputChange} 
              placeholder="e.g. React, Spring Boot" 
              className="w-full p-2.5 text-xs border border-gray-200 rounded-lg bg-gray-50" 
            />
          </div>
        </div>
      )}

      <div className="flex justify-start pt-2">
        <button 
          type="button" 
          onClick={() => setShowAdvanced(!showAdvanced)} 
          className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition underline underline-offset-4"
        >
          {showAdvanced ? "Hide Advanced Filters" : "Show Advanced Filters"}
        </button>
      </div>
    </div>
  );
};

export default SearchFilters;