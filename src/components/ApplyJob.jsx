import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  FaCheckCircle, FaCloudUploadAlt, FaExclamationTriangle, FaFilePdf, 
  FaBriefcase, FaMapMarkerAlt, FaWallet, FaChartPie, FaShieldAlt, 
  FaEye, FaInfoCircle, FaUserTie, FaBuilding, FaKeyboard, FaTimes, FaLock,FaUserCheck
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

  // --- Form States ---
  const [activeTab, setActiveTab] = useState("details");
  const [extraSkills, setExtraSkills] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  const [useExistingResume, setUseExistingResume] = useState(true);
  const [coverLetter, setCoverLetter] = useState("");
  
  // --- UI Logic States ---
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isDirty, setIsDirty] = useState(false); // For Navigation Guard

  // 11. Navigation Guard: Warn user if they try to close/refresh while filling form
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty && !success) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty, success]);

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
        setMissingSkills(missRes.data || []);
        setJobDetails(jobRes.data);
        setCompletion(compRes.data);
        setAlreadyApplied(applyCheck.data);
      } catch (err) {
        // 8. API Failure Handling
        alert("Failed to load job details. The job might no longer exist.");
        navigate("/jobs");
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, [jobId, token, navigate]);

  // Live Match Score Logic
  useEffect(() => {
    if (!token || loading || alreadyApplied) return;
    const fetchScore = async () => {
      try {
        const res = await axios.get(`${API_BASE}/job-portal/applications/jobs/${jobId}/match-score`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { extraSkills: extraSkills || "" }
        });
        setMatchScore(res.data);
      } catch (err) { console.error(err); }
    };
    const timeoutId = setTimeout(fetchScore, 600);
    return () => clearTimeout(timeoutId);
  }, [extraSkills, jobId, token, loading, alreadyApplied]);

  // 6. Prevent Duplicate Skill Add (Fixed logic)
  const handleAddSkill = (skill) => {
    setExtraSkills(prev => {
      const existing = prev ? prev.split(",").map(s => s.trim().toLowerCase()) : [];
      if (existing.includes(skill.toLowerCase())) return prev;
      setIsDirty(true);
      return prev ? `${prev}, ${skill}` : skill;
    });
  };

  // 5. File Validation (Security + UX)
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      return alert("Only PDF files are allowed.");
    }
    if (file.size > 5 * 1024 * 1024) {
      return alert("File size must be less than 5MB.");
    }
    setResumeFile(file);
    setIsDirty(true);
  };

  const validateApplication = () => {
    // 2. Job Status Check
    if (jobDetails?.status !== "OPEN") {
      alert("This position is no longer accepting applications.");
      return false;
    }
    // 3. Resume Requirement Check
    if (useExistingResume && !profile?.resumeUrl) {
      alert("You don't have a profile resume. Please upload a new one.");
      return false;
    }
    if (!useExistingResume && !resumeFile) {
      alert("Please select a resume file to upload.");
      return false;
    }
    // 4. Cover Letter Validation
    if (coverLetter.trim().length < 20) {
      alert("Please provide a more detailed cover letter (min 20 characters).");
      return false;
    }
    return true;
  };

  const handleFinalSubmit = async () => {
    setSubmitting(true);
    try {
      let finalResumeUrl = profile?.resumeUrl;
      
      // Upload new resume if selected
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
        extraSkills: extraSkills ? extraSkills.split(",").map(s => s.trim()) : [],
        coverLetter: coverLetter.trim()
      }, { headers: { Authorization: `Bearer ${token}` } });

      setSuccess(true);
      setIsDirty(false);
    } catch (err) {
      // 1. Meaningful Backend Feedback
      const errorMsg = err.response?.data?.message || "Application failed due to a network error.";
      alert(errorMsg);
    } finally {
      setSubmitting(false);
      setShowConfirm(false);
    }
  };

  // 12. Empty State Handling
  if (!loading && !jobDetails) return <div className="error-state">Job not found.</div>;
  if (loading) return <div className="modern-loader-container"><div className="loader-circle"></div></div>;

  const isJobClosed = jobDetails?.status !== "OPEN";

  return (
    <div className="apply-page-wrapper">
      <div className="job-hero-section glass-premium animate-fade-in">
        <div className="hero-main">
          <div className="company-branding">
            <div className="company-logo-large">{jobDetails?.companyName?.charAt(0)}</div>
            <div className="hero-text">
              <h1>{jobDetails?.title} {isJobClosed && <span className="closed-tag">Closed</span>}</h1>
              <p className="company-meta">
                <FaBuilding /> {jobDetails?.companyName} • <FaMapMarkerAlt /> {jobDetails?.location}
              </p>
            </div>
          </div>
          <div className="hero-actions">
            <span className="salary-badge"><FaWallet /> {jobDetails?.salary || "Not Disclosed"}</span>
            <span className="type-badge"><FaBriefcase /> {jobDetails?.jobType}</span>
          </div>
        </div>

        <div className="tab-navigation">
          <button className={activeTab === 'details' ? 'active' : ''} onClick={() => setActiveTab('details')}>Role Overview</button>
          <button className={activeTab === 'apply' ? 'active' : ''} onClick={() => setActiveTab('apply')}>Application</button>
        </div>
      </div>

      <div className="apply-main-grid">
        <main className="content-area">
          {activeTab === 'details' ? (
            <div className="description-card glass animate-slide-up">
              <section>
                <h3><FaInfoCircle /> Description</h3>
                <p className="rich-text">{jobDetails?.description}</p>
              </section>
              
              <section className="recruiter-box">
                <div className="recruiter-info">
                  <FaUserTie className="recruiter-icon" />
                  <div>
                    <p className="label">Posted By</p>
                    <p className="name">{jobDetails?.recruiter?.name || "Hiring Manager"}</p>
                    {/* 9. Recruiter Privacy Control */}
                    {alreadyApplied ? (
                        <p className="email-reveal animate-fade-in">{jobDetails?.recruiter?.email}</p>
                    ) : (
                        <p className="email-locked"><FaLock /> Email hidden until application</p>
                    )}
                  </div>
                </div>
                <button 
                    className="btn-secondary" 
                    disabled={isJobClosed || alreadyApplied} 
                    onClick={() => setActiveTab('apply')}
                >
                  {alreadyApplied ? "Already Applied" : "Proceed to Apply"}
                </button>
              </section>
            </div>
          ) : (
            <div className="apply-form-box glass-premium animate-slide-up">
              <form className="modern-form-ui" onSubmit={(e) => e.preventDefault()}>
                <div className="form-group">
                  <label><FaKeyboard /> Add Relevant Skills</label>
                  <input 
                    type="text" 
                    className="modern-input" 
                    placeholder="e.g., React, Java, SQL"
                    value={extraSkills}
                    onChange={(e) => { setExtraSkills(e.target.value); setIsDirty(true); }}
                  />
                  <small>Increase your Match Score by adding skills missing from your profile.</small>
                </div>

                <div className="form-group">
                  <label>Cover Letter (Minimum 20 characters)</label>
                  <textarea 
                    className="modern-textarea" 
                    placeholder="Why are you the best fit for this role?" 
                    rows="5"
                    value={coverLetter}
                    onChange={(e) => { setCoverLetter(e.target.value); setIsDirty(true); }}
                  />
                  <div className={`char-count ${coverLetter.length < 20 ? 'text-danger' : ''}`}>
                    {coverLetter.length} characters
                  </div>
                </div>

                <div className="resume-section">
                  <label>Resume</label>
                  <div className="resume-selector-grid">
                    <div className={`resume-card ${useExistingResume ? 'active' : ''}`} onClick={() => setUseExistingResume(true)}>
                      <FaFilePdf /> <span>Current Resume</span>
                    </div>
                    <div className={`resume-card ${!useExistingResume ? 'active' : ''}`} onClick={() => setUseExistingResume(false)}>
                      <FaCloudUploadAlt /> <span>New Upload</span>
                    </div>
                  </div>
                  
                  {!useExistingResume && (
                    <div className="upload-dropzone animate-fade-in">
                      <input type="file" accept=".pdf" onChange={handleFileChange} />
                      <p>{resumeFile ? resumeFile.name : "Click to upload PDF (Max 5MB)"}</p>
                    </div>
                  )}
                </div>

                {/* 7. Loading State for Submit Button */}
                <button 
                  type="button" 
                  className="btn-primary-apply" 
                  disabled={alreadyApplied || isJobClosed || submitting}
                  onClick={() => validateApplication() && setShowConfirm(true)}
                >
                  {submitting ? "Processing..." : isJobClosed ? "Job Closed" : alreadyApplied ? "Application Sent" : "Review & Submit"}
                </button>
              </form>
            </div>
          )}
        </main>

        <aside className="sidebar-area">
          <div className="intel-card glass match-intelligence">
            <header><FaChartPie /> AI Match Score</header>
            <div className="score-container">
              <div className="circular-progress" style={{background: `conic-gradient(#10b981 ${matchScore * 3.6}deg, #f1f5f9 0deg)`}}>
                <div className="inner-white"><span>{matchScore}%</span></div>
              </div>
            </div>
            <p className="intel-desc">Your profile matches <strong>{matchScore}%</strong> of the requirements.</p>
          </div>

          <div className="intel-card glass">
            <header><FaShieldAlt /> Recommended Skills</header>
            <div className="skills-tags">
              {missingSkills.map((s, i) => (
                <span key={i} className="skill-tag missing" onClick={() => handleAddSkill(s)}>+ {s}</span>
              ))}
            </div>
          </div>
        </aside>
      </div>
      {/* 1. PROFILE COMPLETION SECTION */}
  <div className={`intel-card glass completion-card ${completion < 100 ? 'border-warning' : 'border-success'}`}>
    <div className="completion-header">
      <span><FaUserCheck /> Profile Integrity</span>
      <span className="completion-percent">{completion}%</span>
    </div>
    <div className="progress-bar-container">
      <div 
        className="progress-bar-fill" 
        style={{ width: `${completion}%`, backgroundColor: completion < 70 ? '#f59e0b' : '#10b981' }}
      ></div>
    </div>
    {completion < 100 && (
      <p className="completion-hint">
        Complete your profile to unlock a higher <strong>Match Score</strong> accuracy.
        <button className="btn-text-small" onClick={() => navigate("/profile")}>Update Now</button>
      </p>
    )}
  </div>

  <div className="intel-card glass match-intelligence">
    <header><FaChartPie /> Application Strength</header>
    {/* ... (Existing circular progress code) */}
    
    {/* 2. SMART TIPS (NEW FEATURE) */}
    <div className="smart-tips-box">
      <p className="tip-title">Smart Tip:</p>
      <div className="tip-content">
        {matchScore < 50 ? (
          <p><FaInfoCircle /> Add more relevant keywords to your cover letter and skills to get noticed by the ATS.</p>
        ) : matchScore < 80 ? (
          <p><FaCheckCircle /> You have a strong match! Mentioning a specific project in your cover letter could seal the deal.</p>
        ) : (
          <p><FaShieldAlt /> Elite Match! Your profile is in the top tier for this role. Submit with confidence.</p>
        )}
      </div>
    </div>
  </div>

      {/* 10. Missing: Apply Confirmation Summary (UX Upgrade) */}
      {showConfirm && (
        <div className="modal-overlay animate-fade-in">
           <div className="confirmation-modal glass-premium animate-bounce-in">
             <div className="modal-header">
                <h3>Final Review</h3>
                <button className="close-btn" onClick={() => setShowConfirm(false)}><FaTimes /></button>
             </div>
             <div className="summary-content">
                <div className="summary-item"><strong>Job:</strong> {jobDetails?.title}</div>
                <div className="summary-item"><strong>Company:</strong> {jobDetails?.companyName}</div>
                <div className="summary-item"><strong>Resume:</strong> {useExistingResume ? "Profile Resume" : resumeFile?.name}</div>
                <div className="summary-item"><strong>Match Score:</strong> {matchScore}%</div>
                <div className="summary-item"><strong>Added Skills:</strong> {extraSkills || "None"}</div>
             </div>
             <div className="modal-footer">
                <button className="btn-text" onClick={() => setShowConfirm(false)}>Back to Edit</button>
                <button className="btn-confirm" onClick={handleFinalSubmit} disabled={submitting}>
                    {submitting ? "Sending..." : "Confirm & Apply"}
                </button>
             </div>
           </div>
        </div>
      )}

      {success && (
        <div className="full-screen-overlay animate-fade-in">
          <div className="success-anim-box">
             <FaCheckCircle className="check-icon animate-pop" />
             <h2>Application Successful!</h2>
             <p>You have successfully applied to {jobDetails?.companyName}.</p>
             <button className="btn-primary" onClick={() => navigate("/jobs")}>Explore More Jobs</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplyJob;