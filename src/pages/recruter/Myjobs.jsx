import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import RecruiterNavbar from "../../components/recruter/RecruterNavbar";
import {
  FaPlus, FaEdit, FaTrash, FaSearch, FaChevronLeft, FaChevronRight,
  FaMapMarkerAlt, FaClock, FaUserGraduate, FaCalendarAlt, FaBuilding, 
  FaEye, FaPowerOff, FaUserTie, FaUsers, FaMoneyBillWave, FaSignal,
  FaMagic, FaLightbulb, FaInfoCircle
} from "react-icons/fa";
import "../Styles/Myjobs.css"; 

export default function MyJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Helper for new recruiters
  const commonRoles = ["Software Engineer", "Frontend Developer", "Backend Developer", "Product Manager", "UI/UX Designer", "Data Analyst", "HR Manager", "Sales Executive"];

  const [formData, setFormData] = useState({
    title: "", location: "", salary: "", jobType: "FULL_TIME",
    workMode: "ONSITE", experienceLevel: "FRESHER", skillsRequired: "",
    education: "", description: "", openings: 1, closingDate: ""
  });

  const abortRef = useRef(null);
  const token = localStorage.getItem("token");
  const currentUserEmail = localStorage.getItem("userEmail");

  const [filters, setFilters] = useState({
    keyword: "", location: "", jobType: "ALL", workMode: "ALL",
    experienceLevel: "ALL", status: "ALL", minSalary: 0,
    sortBy: "postedDate,desc"
  });

  const API = "http://localhost:8080/job-portal/jobs";

  const fetchJobs = useCallback(async () => {
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();
    setLoading(true);
    try {
      const params = {
        page: currentPage, size: 8, sort: filters.sortBy,
        keyword: filters.keyword || undefined,
        location: filters.location || undefined,
        jobType: filters.jobType !== "ALL" ? filters.jobType : undefined,
        workMode: filters.workMode !== "ALL" ? filters.workMode : undefined,
        experienceLevel: filters.experienceLevel !== "ALL" ? filters.experienceLevel : undefined,
        status: filters.status !== "ALL" ? filters.status : undefined,
        minSalary: filters.minSalary > 0 ? filters.minSalary : undefined
      };
      const res = await axios.get(`${API}/my-jobs`, {
        params, headers: { Authorization: `Bearer ${token}` },
        signal: abortRef.current.signal
      });
      setJobs(res.data.content || []);
      setTotalPages(res.data.totalPages || 1);
      if (!selectedJob && res.data.content.length > 0) setSelectedJob(res.data.content[0]);
    } catch (err) {
      if (!axios.isCancel(err)) console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  }, [filters, currentPage, token, selectedJob]);

  useEffect(() => {
    const delay = setTimeout(fetchJobs, 300);
    return () => clearTimeout(delay);
  }, [fetchJobs]);

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 🪄 AI Generator Logic
  const generateDescription = () => {
    if (!formData.title || !formData.skillsRequired) {
      alert("Please enter a Job Title and some Skills first!");
      return;
    }
    setIsGenerating(true);
    setTimeout(() => {
      const generatedText = `We are looking for a talented ${formData.title} to join our team.

Key Responsibilities:
- Lead the development of features using ${formData.skillsRequired}.
- Collaborate with teams to ship high-quality products.
- Maintain and optimize existing codebases.

Requirements:
- Proven experience as a ${formData.title}.
- Expertise in ${formData.skillsRequired}.
- Degree in ${formData.education || 'Computer Science or a related field'}.`;
      setFormData(prev => ({ ...prev, description: generatedText }));
      setIsGenerating(false);
    }, 1000);
  };

  const openEditModal = (job) => {
    setFormData({
      ...job,
      closingDate: job.closingDate ? job.closingDate.slice(0, 16) : ""
    });
    setIsModalOpen(true);
  };

  const validateAndSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData.publicId) {
        await axios.put(`${API}/${formData.publicId}`, formData, { headers: { Authorization: `Bearer ${token}` } });
      } else {
        await axios.post(API, formData, { headers: { Authorization: `Bearer ${token}` } });
      }
      setIsModalOpen(false);
      fetchJobs();
    } catch (err) {
      alert("Error saving job.");
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await axios.patch(`${API}/${id}/toggle-status`, {}, { headers: { Authorization: `Bearer ${token}` } });
      fetchJobs();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this listing permanently?")) {
      await axios.delete(`${API}/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setSelectedJob(null);
      fetchJobs();
    }
  };

  return (
    <div className="mj-dashboard">
      <header className="mj-top-bar">
        <div className="mj-title-area">
          <h1>My Listings</h1>
          <p>Active Manager: <strong>{currentUserEmail}</strong></p>
        </div>
        <button className="mj-btn-primary" onClick={() => { 
          setFormData({title: "", location: "", salary: "", jobType: "FULL_TIME", workMode: "ONSITE", experienceLevel: "FRESHER", skillsRequired: "", education: "", description: "", openings: 1, closingDate: ""}); 
          setIsModalOpen(true); 
        }}>
          <FaPlus /> Post New Position
        </button>
      </header>

      <main className="mj-main-grid">
        {/* FILTERS SIDEBAR */}
        <aside className="mj-filters">
          <div className="mj-filter-card">
            <label><FaSearch /> Keywords</label>
            <input type="text" placeholder="Title/Skills..." value={filters.keyword} onChange={(e) => setFilters({...filters, keyword: e.target.value})} />
            
            <label><FaMapMarkerAlt /> Location</label>
            <input type="text" placeholder="City or Remote" value={filters.location} onChange={(e) => setFilters({...filters, location: e.target.value})} />

            <label><FaSignal /> Experience</label>
            <select value={filters.experienceLevel} onChange={(e) => setFilters({...filters, experienceLevel: e.target.value})}>
              <option value="ALL">All Levels</option>
              <option value="FRESHER">Fresher</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="SENIOR">Senior</option>
            </select>

            <label><FaPowerOff /> Status</label>
            <select value={filters.status} onChange={(e) => setFilters({...filters, status: e.target.value})}>
              <option value="ALL">All Status</option>
              <option value="OPEN">Open</option>
              <option value="CLOSED">Closed</option>
            </select>

            <label><FaMoneyBillWave /> Min Salary: ₹{Number(filters.minSalary).toLocaleString()}</label>
            <input type="range" min="0" max="2000000" step="50000" value={filters.minSalary} onChange={(e) => setFilters({...filters, minSalary: e.target.value})} />
          </div>
        </aside>

        {/* LIST SECTION */}
        <section className="mj-list-section">
          <div className="mj-list-scroll">
            {loading ? <div className="loader">Syncing...</div> : jobs.map(job => (
              <div key={job.publicId} className={`mj-item ${selectedJob?.publicId === job.publicId ? "selected" : ""}`} onClick={() => setSelectedJob(job)}>
                <div className="mj-item-info">
                  <h4>{job.title}</h4>
                  <span>{job.location} • {job.jobType.replace('_', ' ')}</span>
                </div>
                <div className="mj-item-meta">
                  <span className={`status-tag ${job.status === "OPEN" ? "status-open" : "status-closed"}`}>{job.status}</span>
                  <strong>₹{(job.salary / 100000).toFixed(1)}L</strong>
                </div>
              </div>
            ))}
          </div>
          <footer className="mj-pagination">
            <button disabled={currentPage === 0} onClick={() => setCurrentPage(p => p - 1)}><FaChevronLeft/></button>
            <span>{currentPage + 1} / {totalPages}</span>
            <button disabled={currentPage >= totalPages - 1} onClick={() => setCurrentPage(p => p + 1)}><FaChevronRight/></button>
          </footer>
        </section>

        {/* DETAIL VIEW */}
        <section className="mj-detail-pane">
          {selectedJob ? (
            <div className="mj-detail-card">
              <div className="mj-detail-header">
                <div>
                  <span className="type-badge">{selectedJob.jobType}</span>
                  <h2>{selectedJob.title}</h2>
                  <p className="company-text"><FaBuilding /> Your Active Post</p>
                </div>
                <div className="mj-action-btns">
                  <button className="btn-icon edit" onClick={() => openEditModal(selectedJob)}><FaEdit /></button>
                  <button className="btn-icon status" onClick={() => handleToggleStatus(selectedJob.publicId)} title="Toggle Status"><FaPowerOff /></button>
                  <button className="btn-icon delete" onClick={() => handleDelete(selectedJob.publicId)}><FaTrash /></button>
                </div>
              </div>

              <div className="mj-stats-grid">
                <div className="stat-box"><span>Salary</span><strong>₹{selectedJob.salary?.toLocaleString()}</strong></div>
                <div className="stat-box"><span>Experience</span><strong>{selectedJob.experienceLevel}</strong></div>
                <div className="stat-box"><span>Applicants</span><strong>{selectedJob.applicantCount || 0}</strong></div>
                <div className="stat-box"><span>Openings</span><strong>{selectedJob.openings || 1}</strong></div>
              </div>

              <div className="mj-detail-body">
                <h5><FaUserTie /> Description</h5>
                <p className="desc-text">{selectedJob.description}</p>
                <h5>Required Skills</h5>
                <div className="mj-skills-list">
                  {selectedJob.skillsRequired?.split(',').map((s, idx) => (
                    <span key={idx} className="skill-pill">{s.trim()}</span>
                  ))}
                </div>
                <ul className="mj-meta-list">
                  <li><FaCalendarAlt /> Posted: {new Date(selectedJob.postedDate).toLocaleDateString()}</li>
                  <li><FaClock /> Deadline: {selectedJob.closingDate ? new Date(selectedJob.closingDate).toLocaleDateString() : "No Deadline"}</li>
                  <li><FaUserGraduate /> Education: {selectedJob.education}</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="mj-empty-state"><FaEye size={40} /><p>Select a job to manage</p></div>
          )}
        </section>
      </main>

      {/* --- INTEGRATED SMART MODAL --- */}
      {isModalOpen && (
        <div className="mj-modal-overlay">
          <div className="mj-smart-modal">
            <form className="mj-modal-form" onSubmit={validateAndSubmit}>
              <div className="modal-header-pro">
                <h3>{formData.publicId ? "Edit Job" : "New Job Listing"}</h3>
                <button type="button" onClick={() => setIsModalOpen(false)}>&times;</button>
              </div>

              <div className="form-grid">
                <div className="input-group full-width">
                  <label>Job Title <FaLightbulb className="hint-icon" /></label>
                  <input name="title" list="job-titles" placeholder="Search or Type Title..." value={formData.title} onChange={handleFormChange} required />
                  <datalist id="job-titles">
                    {commonRoles.map(role => <option key={role} value={role} />)}
                  </datalist>
                </div>

                <div className="input-group"><label>Location</label><input name="location" value={formData.location} onChange={handleFormChange} required /></div>
                <div className="input-group"><label>Salary (Annual)</label><input name="salary" type="number" value={formData.salary} onChange={handleFormChange} required /></div>
                
                <div className="input-group">
                  <label>Work Mode</label>
                  <select name="workMode" value={formData.workMode} onChange={handleFormChange}>
                    <option value="ONSITE">Onsite</option>
                    <option value="REMOTE">Remote</option>
                    <option value="HYBRID">Hybrid</option>
                  </select>
                </div>

                <div className="input-group">
                  <label>Experience Level</label>
                  <select name="experienceLevel" value={formData.experienceLevel} onChange={handleFormChange}>
                    <option value="FRESHER">Fresher</option>
                    <option value="INTERMEDIATE">Intermediate</option>
                    <option value="SENIOR">Senior</option>
                  </select>
                </div>

                <div className="input-group full-width"><label>Required Skills (Comma separated)</label><input name="skillsRequired" value={formData.skillsRequired} onChange={handleFormChange} required /></div>

                <div className="input-group full-width">
                  <div className="label-flex">
                    <label>Job Description</label>
                    <button type="button" className="ai-gen-btn" onClick={generateDescription} disabled={isGenerating}>
                      {isGenerating ? "Writing..." : <><FaMagic /> AI Generate</>}
                    </button>
                  </div>
                  <textarea name="description" rows="5" value={formData.description} onChange={handleFormChange} required />
                </div>

                <div className="input-group"><label>Openings</label><input name="openings" type="number" value={formData.openings} onChange={handleFormChange} /></div>
                <div className="input-group"><label>Deadline</label><input name="closingDate" type="datetime-local" value={formData.closingDate} onChange={handleFormChange} /></div>
              </div>

              <div className="modal-actions-pro">
                <button type="button" className="btn-secondary-pro" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary-pro">Post Job</button>
              </div>
            </form>

            <aside className="mj-form-guide">
              <h4><FaInfoCircle /> Posting Tips</h4>
              <div className="guide-item"><strong>Clear Titles:</strong><p>Avoid jargon. Use standard titles like "Java Developer" for better search reach.</p></div>
              <div className="guide-item"><strong>The AI Tool:</strong><p>Enter a Title and Skills first, then click "AI Generate" to get a professional template.</p></div>
              <div className="guide-item"><strong>Salary:</strong><p>Listings with salary information get 40% more engagement.</p></div>
            </aside>
          </div>
        </div>
      )}
    </div>
  );
}