import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  FaCheckCircle, FaCloudUploadAlt, FaFilePdf, FaBriefcase, FaMapMarkerAlt, 
  FaWallet, FaChartPie, FaShieldAlt, FaInfoCircle, FaBuilding, 
  FaKeyboard, FaTimes, FaUserCheck, FaEdit, FaArrowLeft, FaClock, FaGlobe, FaSpinner, FaRocket
} from "react-icons/fa";
import axios from "axios";
import "../components/Styles/applyjob.css";
// const API_BASE = import.meta.env.VITE_APP_API_URL;

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8080";

const ApplyJob = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // --- Core Data States ---
  const [profile, setProfile] = useState(null);
  const [jobDetails, setJobDetails] = useState(null);
  const [missingSkills, setMissingSkills] = useState([]);
  const [completion, setCompletion] = useState(0);
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [matchScore, setMatchScore] = useState(0);

  // --- Form States ---
  const [formData, setFormData] = useState({
    extraSkills: "",
    coverLetter: "",
    availability: "Immediate",
    workPreference: "Remote",
    useProfileData: true,
    name: "",
    email: "",
    useExistingResume: true
  });
  
  const [resumeFile, setResumeFile] = useState(null);
  const [isDirty, setIsDirty] = useState(false);
  
  // --- UI Flow States ---
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Initialization ---
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
        setJobDetails(jobRes.data);
        setMissingSkills(missRes.data || []);
        setCompletion(compRes.data);
        setAlreadyApplied(applyCheck.data);
        
        // Populate initial form data from profile
        setFormData(prev => ({
          ...prev,
          name: profRes.data?.name || "",
          email: profRes.data?.email || "",
          useExistingResume: !!profRes.data?.resumeUrl
        }));

      } catch (err) {
        setError("Failed to load job details. Please try again later.");
        setTimeout(() => navigate("/jobs"), 3000);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, [jobId, token, navigate]);

  // --- Match Score Logic (Debounced) ---
  useEffect(() => {
    if (!token || loading || alreadyApplied) return;
    const controller = new AbortController();

    const fetchScore = async () => {
      try {
        const res = await axios.get(`${API_BASE}/job-portal/applications/jobs/${jobId}/match-score`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { extraSkills: formData.extraSkills || "" },
          signal: controller.signal
        });
        setMatchScore(res.data);
      } catch (err) { if (!axios.isCancel(err)) console.error(err); }
    };

    const timeoutId = setTimeout(fetchScore, 800);
    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [formData.extraSkills, jobId, token, loading, alreadyApplied]);

  // --- Handlers ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setIsDirty(true);
  };

  const handleAddSkill = (skill) => {
    const current = formData.extraSkills.split(",").map(s => s.trim()).filter(Boolean);
    if (!current.includes(skill)) {
      const newList = [...current, skill].join(", ");
      setFormData(prev => ({ ...prev, extraSkills: newList }));
      setIsDirty(true);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type !== "application/pdf") return alert("Only PDF files are accepted.");
    if (file.size > 5 * 1024 * 1024) return alert("File size must be under 5MB.");
    setResumeFile(file);
    setIsDirty(true);
  };

  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (formData.coverLetter.trim().length < 20) {
      setError("Cover letter is too short (min 20 chars).");
      return false;
    }
    if (formData.coverLetter.length > 1000) {
      setError("Cover letter exceeds 1000 characters.");
      return false;
    }
    if (!formData.useExistingResume && !resumeFile) {
      setError("Please upload a resume PDF.");
      return false;
    }
    if (!formData.useProfileData) {
      if (!formData.name.trim()) { setError("Name is required."); return false; }
      if (!emailRegex.test(formData.email)) { setError("Invalid email address."); return false; }
    }
    setError(null);
    return true;
  };
const handleFinalSubmit = async () => {
  console.log("HANDLE FINAL SUBMIT CALLED");

  setSubmitting(true);

  try {
      let finalResumeUrl = profile?.resumeUrl;
      
      // Handle New Resume Upload
     // Handle New Resume Upload
if (!formData.useExistingResume && resumeFile) {

  const uploadForm = new FormData();
  uploadForm.append("file", resumeFile);

  const uploadRes = await axios.post(
    `${API_BASE}/api/users/student/upload`,
    uploadForm,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data"
      }
    }
  );

  console.log("UPLOAD RESPONSE:", uploadRes.data);

  finalResumeUrl =
    uploadRes.data.resumeUrl ||
    uploadRes.data.url;

  if (!finalResumeUrl) {
    throw new Error("Resume upload failed");
  }
}

    const payload = {
  resumeUrl: finalResumeUrl,

  coverLetter: formData.coverLetter.trim(),

  extraSkills: formData.extraSkills
    ? formData.extraSkills
        .split(",")
        .map(s => s.trim())
        .filter(Boolean)
    : [],

  override: !formData.useProfileData,

  name: formData.useProfileData
    ? profile?.name
    : formData.name,

  email: formData.useProfileData
    ? profile?.email
    : formData.email,

  availability: formData.availability,

  workPreference: formData.workPreference
  
};
 await axios.post(`${API_BASE}/job-portal/applications/${jobId}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
     

      setSuccess(true);
      setIsDirty(false);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong during submission.");
    } finally {
      setSubmitting(false);
      setShowConfirm(false);
    }
  };

  const handleSafeBack = () => {
    if (isDirty && !success) {
      if (window.confirm("You have unsaved changes. Exit anyway?")) navigate("/jobs");
    } else {
      navigate("/jobs");
    }
  };

  // --- Sub-Components ---
  if (loading) return (
    <div className="modern-loader-container">
      <FaSpinner className="spin-icon" />
      <p>Synchronizing Opportunity Data...</p>
    </div>
  );

  if (success) return (
    <div className="success-overlay animate-fade-in">
      <div className="success-card">
        <div className="confetti-icon"><FaRocket /></div>
        <h1>Application Sent!</h1>
        <p>Your profile has been shared with <strong>{jobDetails?.companyName}</strong>.</p>
        <div className="success-actions">
          <button className="btn-primary" onClick={() => navigate("/applications")}>Track Application</button>
          <button className="btn-secondary" onClick={() => navigate("/jobs")}>Browse More</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="apply-page-wrapper">
      {/* Dynamic Header */}
      <nav className="glass-header">
        <div className="header-left">
          <button className="back-btn" onClick={handleSafeBack}>
            <FaArrowLeft /> <span>Return</span>
          </button>
          <div className="header-meta">
            <span className="meta-label">Position</span>
            <span className="meta-value">{jobDetails?.title}</span>
          </div>
        </div>

        <div className="header-center">
          <div className="profile-strength">
            <div className="strength-bar-container">
              <div className="strength-bar" style={{ width: `${completion}%` }}></div>
            </div>
            <span className="strength-text">Profile Strength: {completion}%</span>
          </div>
        </div>

        <div className="header-right">
          <div className="user-badge">
            <div className="avatar-circle">{profile?.name?.charAt(0)}</div>
            <div className="user-text">
              <span className="user-name">{profile?.name}</span>
              <span className="user-role">Verified Candidate</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="apply-content-grid">
        {/* Left Column: Input Sections */}
        <div className="apply-form-container">
          {error && <div className="error-toast animate-slide-down"><FaInfoCircle /> {error}</div>}

          {alreadyApplied ? (
            <div className="already-applied-card glass-panel">
              <FaCheckCircle className="applied-icon" />
              <h2>Application Received</h2>
              <p>You've already applied for this role. Check your status in the dashboard.</p>
              <button className="btn-primary" onClick={() => navigate("/applications")}>Go to Dashboard</button>
            </div>
          ) : (
            <div className="form-sections-stack">
              {/* Identity Section */}
              <section className="form-section glass-panel">
                <div className="section-title">
                  <FaUserCheck className="section-icon-blue" />
                  <h3>Personal Information</h3>
                </div>
                <div className="toggle-container">
                  <button 
                    className={`toggle-item ${formData.useProfileData ? 'active' : ''}`}
                    onClick={() => setFormData(p => ({...p, useProfileData: true}))}
                  >Use Profile</button>
                  <button 
                    className={`toggle-item ${!formData.useProfileData ? 'active' : ''}`}
                    onClick={() => setFormData(p => ({...p, useProfileData: false}))}
                  >Custom Alias</button>
                </div>
                
                {!formData.useProfileData && (
                  <div className="form-row animate-fade">
                    <div className="input-box">
                      <label>Legal Name</label>
                      <input name="name" value={formData.name} onChange={handleInputChange} placeholder="e.g. Alex Smith" />
                    </div>
                    <div className="input-box">
                      <label>Contact Email</label>
                      <input name="email" value={formData.email} onChange={handleInputChange} placeholder="alex@example.com" />
                    </div>
                  </div>
                )}
              </section>

              {/* Preferences Section */}
              <section className="form-section glass-panel">
                <div className="section-title">
                  <FaClock className="section-icon-purple" />
                  <h3>Work Preferences</h3>
                </div>
                <div className="form-row">
                  <div className="input-box">
                    <label>Joining Date</label>
                    <select name="availability" value={formData.availability} onChange={handleInputChange}>
                      <option>Immediate</option>
                      <option>15 Days</option>
                      <option>30 Days</option>
                      <option>90 Days</option>
                    </select>
                  </div>
                  <div className="input-box">
                    <label>Working Mode</label>
                    <select name="workPreference" value={formData.workPreference} onChange={handleInputChange}>
                      <option>Remote</option>
                      <option>Hybrid</option>
                      <option>On-Site</option>
                    </select>
                  </div>
                </div>
              </section>

              {/* Resume Logic */}
              <section className="form-section glass-panel">
                <div className="section-title">
                  <FaCloudUploadAlt className="section-icon-green" />
                  <h3>Resume Submission</h3>
                </div>
                <div className="resume-grid">
                  <div 
                    className={`resume-card ${formData.useExistingResume ? 'selected' : ''} ${!profile?.resumeUrl ? 'disabled' : ''}`}
                    onClick={() => profile?.resumeUrl && setFormData(p => ({...p, useExistingResume: true}))}
                  >
                    <FaFilePdf />
                    <span>Use Profile Resume</span>
                    {!profile?.resumeUrl && <small>(Not uploaded yet)</small>}
                  </div>
                  <div 
                    className={`resume-card ${!formData.useExistingResume ? 'selected' : ''}`}
                    onClick={() => setFormData(p => ({...p, useExistingResume: false}))}
                  >
                    <FaCloudUploadAlt />
                    <span>Upload New PDF</span>
                  </div>
                </div>

                {!formData.useExistingResume && (
                  <div className="upload-zone animate-fade">
                    <input type="file" id="resume-upload" hidden onChange={handleFileChange} accept=".pdf" />
                    <label htmlFor="resume-upload" className="dropzone-label">
                      {resumeFile ? resumeFile.name : "Click to select PDF (Max 5MB)"}
                    </label>
                  </div>
                )}
              </section>

              {/* Skills & Cover Letter */}
              <section className="form-section glass-panel">
                <div className="section-title">
                  <FaEdit className="section-icon-orange" />
                  <h3>Why You?</h3>
                </div>
                <div className="input-box">
                  <label>Highlight Additional Skills</label>
                  <input 
                    name="extraSkills" 
                    value={formData.extraSkills} 
                    onChange={handleInputChange} 
                    placeholder="Python, AWS, System Design..."
                  />
                </div>
                <div className="input-box mt-20">
                  <div className="label-with-count">
                    <label>Cover Letter</label>
                    <span className={formData.coverLetter.length > 1000 ? "text-danger" : ""}>
                      {formData.coverLetter.length}/1000
                    </span>
                  </div>
                  <textarea 
                    name="coverLetter"
                    rows="6"
                    value={formData.coverLetter}
                    onChange={handleInputChange}
                    placeholder="Briefly explain your suitability for this specific role..."
                  ></textarea>
                </div>
              </section>

              <button 
                className="submit-master-btn" 
                onClick={() => validateForm() && setShowConfirm(true)}
                disabled={submitting}
              >
                {submitting ? <FaSpinner className="spin" /> : "Review Application"}
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Intelligence Sidebar */}
        <aside className="apply-sidebar">
          <div className="sidebar-sticky-wrap">
            {/* AI Match Module */}
            <div className="intel-card glass-panel">
              <div className="intel-header">
                <FaChartPie />
                <h4>Compatibility Score</h4>
              </div>
              <div className="score-viz-container">
                <svg viewBox="0 0 36 36" className="circular-chart-big">
                  <path className="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path className="circle-progress" strokeDasharray={`${matchScore}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <text x="18" y="20.35" className="percentage">{matchScore}%</text>
                </svg>
              </div>
              <p className="intel-hint">This score is based on your current profile and the skills you've added.</p>
            </div>

            {/* Skill Gap Analysis */}
            <div className="intel-card glass-panel mt-20">
              <div className="intel-header">
                <FaShieldAlt />
                <h4>Skill Recommendations</h4>
              </div>
              <div className="missing-skills-cloud">
                {missingSkills.length > 0 ? (
                  missingSkills.map(skill => (
                    <button key={skill} className="skill-pill" onClick={() => handleAddSkill(skill)}>
                      + {skill}
                    </button>
                  ))
                ) : (
                  <div className="perfect-match-msg">
                    <FaCheckCircle /> <span>Profile matches all requirements!</span>
                  </div>
                )}
              </div>
            </div>

            {/* Job Summary */}
            <div className="intel-card glass-panel mt-20">
              <div className="intel-header">
                <FaBuilding />
                <h4>Job Snapshot</h4>
              </div>
              <div className="snapshot-list">
                <div className="snapshot-item"><strong>Company:</strong> {jobDetails?.companyName}</div>
                <div className="snapshot-item"><strong>Mode:</strong> {jobDetails?.workMode}</div>
                <div className="snapshot-item"><strong>Salary:</strong> {jobDetails?.salaryRange || "Competitive"}</div>
              </div>
            </div>
          </div>
        </aside>
      </main>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="modal-backdrop">
          <div className="confirmation-modal animate-bounce-in">
            <h2>Ready to Submit?</h2>
            <p>Please review your details one last time. You cannot edit this application once sent.</p>
            <div className="review-table">
              <div className="review-row"><span>Position:</span> <strong>{jobDetails?.title}</strong></div>
              <div className="review-row"><span>Identity:</span> <strong>{formData.useProfileData ? profile?.name : formData.name}</strong></div>
              <div className="review-row"><span>Resume:</span> <strong>{formData.useExistingResume ? "Existing Profile PDF" : resumeFile?.name}</strong></div>
            </div>
            <div className="modal-btns">
              <button className="btn-cancel" onClick={() => setShowConfirm(false)}>Wait, Edit</button>
             <button
  className="btn-confirm"
  onClick={() => {
    console.log("BUTTON CLICKED");
    handleFinalSubmit();
  }}
  disabled={submitting}
>
  {submitting ? "Sending..." : "Submit Application"}
</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplyJob;