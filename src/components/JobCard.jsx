import React from "react";
import { Link } from "react-router-dom";
import { 
  FaMapMarkerAlt, 
  FaWallet, 
  FaCalendarAlt, 
  FaCheckCircle, 
  FaBookmark, 
  FaRegBookmark 
} from "react-icons/fa";

export default function JobCard({ job }) {
  // Logic for "New" badge (e.g., if posted < 24h ago)
  const isNew = job.posted === "Just now" || job.posted?.includes("hour");

  return (
    <div className="group relative border border-slate-200 rounded-2xl p-5 bg-white transition-all duration-300 hover:border-blue-400 hover:shadow-xl hover:-translate-y-1">
      
      {/* Top Section: Badges */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex gap-2">
          {isNew && (
            <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
              New
            </span>
          )}
          <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
            {job.type || "Full Time"}
          </span>
        </div>
        <button className="text-slate-400 hover:text-blue-600 transition-colors">
          <FaRegBookmark size={18} />
        </button>
      </div>

      {/* Main Info */}
      <div className="flex gap-4 mb-4">
        <div className="w-14 h-14 rounded-xl border border-slate-100 flex items-center justify-center bg-slate-50 overflow-hidden shrink-0">
          <img 
            src={job.logo || "https://via.placeholder.com/150"} 
            alt={job.company} 
            className="w-10 h-10 object-contain"
          />
        </div>
        <div className="overflow-hidden">
          <h3 className="text-lg font-bold text-slate-800 truncate group-hover:text-blue-600 transition-colors">
            {job.title}
          </h3>
          <div className="flex items-center gap-1 text-slate-500 text-sm">
            <span>{job.company}</span>
            <FaCheckCircle className="text-blue-500 text-[10px]" title="Verified Recruiter" />
          </div>
        </div>
      </div>

      {/* Metadata Grid */}
      <div className="grid grid-cols-2 gap-y-3 gap-x-2 mb-5">
        <div className="flex items-center gap-2 text-slate-600 text-sm">
          <FaMapMarkerAlt className="text-slate-400" />
          <span className="truncate">{job.location}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-600 text-sm">
          <FaWallet className="text-slate-400" />
          <span className="truncate">{job.salary}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-600 text-sm">
          <FaCalendarAlt className="text-slate-400" />
          <span>{job.posted}</span>
        </div>
      </div>

      {/* Skills / Tags */}
      <div className="flex flex-wrap gap-2 mb-6">
        {job.skills?.slice(0, 3).map((skill, index) => (
          <span key={index} className="text-[11px] bg-slate-100 text-slate-600 px-2 py-1 rounded">
            {skill}
          </span>
        ))}
        {job.skills?.length > 3 && (
          <span className="text-[11px] text-slate-400 self-center">+{job.skills.length - 3} more</span>
        )}
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-50">
        <div className="text-[11px] text-slate-400 italic">
          {job.applicantsCount || "0"} applicants
        </div>
        <Link 
          to={`/job/${job.id}`} 
          className="bg-slate-900 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-200"
        >
          View & Apply
        </Link>
      </div>
    </div>
  );
}