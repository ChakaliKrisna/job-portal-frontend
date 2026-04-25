import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import RecruiterNavbar from "../../components/recruter/RecruterNavbar";
import {
  FaPlus, FaEdit, FaTrash, FaSearch, FaChevronLeft, FaChevronRight,
  FaMapMarkerAlt, FaClock, FaUserGraduate, FaCalendarAlt, FaBuilding, 
  FaEye, FaPowerOff, FaUserTie, FaUsers, FaMoneyBillWave, FaSignal,
  FaMagic, FaLightbulb, FaInfoCircle,FaLayerGroup,FaBriefcase,FaGraduationCap,FaLaptopHouse,FaCode
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
  const { name, value } = e.target;

  // 1. Update the field being typed in normally
  setFormData((prev) => {
    const updatedData = { ...prev, [name]: value };

    // 2. AUTO-SKILLS LOGIC: Check if the user is changing the "title"
    if (name === "title") {
      // Look up skills for the selected title (e.g., "Frontend Developer")
      const suggestedSkills = skillMapping[value]; 
      
      if (suggestedSkills) {
        // If match found, update the skillsRequired field automatically
        // We keep it as a string here so the user can edit it
        updatedData.skillsRequired = Array.isArray(suggestedSkills) 
          ? suggestedSkills.join(", ") 
          : suggestedSkills;
      }
    }

    return updatedData;
  });
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
  const skillMapping = {
  "Java Developer": "Java 17, Spring Boot, Microservices, JPA, Hibernate, MySQL, Docker",
  "Full Stack Developer": "Java, Spring Boot, React.js, MySQL, REST API, AWS, Tailwind CSS",
  "Frontend Developer": "React.js, TypeScript, Next.js, Redux Toolkit, Framer Motion",
  "Python Developer": "Python, Django, Flask, PostgreSQL, Celery, Redis",
  "UI/UX Designer": "Figma, Adobe XD, Responsive Design, Prototyping, User Research"
};
const CATEGORY_OPTIONS = [
  { value: "SOFTWARE_DEVELOPMENT", label: "Software Development" },
  { value: "DATA_SCIENCE", label: "Data Science" },
  { value: "DEVOPS", label: "DevOps" },
  { value: "CYBER_SECURITY", label: "Cyber Security" },
  { value: "QA_TESTING", label: "QA & Testing" },
  { value: "UI_UX", label: "UI/UX Design" },
  { value: "MANAGEMENT", label: "Management" },
  { value: "OPERATIONS", label: "Operations" },
  { value: "BUSINESS_ANALYST", label: "Business Analyst" },
  { value: "FINANCE", label: "Finance" },
  { value: "ACCOUNTING", label: "Accounting" },
  { value: "MARKETING", label: "Marketing" },
  { value: "SALES", label: "Sales" },
  { value: "DIGITAL_MARKETING", label: "Digital Marketing" },
  { value: "HUMAN_RESOURCES", label: "Human Resources" },
  { value: "CUSTOMER_SUPPORT", label: "Customer Support" },
  { value: "ENGINEERING", label: "Engineering" },
  { value: "EDUCATION", label: "Education" },
  { value: "HEALTHCARE", label: "Healthcare" }];
const today = new Date().toISOString().split("T")[0];

const validateAndSubmit = async (e) => {
  e.preventDefault();

  // 🔴 VALIDATION SECTION
  if (!formData.title?.trim()) {
    return alert("Job title is required");
  }

  if (!formData.category) {
    return alert("Please select a category");
  }

  if (!formData.salary || formData.salary <= 0) {
    return alert("Enter a valid salary");
  }

  if (!formData.location?.trim()) {
    return alert("Location is required");
  }

  if (!formData.closingDate) {
    return alert("Please select a closing date");
  }

  if (formData.closingDate < today) {
    return alert("Closing date cannot be in the past");
  }

  if (!formData.description?.trim()) {
    return alert("Job description is required");
  }

  if (!formData.jobType) {
    return alert("Please select job type");
  }

  // 🟡 SKILLS CONVERSION (String → Array)
  const skillsArray =
    typeof formData.skillsRequired === "string"
      ? formData.skillsRequired
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s !== "")
      : formData.skillsRequired || [];

  // 🔵 FINAL DATA OBJECT
  const dataToSubmit = {
    ...formData,
    skillsRequired: skillsArray,

    // ✅ FIX: Convert to LocalDateTime
    closingDate: formData.closingDate
      ? formData.closingDate + "T23:59:59"
      : null,
  };

  try {
    let response;

    if (formData.publicId) {
      // ✏️ UPDATE
      response = await axios.put(
        `${API}/${formData.publicId}`,
        dataToSubmit,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    } else {
      // 🆕 CREATE
      response = await axios.post(`${API}`, dataToSubmit, {
        headers: { Authorization: `Bearer ${token}` },
      });
    }

    // ✅ SUCCESS HANDLING
    if (response.status === 200 || response.status === 201) {
      setIsModalOpen(false);
      fetchJobs();
      alert(
        formData.publicId
          ? "Job updated successfully!"
          : "Job published successfully!"
      );
    }
  } catch (err) {
    console.error("Submission Error Details:", err.response?.data);

    alert(
      err.response?.data?.message ||
        "Something went wrong. Check console."
    );
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
              {selectedJob?.skillsRequired?.map((s, idx) => (
  <span key={idx} className="skill-tag-modern">
    {s?.trim()}
  </span>
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
        
        {/* Sticky Header */}
        <div className="modal-header-pro">
          <div className="header-title-group">
            <div className="icon-badge"><FaPlus /></div>
            <div>
              <h3>{formData.publicId ? "Update Opportunity" : "Launch New Role"}</h3>
              <p>Post your requirements to the talent pool.</p>
            </div>
          </div>
          <button type="button" className="close-x" onClick={() => setIsModalOpen(false)}>&times;</button>
        </div>

        <div className="form-grid-scroll">
          {/* Section 1: General Information */}
          <div className="form-section-label">General Information</div>
          <div className="form-grid">
            <div className="input-group full-width">
              <label>Job Title <FaLightbulb className="hint-icon" /></label>
              <div className="input-with-icon">
                <FaUserTie className="field-icon" />
                <input 
                  name="title" 
                  list="job-titles" 
                  placeholder="Select or type role..." 
                  value={formData.title} 
                  onChange={handleFormChange} 
                  required 
                />
              </div>
              <datalist id="job-titles">
                {Object.keys(skillMapping).map(role => <option key={role} value={role} />)}
              </datalist>
            </div>

            <div className="input-group">
              <label>Category</label>
              <div className="input-with-icon">
                <FaLayerGroup className="field-icon" />
                <select name="category" value={formData.category} onChange={handleFormChange} required>
                  <option value="" disabled>Select a category</option>
                  {CATEGORY_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="input-group">
              <label>Annual Salary (LPA)</label>
              <div className="input-with-icon">
                <FaMoneyBillWave className="field-icon" />
                <input name="salary" type="number" placeholder="e.g. 12" value={formData.salary} onChange={handleFormChange} required />
              </div>
            </div>
          </div>

          {/* Section 2: Logistics & Deadlines (ENHANCED) */}
          <div className="form-section-label">Configuration & Logistics</div>
          <div className="form-grid">
            <div className="input-group">
              <label>Job Type</label>
              <div className="input-with-icon">
                <FaBriefcase className="field-icon" />
                <select name="jobType" value={formData.jobType} onChange={handleFormChange} required>
                  <option value="">Select Type</option>
                  <option value="FULL_TIME">Full Time</option>
                  <option value="PART_TIME">Part Time</option>
                  <option value="INTERNSHIP">Internship</option>
                  <option value="CONTRACT">Contract</option>
                </select>
              </div>
            </div>

            <div className="input-group">
              <label>Experience Level</label>
              <div className="input-with-icon">
                <FaGraduationCap className="field-icon" />
                <select name="experienceLevel" value={formData.experienceLevel} onChange={handleFormChange} required>
                  <option value="ALL">All Levels</option>
              <option value="FRESHER">Fresher</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="SENIOR">Senior</option>
                </select>
              </div>
            </div>

            <div className="input-group">
              <label>Work Mode</label>
              <div className="input-with-icon">
                <FaLaptopHouse className="field-icon" />
                <select name="workMode" value={formData.workMode} onChange={handleFormChange}>
                  <option value="REMOTE">Remote</option>
                  <option value="ONSITE">Onsite</option>
                  <option value="HYBRID">Hybrid</option>
                </select>
              </div>
            </div>

            <div className="input-group">
              <label>Location</label>
              <div className="input-with-icon">
                <FaMapMarkerAlt className="field-icon" />
                <input name="location" placeholder="City or Remote" value={formData.location} onChange={handleFormChange} required />
              </div>
            </div>

            <div className="input-group">
              <label>Application Deadline</label>
              <div className="input-with-icon">
                <FaCalendarAlt className="field-icon" />
                <input 
  name="closingDate"   // ✅ CORRECT
  type="date" 
  min={today} 
  value={formData.closingDate} 
  onChange={handleFormChange} 
  required 
/>
              </div>
            </div>

            <div className="input-group">
              <label>Openings</label>
              <div className="input-with-icon">
                <FaUsers className="field-icon" />
                <input name="openings" type="number" value={formData.openings} onChange={handleFormChange} />
              </div>
            </div>
          </div>

          {/* Section 3: Requirements */}
          <div className="form-section-label">Detailed Requirements</div>
          <div className="input-group full-width">
  <label>Skills Required (Separate by comma)</label>
  <div className="input-with-icon">
    <FaCode className="field-icon" />
    <input
      name="skillsRequired"
      placeholder="e.g. Java, React, Spring Boot"
      // Show as string: converts ["A", "B"] to "A, B" or just shows "A, "
      value={Array.isArray(formData.skillsRequired) 
        ? formData.skillsRequired.join(", ") 
        : formData.skillsRequired}
      onChange={handleFormChange}
    />
  </div>
</div>
          <div className="input-group full-width">
            <div className="label-flex">
              <label>Job Description</label>
              <button type="button" className="ai-gen-btn-pro" onClick={generateDescription}>
                <FaMagic /> Smart Draft
              </button>
            </div>
            <textarea name="description" rows="5" value={formData.description} onChange={handleFormChange} required />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="modal-actions-pro">
          <button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)}>Discard</button>
          <button type="submit" className="btn-submit-pro">
            {formData.publicId ? "Update Listing" : "Publish Listing"}
          </button>
        </div>
      </form>

      {/* Guide Sidebar */}
      <aside className="mj-form-guide">
        <div className="guide-content">
          <h4>Smart Tools</h4>
          <div className="tip-box">
            <FaLightbulb color="#fbbf24" />
            <p><strong>Auto-Skills:</strong> Selecting a role automatically drafts the top required skills.</p>
          </div>
          <div className="tip-box">
            <FaMagic color="#10b981" />
            <p><strong>AI Writer:</strong> Use Smart Draft to generate a professional JD based on your title.</p>
          </div>
        </div>
      </aside>
    </div>
  </div>
)}  </div>
  );
}