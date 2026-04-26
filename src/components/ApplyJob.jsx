import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  FaCheckCircle, FaCloudUploadAlt, FaFilePdf, FaBriefcase, FaMapMarkerAlt, 
  FaWallet, FaChartPie, FaShieldAlt, FaInfoCircle, FaBuilding, 
  FaKeyboard, FaTimes, FaUserCheck, FaEdit, FaArrowLeft, FaClock, FaGlobe, FaSpinner
} from "react-icons/fa";
import axios from "axios";
import "../components/Styles/applyjob.css";

const API_BASE = "http://localhost:8080";

const ApplyJob = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // --- Data States ---
  const [profile, setProfile] = useState(null);
  const [jobDetails, setJobDetails] = useState(null);
  const [missingSkills, setMissingSkills] = useState([]);
  const [completion, setCompletion] = useState(0);
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [matchScore, setMatchScore] = useState(0);
const [isDirty, setIsDirty] = useState(false);
  // --- Form States ---
  const [extraSkills, setExtraSkills] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  const [useExistingResume, setUseExistingResume] = useState(true);
  const [coverLetter, setCoverLetter] = useState("");
  const [availability, setAvailability] = useState("Immediate");
  const [workPreference, setWorkPreference] = useState("Remote");
  const [useProfileData, setUseProfileData] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  
  // --- UI States ---
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  // Initial Data Fetch
  useEffect(() => {
    if (!token) return navigate("/login");

    const fetchAllData = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const [profRes, missRes, jobRes, compRes, applyCheck] = await Promise.all([
          axios.get(`${API_BASE}/api/users/student/profile`, { headers }),
          axios.get(`${API_BASE}/job-portal/applications/jobs/${jobId}/missing-skills`, { headers }),
          axios.get(`${API_BASE}/job-portal/jobs/${jobId}`, { headers }),
          axios.get(`${API_BASE}/api/users/student/profile/completion`, { headers }),
          axios.get(`${API_BASE}/job-portal/applications/check/${jobId}`, { headers })
        ]);

        setProfile(profRes.data);
        setName(profRes.data?.name || "");
        setEmail(profRes.data?.email || "");
        setMissingSkills(missRes.data || []);
        setJobDetails(jobRes.data);
        setCompletion(compRes.data);
        setAlreadyApplied(applyCheck.data);
      } catch (err) {
        navigate("/jobs");
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, [jobId, token, navigate]);

  // Debounced Match Score with AbortController (Fix 6)
  useEffect(() => {
    if (!token || loading || alreadyApplied) return;
    const controller = new AbortController();

    const fetchScore = async () => {
      try {
        const res = await axios.get(`${API_BASE}/job-portal/applications/jobs/${jobId}/match-score`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { extraSkills: extraSkills || "" },
          signal: controller.signal
        });
        setMatchScore(res.data);
      } catch (err) { if (!axios.isCancel(err)) console.error(err); }
    };

    const timeoutId = setTimeout(fetchScore, 600);
    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [extraSkills, jobId, token, loading, alreadyApplied]);

  // Form Validation (Fix 1 & 5)
  const validateForm = () => {
    if (coverLetter.trim().length < 20) {
      alert("Cover letter must be at least 20 characters.");
      return false;
    }
    if (!useExistingResume && !resumeFile) {
      alert("Please upload a new resume PDF.");
      return false;
    }
    if (!useProfileData) {
      if (!name.trim()) { alert("Please enter your name."); return false; }
      if (!email.includes("@")) { alert("Please enter a valid email."); return false; }
    }
    return true;
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type !== "application/pdf") return alert("Only PDF allowed");
    if (file.size > 5 * 1024 * 1024) return alert("Max size 5MB");
    setResumeFile(file);
  };

  const handleFinalSubmit = async () => {
    setSubmitting(true);
    try {
      let finalResumeUrl = profile?.resumeUrl;
      if (!useExistingResume && resumeFile) {
        const formData = new FormData();
        formData.append("file", resumeFile);
        const uploadRes = await axios.post(`${API_BASE}/api/users/student/upload`, formData, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" }
        });
        finalResumeUrl = uploadRes.data.url;
      }

      await axios.post(`${API_BASE}/job-portal/applications/${jobId}`, {
        resumeUrl: finalResumeUrl,
        coverLetter: coverLetter.trim(),
        extraSkills: extraSkills ? extraSkills.split(",").map(s => s.trim()) : [],
        override: !useProfileData,
        name: useProfileData ? profile.name : name,
        email: useProfileData ? profile.email : email,
        position: jobDetails.title, // Fix 7
        availability,
        workPreference
      }, { headers: { Authorization: `Bearer ${token}` } });

      setSuccess(true);
    } catch (err) {
      alert(err.response?.data?.message || "Application failed.");
    } finally {
      setSubmitting(false);
      setShowConfirm(false);
    }
  };
  const handleSafeBack = () => {
  if (isDirty && !success) {
    const confirmLeave = window.confirm(
      "You have unsaved changes in your application. Are you sure you want to leave?"
    );
    if (confirmLeave) navigate("/jobs");
  } else {
    navigate("/jobs");
  }
};

  if (loading) return <div className="modern-loader"><FaSpinner className="spin" /> Loading Opportunity...</div>;

  return (
    <div className="apply-page-container">
      {/* Premium Navbar */}
     <nav className="top-nav-glass">
  {/* Left: Quick Actions & Context */}
  <div className="nav-left">
    <button className="back-link" onClick={handleSafeBack}>
      <FaArrowLeft /> <span>Exit Application</span>
    </button>
    <div className="nav-divider"></div>
    <div className="nav-job-info">
      <span className="applying-label">Applying for</span>
      <div className="job-title-stack">
        <strong>{jobDetails?.title}</strong> 
        <span className="company-tag">@ {jobDetails?.companyName}</span>
      </div>
    </div>
  </div>

  {/* Center: Completion Status (Encourages User) */}
  <div className="nav-center">
    <div className="app-progress-shield">
      <div className="progress-label">Application Integrity</div>
      <div className="progress-track">
        <div 
          className="progress-fill" 
          style={{ width: `${completion}%` }}
        ></div>
      </div>
    </div>
  </div>

  {/* Right: Personal Status */}
  <div className="nav-right">
    <div className="user-mini-profile">
      <div className="user-info">
        <p className="u-name">{profile?.name}</p>
        <p className="u-status"><FaUserCheck /> Verified Student</p>
      </div>
      <div className="user-avatar-small">
        {profile?.name?.charAt(0)}
      </div>
    </div>
  </div>
</nav>

      <div className="apply-layout">
        {/* LEFT COLUMN: THE FORM */}
        <div className="form-column">
          {alreadyApplied ? (
            // Fix 3: Already Applied UI
            <div className="glass-panel applied-status-card animate-slide-up">
              <FaCheckCircle className="status-icon" />
              <h2>Application in Review</h2>
              <p>You have already applied for this position. We've notified the recruiter!</p>
              <div className="applied-actions">
                <button className="btn-secondary" onClick={() => navigate("/applications")}>View My Applications</button>
                <button className="btn-text" onClick={() => navigate("/jobs")}>Keep Browsing</button>
              </div>
            </div>
          ) : (
            <div className="animate-slide-up">
              {/* Identity Section */}
              <section className="glass-panel">
                <div className="section-header">
                  <FaUserCheck className="header-icon" />
                  <h3>Candidate Identity</h3>
                </div>
                <div className="identity-toggle">
                  <button className={useProfileData ? "active" : ""} onClick={() => setUseProfileData(true)}>My Profile</button>
                  <button className={!useProfileData ? "active" : ""} onClick={() => setUseProfileData(false)}>Custom Alias</button>
                </div>
                {!useProfileData && (
                  <div className="grid-2 animate-fade">
                    <div className="input-group">
                      <label>Full Name</label>
                      <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="John Doe" />
                    </div>
                    <div className="input-group">
                      <label>Email Address</label>
                      <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="john@example.com" />
                    </div>
                  </div>
                )}
              </section>

              {/* Position Logic */}
              <section className="glass-panel mt-20">
                <div className="section-header">
                  <FaBriefcase className="header-icon" />
                  <h3>Logistics</h3>
                </div>
                <div className="grid-2">
                  <div className="input-group">
                    <label>Availability</label>
                    <select value={availability} onChange={e => setAvailability(e.target.value)}>
                      <option>Immediate</option>
                      <option>15 Days</option>
                      <option>30 Days</option>
                    </select>
                  </div>
                  <div className="input-group">
                    <label>Work Mode</label>
                    <select value={workPreference} onChange={e => setWorkPreference(e.target.value)}>
                      <option>Remote</option>
                      <option>Hybrid</option>
                      <option>On-Site</option>
                    </select>
                  </div>
                </div>
              </section>

              {/* Skills & Cover Letter */}
              <section className="glass-panel mt-20">
                <div className="section-header">
                  <FaKeyboard className="header-icon" />
                  <h3>Skills & Statement</h3>
                </div>
                <div className="input-group">
                  <label>Additional Skills (Optional)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Docker, AWS, GraphQL" 
                    value={extraSkills} 
                    onChange={e => setExtraSkills(e.target.value)} 
                  />
                </div>
                <div className="input-group mt-15">
                  <div className="label-row">
                    <label>Cover Letter</label>
                    <span className={coverLetter.length < 20 ? "char-count error" : "char-count"}>
                      {coverLetter.length}/500 (Min 20)
                    </span>
                  </div>
                  <textarea 
                    rows="6" 
                    placeholder="Tell the recruiter why you're a great fit..."
                    value={coverLetter}
                    onChange={e => setCoverLetter(e.target.value)}
                  ></textarea>
                </div>
              </section>

              {/* Resume Section */}
              <section className="glass-panel mt-20">
                <div className="section-header">
                  <FaCloudUploadAlt className="header-icon" />
                  <h3>Resume Source</h3>
                </div>
                <div className="resume-options">
                  <div className={`res-card ${useExistingResume ? 'selected' : ''}`} onClick={() => setUseExistingResume(true)}>
                    <FaFilePdf /> <span>Use Profile PDF</span>
                  </div>
                  <div className={`res-card ${!useExistingResume ? 'selected' : ''}`} onClick={() => setUseExistingResume(false)}>
                    <FaCloudUploadAlt /> <span>New Upload</span>
                  </div>
                </div>
                {!useExistingResume && (
                  <div className="file-dropzone mt-15 animate-fade">
                    <input type="file" accept=".pdf" onChange={handleFileChange} />
                    <p>{resumeFile ? resumeFile.name : "Select PDF (Max 5MB)"}</p>
                  </div>
                )}
              </section>

              <button 
                className="btn-primary-apply mt-30" 
                onClick={() => validateForm() && setShowConfirm(true)}
                disabled={submitting}
              >
                {submitting ? <FaSpinner className="spin" /> : "Review & Submit"}
              </button>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: INTELLIGENCE SIDEBAR */}
       <aside className="sidebar-column">
  <div className="sidebar-sticky">
    
    {/* 1. Opportunity Brief Card (NEW) */}
    <div className="glass-panel intel-card animate-fade-in">
      <div className="intel-header">
        <FaInfoCircle className="header-icon" />
        <h4>Opportunity Brief</h4>
      </div>
      
      <div className="intel-body">
        <div className="brief-item">
          <FaBuilding className="brief-icon" />
          <div>
            <p className="brief-label">Company</p>
            <p className="brief-value">{jobDetails?.companyName}</p>
          </div>
        </div>

        <div className="brief-item">
          <FaGlobe className="brief-icon" />
          <div>
            <p className="brief-label">Work Mode</p>
            <p className="brief-value">{jobDetails?.workMode || "Not Specified"}</p>
          </div>
        </div>

        <div className="brief-item">
          <FaBriefcase className="brief-icon" />
          <div>
            <p className="brief-label">Job Type</p>
            <p className="brief-value">{jobDetails?.jobType}</p>
          </div>
        </div>

        <div className="brief-description">
          <p className="brief-label">Snapshot</p>
          <p className="brief-text-truncated">
            {jobDetails?.description?.substring(0, 120)}...
          </p>
        </div>
      </div>
    </div>

    {/* 2. AI Match Score (Refined) */}
    <div className="glass-panel match-card mt-20">
      <div className="intel-header">
        <FaChartPie className="header-icon" />
        <h4>Match Intelligence</h4>
      </div>
      <div className="score-viz">
        <svg viewBox="0 0 36 36" className="circular-chart">
          <path className="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
          <path className="circle" strokeDasharray={`${matchScore}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
          <text x="18" y="20.35" className="percentage">{matchScore}%</text>
        </svg>
      </div>
      <p className="score-hint">Add recommended skills to improve your ranking.</p>
    </div>

    {/* 3. Recommended Skills (Interactive) */}
    <div className="glass-panel mt-20">
      <div className="intel-header">
        <FaShieldAlt className="header-icon" />
        <h4>Skill Gaps</h4>
      </div>
      <div className="tags-container">
        {missingSkills.length === 0 ? (
          <p className="empty-msg">Perfect Match! 🎉</p>
        ) : (
          missingSkills.map(skill => (
            <button key={skill} className="skill-tag" onClick={() => handleAddSkill(skill)}>
              + {skill}
            </button>
          ))
        )}
      </div>
    </div>
  </div>
</aside>
      </div>

      {/* CONFIRMATION MODAL */}
      {showConfirm && (
        <div className="modal-overlay">
          <div className="glass-modal animate-bounce-in">
            <h2>Final Confirmation</h2>
            <div className="review-list">
              <div className="review-item"><span>Role</span><strong>{jobDetails.title}</strong></div>
              <div className="review-item"><span>Name</span><strong>{useProfileData ? profile.name : name}</strong></div>
              <div className="review-item"><span>Availability</span><strong>{availability}</strong></div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowConfirm(false)}>Edit</button>
              <button className="btn-primary" onClick={handleFinalSubmit} disabled={submitting}>Send Application</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplyJob;