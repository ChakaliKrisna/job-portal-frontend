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

  // --- FIXED FETCH LOGIC ---
  const fetchJobs = useCallback(async () => {
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();
    setLoading(true);

    try {
      // Build clean params: If a value is "ALL", don't send it to the backend
      const params = {
        page: currentPage,
        size: 8,
        sort: filters.sortBy,
        keyword: filters.keyword || undefined,
        location: filters.location || undefined,
        jobType: filters.jobType !== "ALL" ? filters.jobType : undefined,
        workMode: filters.workMode !== "ALL" ? filters.workMode : undefined,
        experienceLevel: filters.experienceLevel !== "ALL" ? filters.experienceLevel : undefined,
        status: filters.status !== "ALL" ? filters.status : undefined,
        minSalary: Number(filters.minSalary) > 0 ? filters.minSalary : undefined
      };

      const res = await axios.get(`${API}/my-jobs`, {
        params, 
        headers: { Authorization: `Bearer ${token}` },
        signal: abortRef.current.signal
      });

      const content = res.data.content || [];
      setJobs(content);
      setTotalPages(res.data.totalPages || 1);
      
      // Only set initial selected job if none is currently selected
      if (content.length > 0 && !selectedJob) {
        setSelectedJob(content[0]);
      }
    } catch (err) {
      if (!axios.isCancel(err)) console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
    // Removed selectedJob from dependencies to prevent re-fetch loops on selection
  }, [filters, currentPage, token, API]); 

  useEffect(() => {
    const delay = setTimeout(fetchJobs, 300);
    return () => clearTimeout(delay);
  }, [fetchJobs]);

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const generateDescription = () => {
    if (!formData.title || !formData.skillsRequired) {
      alert("Please enter a Job Title and some Skills first!");
      return;
    }
    setIsGenerating(true);
    setTimeout(() => {
      const generatedText = `We are looking for a talented ${formData.title} to join our team.\n\nKey Responsibilities:\n- Lead development using ${formData.skillsRequired}.\n- Collaborate with teams to ship products.\n\nRequirements:\n- Proven experience as a ${formData.title}.\n- Expertise in ${formData.skillsRequired}.`;
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
      try {
        await axios.delete(`${API}/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        setSelectedJob(null);
        fetchJobs();
      } catch (err) { console.error(err); }
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

        <section className="mj-list-section">
          <div className="mj-list-scroll">
            {loading ? <div className="loader">Syncing...</div> : jobs.length === 0 ? <p className="no-data">No jobs found.</p> : jobs.map(job => (
              <div key={job.publicId} className={`mj-item ${selectedJob?.publicId === job.publicId ? "selected" : ""}`} onClick={() => setSelectedJob(job)}>
                <div className="mj-item-info">
                  <h4>{job.title}</h4>
                  <span>{job.location} • {job.jobType?.replace('_', ' ')}</span>
                </div>
                <div className="mj-item-meta">
                  <span className={`status-tag ${job.status === "OPEN" ? "status-open" : "status-closed"}`}>{job.status}</span>
                  <strong>₹{job.salary ? (job.salary / 100000).toFixed(1) : 0}L</strong>
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

      <section className="mj-detail-pane">
  {selectedJob ? (
    <div className="mj-detail-card animated-fade-in">
      {/* 1. Dynamic Status Ribbon */}
      <div className={`mj-status-banner ${selectedJob.status === "OPEN" ? "bg-open" : "bg-closed"}`}>
        {selectedJob.status === "OPEN" ? "Active & Accepting Applications" : "Inactive / Closed to Applicants"}
      </div>

      <div className="mj-detail-content">
        {/* 2. Enhanced Header with Quick Actions */}
        <header className="mj-detail-header-pro">
          <div className="header-main-info">
            <div className="badge-row">
              <span className="type-tag">{selectedJob.jobType?.replace('_', ' ')}</span>
              <span className="mode-tag">{selectedJob.workMode}</span>
            </div>
            <h2>{selectedJob.title}</h2>
            <p className="loc-text"><FaMapMarkerAlt /> {selectedJob.location}</p>
          </div>

          <div className="mj-action-toolbar">
            <button className="btn-secondary-pro sm" onClick={() => openEditModal(selectedJob)}>
              <FaEdit /> Edit
            </button>
            <button 
              className={`btn-secondary-pro sm ${selectedJob.status === "OPEN" ? "text-danger" : "text-success"}`} 
              onClick={() => handleToggleStatus(selectedJob.publicId)}
            >
              <FaPowerOff /> {selectedJob.status === "OPEN" ? "Close Job" : "Reopen"}
            </button>
            <button className="btn-danger-icon" onClick={() => handleDelete(selectedJob.publicId)}>
              <FaTrash />
            </button>
          </div>
        </header>

        {/* 3. Visual Stats Grid */}
        <div className="mj-stats-visual-grid">
          <div className="stat-card-pro">
            <div className="icon-circle bg-blue"><FaMoneyBillWave /></div>
            <div className="stat-data">
              <label>Budget (Annual)</label>
              <strong>₹{selectedJob.salary?.toLocaleString()}</strong>
            </div>
          </div>
          <div className="stat-card-pro">
            <div className="icon-circle bg-purple"><FaUsers /></div>
            <div className="stat-data">
              <label>Total Applicants</label>
              <strong>{selectedJob.applicantCount || 0}</strong>
            </div>
          </div>
          <div className="stat-card-pro">
            <div className="icon-circle bg-orange"><FaSignal /></div>
            <div className="stat-data">
              <label>Experience</label>
              <strong>{selectedJob.experienceLevel}</strong>
            </div>
          </div>
          <div className="stat-card-pro">
            <div className="icon-circle bg-green"><FaUserTie /></div>
            <div className="stat-data">
              <label>Openings</label>
              <strong>{selectedJob.openings || 1}</strong>
            </div>
          </div>
        </div>

        {/* 4. Tab-like Body Sections */}
        <div className="mj-detail-sections">
          <section className="detail-info-block">
            <h4><FaInfoCircle /> Job Overview</h4>
            <p className="desc-text-pro">{selectedJob.description}</p>
          </section>

          <section className="detail-info-block">
            <h4><FaMagic /> Required Competencies</h4>
            <div className="mj-skills-tag-cloud">
              {selectedJob.skillsRequired?.split(',').map((s, idx) => (
                <span key={idx} className="skill-tag-modern">{s.trim()}</span>
              ))}
            </div>
          </section>

          <section className="mj-meta-footer">
            <div className="meta-item">
              <FaCalendarAlt /> <span>Posted on: <strong>{new Date(selectedJob.postedDate).toLocaleDateString()}</strong></span>
            </div>
            <div className="meta-item">
              <FaClock /> <span>Closing: <strong className={selectedJob.closingDate ? "text-warning" : ""}>{selectedJob.closingDate ? new Date(selectedJob.closingDate).toLocaleDateString() : "Rolling Basis"}</strong></span>
            </div>
            <div className="meta-item">
              <FaUserGraduate /> <span>Education: <strong>{selectedJob.education}</strong></span>
            </div>
          </section>
        </div>
        
        {/* 5. Feature Enhancement: Primary Action CTA */}
        <div className="mj-footer-actions">
           <button className="mj-btn-primary full-width-btn">
             View All {selectedJob.applicantCount || 0} Candidates
           </button>
        </div>
      </div>
    </div>
  ) : (
    <div className="mj-empty-state-pro">
      <div className="empty-illustration">
        <FaEye size={60} />
      </div>
      <h3>No Job Selected</h3>
      <p>Select a listing from the left panel to manage candidates and job details.</p>
    </div>
  )}
</section>
      </main>

      {/* MODAL REMAINS THE SAME */}
      {isModalOpen && (
  <div className="mj-modal-overlay">
    <div className="mj-smart-modal animated-zoom-in">
      <form className="mj-modal-form" onSubmit={validateAndSubmit}>
        <div className="modal-header-pro">
          <div className="header-title-group">
            <div className="icon-badge"><FaPlus /></div>
            <div>
              <h3>{formData.publicId ? "Edit Job Listing" : "Create New Listing"}</h3>
              <p>Fill in the details to find your next great hire.</p>
            </div>
          </div>
          <button type="button" className="close-x" onClick={() => setIsModalOpen(false)}>&times;</button>
        </div>

        <div className="form-grid-scroll">
          <div className="form-section-label">General Information</div>
          <div className="form-grid">
            <div className="input-group full-width">
              <label>Job Title <FaLightbulb className="hint-icon" /></label>
              <div className="input-with-icon">
                 <FaUserTie className="field-icon" />
                 <input name="title" list="job-titles" placeholder="e.g. Senior Java Developer" value={formData.title} onChange={handleFormChange} required />
              </div>
              <datalist id="job-titles">
                {commonRoles.map(role => <option key={role} value={role} />)}
              </datalist>
            </div>

            <div className="input-group">
              <label>Location</label>
              <div className="input-with-icon">
                <FaMapMarkerAlt className="field-icon" />
                <input name="location" placeholder="City or Remote" value={formData.location} onChange={handleFormChange} required />
              </div>
            </div>

            <div className="input-group">
              <label>Annual Salary (₹)</label>
              <div className="input-with-icon">
                <FaMoneyBillWave className="field-icon" />
                <input name="salary" type="number" placeholder="LPA" value={formData.salary} onChange={handleFormChange} required />
              </div>
            </div>
          </div>

          <div className="form-section-label">Work Configuration</div>
          <div className="form-grid">
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
          </div>

          <div className="form-section-label">Detailed Requirements</div>
          <div className="input-group full-width">
            <label>Skills Required</label>
            <input name="skillsRequired" placeholder="Java, Spring Boot, React..." value={formData.skillsRequired} onChange={handleFormChange} required />
          </div>

          <div className="input-group full-width">
            <div className="label-flex">
              <label>Job Description</label>
              <button type="button" className={`ai-gen-btn-pro ${isGenerating ? 'loading' : ''}`} onClick={generateDescription} disabled={isGenerating}>
                {isGenerating ? <div className="spinner"></div> : <><FaMagic /> Write with AI</>}
              </button>
            </div>
            <textarea name="description" rows="6" placeholder="Describe the role and responsibilities..." value={formData.description} onChange={handleFormChange} required />
          </div>
        </div>

        <div className="modal-actions-pro">
          <button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)}>Discard</button>
          <button type="submit" className="btn-submit-pro">
            {formData.publicId ? "Save Changes" : "Publish Job"}
          </button>
        </div>
      </form>

      <aside className="mj-form-guide">
        <div className="guide-card">
          <h4><FaInfoCircle /> Pro Tips</h4>
          <ul>
            <li><strong>Keywords:</strong> Use specific technologies in the title.</li>
            <li><strong>Salary:</strong> Listings with transparent pay get 30% more applicants.</li>
            <li><strong>AI Tool:</strong> Let AI draft your description to save time!</li>
          </ul>
        </div>
      </aside>
    </div>
  </div>
)}   </div>
  );
}