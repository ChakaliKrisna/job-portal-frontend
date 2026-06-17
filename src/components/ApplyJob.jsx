// FIX: Added useMemo explicitly to the core React hook imports
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  FaCheckCircle, FaCloudUploadAlt, FaFilePdf, FaBriefcase, FaMapMarkerAlt, 
  FaWallet, FaChartPie, FaShieldAlt, FaInfoCircle, FaBuilding, 
  FaTimes, FaUserCheck, FaEdit, FaArrowLeft, FaEnvelope, FaSpinner, 
  FaRocket, FaUsers, FaRegClock, FaGlobe, FaExclamationTriangle, FaHourglassHalf
} from "react-icons/fa";
import axios from "axios";
import "../../src/components/Appyjob.css";

const API_BASE = process.env.REACT_APP_API_URL || "https://job-portal-backend-365l.onrender.com";

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

  // --- New Dynamic Recommendation States ---
  const [similarJobs, setSimilarJobs] = useState([]);

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

  // --- Dynamic Auth Verification Interceptor ---
  useEffect(() => {
    if (!token) {
      // Set operational state flags in session/state before pushing backward 
      // to let the target landing layout know it should invoke the AuthDrawer automatically
      sessionStorage.setItem("triggerAuthDrawerMode", "login");
      sessionStorage.setItem("authRedirectNotification", "Please login as a Candidate to access job applications.");
      
      // Route user back cleanly to jobs board view without exposing broken data fields
      return navigate("/jobs", { replace: true });
    }
  }, [token, navigate]);

  // --- Initialization & LocalStorage Draft Reload ---
  useEffect(() => {
    // Structural Guard against unauthorized api invocation leaks
    if (!token) return;

    const fetchAllData = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const [profRes, missRes, jobRes, compRes, applyCheck] = await Promise.all([
          axios.get(`${API_BASE}/api/users/student/profile`, { headers }),
          axios.get(`${API_BASE}/job-portal/applications/job/${jobId}/missing-skills`, { headers }),
          axios.get(`${API_BASE}/job-portal/jobs/${jobId}`, { headers }),
          axios.get(`${API_BASE}/api/users/student/profile/completion`, { headers }),
          axios.get(`${API_BASE}/job-portal/applications/check/${jobId}`, { headers })
        ]);

        setProfile(profRes.data);
        setJobDetails(jobRes.data);
        setMissingSkills(missRes.data || []);
        setCompletion(compRes.data);
        setAlreadyApplied(applyCheck.data);
        
        // Load Item Draft configurations if present for this job scope
        const savedDraft = localStorage.getItem(`jobDraft_${jobId}`);
        if (savedDraft) {
          const parsedDraft = JSON.parse(savedDraft);
          setFormData(prev => ({
            ...prev,
            ...parsedDraft,
            name: parsedDraft.name || profRes.data?.name || "",
            email: parsedDraft.email || profRes.data?.email || ""
          }));
        } else {
          setFormData(prev => ({
            ...prev,
            name: profRes.data?.name || "",
            email: profRes.data?.email || "",
            useExistingResume: !!profRes.data?.resumeUrl
          }));
        }

        // Fetch Similar Jobs Recommendation Matrix
        try {
          const allJobsRes = await axios.get(`${API_BASE}/job-portal/jobs`, { headers });
          const jobsList = allJobsRes.data?.content || allJobsRes.data || [];
          const matchedSims = jobsList.filter(j => j.category === jobRes.data?.category && j.publicId !== jobId);
          setSimilarJobs(matchedSims);
        } catch (simErr) {
          console.warn("Could not synchronize similar opportunities pipeline:", simErr);
        }

      } catch (err) {
        setError("Failed to load application system metrics. Redirecting...");
        setTimeout(() => navigate("/jobs"), 3000);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAllData();
  }, [jobId, token, navigate]);

  // --- Match Score Sync Logic ---
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

  // --- Auto Save Draft Pipeline on Modification ---
  useEffect(() => {
    if (isDirty && !success) {
      localStorage.setItem(`jobDraft_${jobId}`, JSON.stringify(formData));
    }
  }, [formData, jobId, isDirty, success]);

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
    if (file.type !== "application/pdf") return alert("Only PDF formats are accepted.");
    if (file.size > 5 * 1024 * 1024) return alert("File sizes must be under 5MB.");
    setResumeFile(file);
    setIsDirty(true);
  };

  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.coverLetter.trim().length < 20) {
      setError("Cover statement statement is too short (Minimum 20 characters required).");
      return false;
    }
    if (formData.coverLetter.length > 1000) {
      setError("Cover letter exceeds the maximum allowable space threshold.");
      return false;
    }
    if (!formData.useExistingResume && !resumeFile) {
      setError("Please pick a valid local workspace PDF resume to upload.");
      return false;
    }
    if (!formData.useProfileData) {
      if (!formData.name.trim()) { setError("Custom identity profile name parameters required."); return false; }
      if (!emailRegex.test(formData.email)) { setError("Invalid Custom context verification email address."); return false; }
    }
    setError(null);
    return true;
  };

  const handleFinalSubmit = async () => {
    setSubmitting(true);
    try {
      let finalResumeUrl = profile?.resumeUrl;
      
      if (!formData.useExistingResume && resumeFile) {
        const uploadForm = new FormData();
        uploadForm.append("resume", resumeFile);
        const uploadRes = await axios.post(`${API_BASE}/api/users/student/upload`, uploadForm, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          }
        });
        finalResumeUrl = uploadRes.data.resumeUrl;
        if (!finalResumeUrl) throw new Error("Resume cloud synchronization failed.");
      }

      const payload = {
        resumeUrl: finalResumeUrl,
        coverLetter: formData.coverLetter.trim(),
        extraSkills: formData.extraSkills ? formData.extraSkills.split(",").map(s => s.trim()).filter(Boolean) : [],
        override: !formData.useProfileData,
        name: formData.useProfileData ? profile?.name : formData.name,
        email: formData.useProfileData ? profile?.email : formData.email,
        availability: formData.availability,
        workPreference: formData.workPreference
      };

      await axios.post(`${API_BASE}/job-portal/applications/${jobId}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      localStorage.removeItem(`jobDraft_${jobId}`);
      setSuccess(true);
      setIsDirty(false);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong during entry registration.");
    } finally {
      setSubmitting(false);
      setShowConfirm(false);
    }
  };

  // --- Formatting & Urgency Data Trackers ---
  const daysLeft = useMemo(() => {
    if (!jobDetails?.closedDate) return null;
    const diff = new Date(jobDetails.closedDate) - new Date();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }, [jobDetails?.closedDate]);

  const liveLetterLength = formData.coverLetter.length;

  // SAFE COMPILATION STRINGS FOR ENTERPRISE NAMES TO AVOID OBJECT CRASHES
  const resolvedCompanyName = jobDetails?.companyName || jobDetails?.company?.name || "Target Enterprise Hub";

  // Immediate layout shield while authentication verification intercepts
  if (!token) return null;

  if (loading) return (
    <div className="modern-loader-container">
      <FaSpinner className="spin-icon" />
      <p>Synchronizing Opportunity Data Engineering Space...</p>
    </div>
  );

  if (success) return (
    <div className="success-overlay">
      <div className="success-card">
        <div className="confetti-icon"><FaRocket /></div>
        <h1>Application Dispatched Successfully!</h1>
        <p>Your verified credentials profile matrix has been pushed onto <strong>{resolvedCompanyName}</strong>.</p>
        <div className="success-actions">
          <button className="btn-primary" onClick={() => navigate("/applications")}>Track Application Status</button>
          <button className="btn-secondary" onClick={() => navigate("/jobs")}>Explore Other Profiles</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="apply-page-wrapper">
      
      {/* SUB-HEADER Component */}
      <div className="portal-sub-header">
        <div className="sub-header-content">
          <div className="header-identity-block">
            <button className="back-btn" onClick={() => navigate(-1)}>
              <FaArrowLeft /> Back to Opening
            </button>
            <div>
              <h2>{jobDetails?.title}</h2>
              <span className="sub-tag-lbl">Verification Entry Gate</span>
            </div>
          </div>

          <div className="header-metrics-block">
            <div className="profile-strength">
              <label>Profile Health: {completion}%</label>
              <div className="progress-track-rail">
                <div className="progress-fill-bar" style={{ width: `${completion}%` }}></div>
              </div>
            </div>
            <div className="user-badge">
               <div className="avatar-initials">{profile?.name?.charAt(0).toUpperCase()}</div>
               <span className="profile-alias-name">{profile?.name}</span>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN TWO-COLUMN LAYOUT CONTENT */}
      <main className="apply-content-grid">
        
        {/* Left Column Forms */}
        <div className="apply-form-container">
          {error && (
            <div className="error-toast">
              <FaInfoCircle /> {error}
            </div>
          )}

          {alreadyApplied ? (
            <div className="already-applied-card">
              <FaCheckCircle className="check-done-icon" />
              <h2>Application Already On Record</h2>
              <p>Your portfolio package for this assignment index has been submitted. Check parameters in dashboard tracking lines.</p>
              <button className="btn-primary" onClick={() => navigate("/applications")}>Go to Tracking Dashboard</button>
            </div>
          ) : (
            <div className="form-sections-stack">
              
              <div className="smart-alert-panel">
                {completion < 50 && (
                  <div className="alert-strip warning-strip">
                    <FaExclamationTriangle /> <span>Your profile configuration is incomplete ({completion}%). Complete configuration fields to avoid employer screening drops.</span>
                  </div>
                )}
                {!formData.useExistingResume && !resumeFile && (
                  <div className="alert-strip generic-strip">
                    <FaInfoCircle /> <span>Shortlist Optimization Tip: Uploading a focused resume file improves vetting response metrics up to 3x.</span>
                  </div>
                )}
              </div>

              {/* Personal Info */}
              <section className="form-section">
                <div className="section-title-strip">
                  <FaUserCheck className="icon-blue" /> <h3>Candidate Meta Parameters</h3>
                </div>
                <div className="toggle-container">
                  <button className={`toggle-item ${formData.useProfileData ? 'active' : ''}`} onClick={() => setFormData(p => ({...p, useProfileData: true}))}>Deploy Core Profile Data</button>
                  <button className={`toggle-item ${!formData.useProfileData ? 'active' : ''}`} onClick={() => setFormData(p => ({...p, useProfileData: false}))}>Declare Override Alias</button>
                </div>
                {!formData.useProfileData && (
                  <div className="custom-input-matrix">
                    <input name="name" value={formData.name} onChange={handleInputChange} placeholder="Full Display Name" className="text-input" />
                    <input name="email" value={formData.email} onChange={handleInputChange} placeholder="Context Validation Email" className="text-input" />
                  </div>
                )}
              </section>

              {/* Resume Selector */}
              <section className="form-section">
                <div className="section-title-strip">
                  <FaCloudUploadAlt className="icon-green" /> <h3>Workspace Resume Package</h3>
                </div>

                <div className="resume-grid-choices">
                  <div 
                    onClick={() => profile?.resumeUrl && setFormData(p => ({...p, useExistingResume: true}))}
                    className={`resume-choice-box ${formData.useExistingResume ? 'selected' : ''} ${!profile?.resumeUrl ? 'disabled' : ''}`}
                  >
                    <FaFilePdf className="pdf-icon-frame" />
                    <div className="choice-lbl">Use Default Account Resume</div>
                    {!profile?.resumeUrl && <div className="choice-fallback-warning">No resume configuration file detected in account logs.</div>}
                  </div>

                  <div 
                    onClick={() => setFormData(p => ({...p, useExistingResume: false}))}
                    className={`resume-choice-box ${!formData.useExistingResume ? 'selected' : ''}`}
                  >
                    <FaCloudUploadAlt className="upload-icon-frame" />
                    <div className="choice-lbl">Upload Dynamic PDF Segment</div>
                  </div>
                </div>

                {!formData.useExistingResume && (
                  <div className="upload-zone-wrapper">
                    <input type="file" id="resume-upload-input" hidden onChange={handleFileChange} accept=".pdf" />
                    <label htmlFor="resume-upload-input" className="drag-upload-label">
                      <FaCloudUploadAlt className="cloud-icon" />
                      <span className="file-feedback-name">{resumeFile ? resumeFile.name : "Select or drag updated resume PDF files"}</span>
                      <span className="file-constraints-text">Maximum allowable limit: 5MB File size</span>
                    </label>
                  </div>
                )}
              </section>

              {/* Cover Letter */}
              <section className="form-section">
                <div className="section-title-strip">
                  <FaEdit className="icon-amber" /> <h3>Cover Statement Dossier</h3>
                </div>
                <textarea 
                  name="coverLetter" rows="6" value={formData.coverLetter} onChange={handleInputChange} 
                  placeholder="Elaborate clearly on projects, tech stacks, or engineering alignments matching this exact scope..." 
                  className="master-textarea"
                />
                <div className="live-metrics-footer-row">
                  <span className={`character-count-lbl ${liveLetterLength > 1000 ? 'count-overflow' : ''}`}>
                    Length: <strong>{liveLetterLength}</strong> / 1000 Chars
                  </span>
                  {liveLetterLength >= 20 && liveLetterLength <= 1000 ? (
                    <span className="metric-pill success-pill">Good Length ✔</span>
                  ) : (
                    <span className="metric-pill danger-pill">Requires 20-1000 Chars</span>
                  )}
                </div>
              </section>

              <button className="submit-master-btn" onClick={() => validateForm() && setShowConfirm(true)} disabled={submitting}>
                {submitting ? <FaSpinner className="spin-animation" /> : "Review Application Packaging Matrix"}
              </button>
            </div>
          )}
        </div>

        {/* Right Side Sidebar Info Panel */}
        <aside className="apply-sidebar">
          
          {/* Compatibility Analysis Widget */}
          <div className="intel-card match-analytics-card">
            <div className="intel-card-title"><FaChartPie className="color-purple" /> Compatibility Index Analysis</div>
            <div className="gauge-score-display">
              <div className="score-numerical-header">{Number(matchScore).toFixed(1)}%</div>
              <div className="visual-progress-gauge-track">
                <div className="visual-progress-gauge-fill" style={{ width: `${matchScore}%` }}></div>
              </div>
              <p className="gauge-sub-label">Profile Target Matrix Balance Match</p>
            </div>

            <div className="granular-skills-match-breakdown">
              <label className="breakdown-headline">Requirement Verification Matrix</label>
              <div className="checklist-stack-lines">
                {profile?.skills?.map(skill => (
                  <div key={skill} className="checklist-line item-verified">
                    <span className="check-symbol">✔</span> <span className="skill-text-lbl">{skill}</span>
                  </div>
                ))}
                {missingSkills?.map(skill => (
                  <div key={skill} className="checklist-line item-missing">
                    <span className="check-symbol">✖</span> <span className="skill-text-lbl">{skill} (Missing)</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Skill Booster Recommendation */}
          <div className="intel-card optimization-accelerator-card">
            <div className="intel-card-title"><FaShieldAlt className="color-emerald" /> Skill Booster Recommendation</div>
            
            {jobDetails?.experienceLevel && (!profile?.experience || profile.experience.trim() === "") && (
              <div className="experience-match-warning-banner">
                <FaExclamationTriangle />
                <p>This role expects an <strong>{jobDetails.experienceLevel.replaceAll("_", " ")}</strong> profile depth. Your dashboard file lists 0 entries. Verify profile completeness.</p>
              </div>
            )}

            <span className="accelerator-sub-lbl">Click missing tech targets to bind them into this session payload and boost compatibility score scores instantly:</span>
            <div className="accelerator-chips-pool">
              {missingSkills?.length > 0 ? (
                missingSkills.map(skill => (
                  <button key={skill} onClick={() => handleAddSkill(skill)} className="booster-add-pill-btn">
                    + {skill}
                  </button>
                ))
              ) : (
                <div className="perfection-alert-box">
                  <FaCheckCircle /> Profile criteria completely covers requirements!
                </div>
              )}
            </div>
          </div>

          {/* Enterprise Snapshot Dossier Card */}
          <div className="intel-card job-snapshot-summary-card">
            <div className="intel-card-title"><FaBuilding className="color-slate" /> Enterprise Snapshot Dossier</div>
            
            <div className="snapshot-corporate-header-container">
              <div className="corporate-avatar-box">
                {(jobDetails?.company?.logoUrl || jobDetails?.companyLogo) ? (
                  <img 
                    src={jobDetails?.company?.logoUrl || jobDetails?.companyLogo} 
                    alt={resolvedCompanyName} 
                    className="corporate-card-img" 
                  />
                ) : (
                  <FaBuilding className="fallback-corp-icon" />
                )}
              </div>
              <div className="corporate-meta-text-rail">
                <h4 
                  className="company-link-header"
                  onClick={() => {
                    const compId = jobDetails?.company?.publicId || jobDetails?.companyPublicId;
                    if (compId) navigate(`/companies/${compId}`);
                  }}
                >
                  {resolvedCompanyName}
                </h4>
                <p className="location-lbl">
                  <FaMapMarkerAlt /> {jobDetails?.company?.location || jobDetails?.location || "Global Field Operations"}
                </p>
              </div>
            </div>

            <div className="snapshot-corporate-actions-panel">
              <button 
                className="sidebar-view-profile-btn"
                onClick={() => {
                  const compId = jobDetails?.company?.publicId || jobDetails?.companyPublicId;
                  if (compId) navigate(`/companies/${compId}`);
                }}
              >
                View Company Profile
              </button>
              {(jobDetails?.company?.website || jobDetails?.companyWebsite) && (
                <a 
                  href={jobDetails?.company?.website || jobDetails?.companyWebsite} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="company-external-site-link-btn"
                >
                  Visit Website <FaGlobe size={11} />
                </a>
              )}
            </div>

            <div className="snapshot-metadata-chips-row">
              {jobDetails?.category && (
                <span className="snapshot-meta-badge category-badge-pill">
                  🏷 {jobDetails.category.replaceAll("_", " ")}
                </span>
              )}
              <span className="snapshot-meta-badge">💼 {jobDetails?.workMode}</span>
            </div>

            <div className="snapshot-data-grid">
              <div className="snapshot-data-cell bg-indigo-tint">
                <FaUsers />
                <div className="cell-text-wrap">
                  <span className="cell-value-num">{jobDetails?.applicationsCount || 0} Candidates</span>
                  <span className="cell-label-text">Applied for Role</span>
                </div>
              </div>

              {daysLeft !== null && (
                <div className="snapshot-data-cell bg-amber-tint">
                  <FaHourglassHalf />
                  <div className="cell-text-wrap">
                    <span className="cell-value-num">{daysLeft} Days Left</span>
                    <span className="cell-label-text">Registration Closes</span>
                  </div>
                </div>
              )}
            </div>

            {jobDetails?.recruiter && (
              <div className="snapshot-recruiter-footer-panel">
                <span className="panel-label">Hiring Partner Directory</span>
                <div className="recruiter-mini-strip">
                  <div className="recruiter-initial-circle">
                    {jobDetails.recruiter.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="recruiter-meta">
                    <span className="recruiter-name-text">{jobDetails.recruiter.name}</span>
                    <span className="recruiter-assignment-sub">Acquisition Manager &bull; Vetting Team</span>
                  </div>
                </div>
              </div>
            )}

            <div className="snapshot-financial-footer-strip">
              <FaWallet /> <span>Annual Package Compensation: <strong>₹{jobDetails?.salary ? Number(jobDetails.salary).toLocaleString('en-IN') : "Competitive Matrix Bounds"}</strong></span>
            </div>
          </div>

          {/* Similar Opportunities */}
          {similarJobs.length > 0 && (
            <div className="intel-card similar-recommendations-card">
              <div className="intel-card-title"><FaRocket className="color-indigo" /> Similar Opportunities</div>
              <div className="similar-stack-rail">
                {similarJobs.slice(0, 3).map((simJob) => {
                  const safeSimCompanyName = simJob?.companyName || simJob?.company?.name || "Verified Enterprise Provider";
                  return (
                    <div key={simJob.publicId} className="sidebar-mini-job-card" onClick={() => navigate(`/job/${simJob.publicId}`)}>
                      <div className="mini-card-top">
                        <h5>{simJob.title}</h5>
                        <span className="mini-mode-tag">{simJob.workMode}</span>
                      </div>
                      <p className="mini-company-name">{safeSimCompanyName}</p>
                      <p className="mini-location-meta">📍 {simJob.location}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </aside>
      </main>

      {/* CONFIRMATION MODAL */}
      {showConfirm && (
       <div className="modal-backdrop-layer">
          <div className="confirmation-modal-container">
            <button className="close-modal-top-btn" onClick={() => setShowConfirm(false)}><FaTimes /></button>
            <div className="modal-header-graphic-area">
              <div className="graphic-circle-icon"><FaRocket /></div>
              <h2>Ready to Route Application?</h2>
              <p>Review credentials layout parameters before submission verification block locking.</p>
            </div>

            <div className="modal-summary-fact-sheet">
              <div className="summary-fact-line">
                <span className="fact-lbl">Target Assignment Role:</span>
                <strong className="fact-val-highlight">{jobDetails?.title}</strong>
              </div>
              <div className="summary-fact-line">
                <span className="fact-lbl">Assigned Operator Identity:</span>
                <strong className="fact-val">{formData.useProfileData ? profile?.name : formData.name}</strong>
              </div>
              <div className="summary-fact-line">
                <span className="fact-lbl">Verification Routing Target:</span>
                <strong className="fact-val">{formData.useProfileData ? profile?.email : formData.email}</strong>
              </div>
              <div className="summary-fact-line">
                <span className="fact-lbl">Core Resume Cloud Reference:</span>
                <strong className="fact-val text-emerald-color">{formData.useExistingResume ? "Default Account Profile Object" : "Dynamic Local PDF Session Upload"}</strong>
              </div>
            </div>

            <div className="modal-interactive-action-row">
              <button className="modal-btn-dismiss" onClick={() => setShowConfirm(false)}>Return to Modification</button>
              <button className="modal-btn-confirm-route" onClick={handleFinalSubmit} disabled={submitting}>
                {submitting ? "Processing Queue Load..." : "Confirm & Commit application"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplyJob;