import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  FaCheckCircle, FaCloudUploadAlt, FaFilePdf, FaBriefcase, FaMapMarkerAlt, 
  FaWallet, FaChartPie, FaShieldAlt, FaInfoCircle, FaBuilding, 
  FaKeyboard, FaTimes, FaUserCheck, FaEdit, FaArrowLeft, FaClock, FaGlobe,FaPaperPlane,FaExclamationTriangle, FaSpinner, FaRocket
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

  uploadForm.append("resume", resumeFile);

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

  finalResumeUrl = uploadRes.data.resumeUrl;

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
        headers: { Authorization: `Bearer ${token}` },
          
      }
    );
     

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
  // if (loading) return (
   if (loading) return (
    <div className="modern-loader-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <FaSpinner className="spin-icon" style={{ fontSize: '2rem', color: '#4f46e5' }} />
      <p style={{ marginTop: '1rem', fontWeight: '500' }}>Synchronizing Opportunity Data...</p>
    </div>
  );

  // 2. SUCCESS STATE
  if (success) return (
    <div className="success-overlay animate-fade-in" style={{ position: 'fixed', inset: 0, background: '#fff', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="success-card" style={{ textAlign: 'center', padding: '40px' }}>
        <div className="confetti-icon" style={{ fontSize: '4rem', color: '#4f46e5', marginBottom: '20px' }}><FaRocket /></div>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Application Sent!</h1>
        <p>Your profile has been shared with <strong>{jobDetails?.companyName}</strong>.</p>
        <div className="success-actions" style={{ marginTop: '30px', display: 'flex', gap: '15px', justifyContent: 'center' }}>
          <button className="btn-primary" onClick={() => navigate("/applications")}>Track Application</button>
          <button className="btn-secondary" onClick={() => navigate("/jobs")}>Browse More</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="apply-page-wrapper" style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      
      {/* 3. SUB-HEADER (Safe below your global nav) */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '15px 0', marginBottom: '30px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <button 
              className="back-btn" 
              onClick={() => navigate("/jobs")}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '8px', border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer', fontWeight: '600' }}
            >
              <FaArrowLeft /> BACK TO JOBS
            </button>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#111827' }}>{jobDetails?.title}</h2>
              <span style={{ fontSize: '12px', color: '#6b7280' }}>Application Portal</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div className="profile-strength" style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#4f46e5', marginBottom: '4px' }}>PROFILE STRENGTH: {completion}%</div>
              <div style={{ width: '120px', height: '6px', background: '#e5e7eb', borderRadius: '10px' }}>
                <div style={{ width: `${completion}%`, height: '100%', background: '#4f46e5', borderRadius: '10px' }}></div>
              </div>
            </div>
            <div className="user-badge" style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingLeft: '20px', borderLeft: '1px solid #e5e7eb' }}>
               <div style={{ width: '35px', height: '35px', borderRadius: '50%', background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#4f46e5' }}>
                {profile?.name?.charAt(0)}
               </div>
               <span style={{ fontWeight: '600' }}>{profile?.name}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. MAIN CONTENT GRID */}
      <main className="apply-content-grid" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px 50px', display: 'grid', gridTemplateColumns: '1fr 380px', gap: '30px' }}>
        
        {/* Left Side: Forms */}
        <div className="apply-form-container">
          {error && <div className="error-toast" style={{ background: '#fef2f2', color: '#b91c1c', padding: '12px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #fecaca', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FaInfoCircle /> {error}
          </div>}

          {alreadyApplied ? (
            <div className="already-applied-card glass-panel" style={{ background: '#fff', padding: '40px', borderRadius: '12px', textAlign: 'center', border: '1px solid #e5e7eb' }}>
              <FaCheckCircle style={{ fontSize: '3rem', color: '#10b981', marginBottom: '15px' }} />
              <h2>Application Received</h2>
              <p>You've already applied for this role. Check your status in the dashboard.</p>
              <button className="btn-primary" style={{ marginTop: '20px' }} onClick={() => navigate("/applications")}>Go to Dashboard</button>
            </div>
          ) : (
            <div className="form-sections-stack" style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
              
              {/* Personal Info */}
              <section className="form-section glass-panel" style={{ background: '#fff', padding: '25px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                  <FaUserCheck style={{ color: '#4f46e5' }} /> <h3 style={{ margin: 0 }}>Personal Information</h3>
                </div>
                <div className="toggle-container" style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                  <button className={`toggle-item ${formData.useProfileData ? 'active' : ''}`} onClick={() => setFormData(p => ({...p, useProfileData: true}))}>Use Profile</button>
                  <button className={`toggle-item ${!formData.useProfileData ? 'active' : ''}`} onClick={() => setFormData(p => ({...p, useProfileData: false}))}>Custom Alias</button>
                </div>
                {!formData.useProfileData && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <input name="name" value={formData.name} onChange={handleInputChange} placeholder="Full Name" style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }} />
                    <input name="email" value={formData.email} onChange={handleInputChange} placeholder="Email" style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }} />
                  </div>
                )}
              </section>

              <section className="form-section glass-panel" style={{ background: '#fff', padding: '25px', borderRadius: '16px', border: '1px solid #e5e7eb', marginBottom: '25px' }}>
  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
    <FaCloudUploadAlt style={{ color: '#10b981', fontSize: '1.2rem' }} /> 
    <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#1f2937' }}>Resume Submission</h3>
  </div>

  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
    {/* Option 1: Use Existing */}
    <div 
      onClick={() => profile?.resumeUrl && setFormData(p => ({...p, useExistingResume: true}))}
      style={{ 
        padding: '20px', 
        border: formData.useExistingResume ? '2px solid #4f46e5' : '1px solid #e5e7eb', 
        background: formData.useExistingResume ? '#f5f3ff' : '#fff',
        borderRadius: '12px', 
        cursor: profile?.resumeUrl ? 'pointer' : 'not-allowed', 
        textAlign: 'center',
        opacity: profile?.resumeUrl ? 1 : 0.6,
        transition: 'all 0.2s'
      }}
    >
      <FaFilePdf style={{ fontSize: '1.5rem', color: '#ef4444', marginBottom: '8px' }} />
      <div style={{ fontWeight: '600', fontSize: '14px' }}>Use Profile Resume</div>
      {!profile?.resumeUrl && <div style={{ fontSize: '11px', color: '#9ca3af' }}>No resume found in profile</div>}
    </div>

    {/* Option 2: Upload New */}
    <div 
      onClick={() => setFormData(p => ({...p, useExistingResume: false}))}
      style={{ 
        padding: '20px', 
        border: !formData.useExistingResume ? '2px solid #4f46e5' : '1px solid #e5e7eb', 
        background: !formData.useExistingResume ? '#f5f3ff' : '#fff',
        borderRadius: '12px', 
        cursor: 'pointer', 
        textAlign: 'center',
        transition: 'all 0.2s'
      }}
    >
      <FaCloudUploadAlt style={{ fontSize: '1.5rem', color: '#10b981', marginBottom: '8px' }} />
      <div style={{ fontWeight: '600', fontSize: '14px' }}>Upload New PDF</div>
    </div>
  </div>

  {/* THE ACTUAL FILE INPUT (Restored) */}
  {!formData.useExistingResume && (
    <div className="upload-zone animate-fade" style={{ marginTop: '10px' }}>
      <input 
        type="file" 
        id="resume-upload-input" 
        hidden 
        onChange={handleFileChange} // Ensures your file logic triggers
        accept=".pdf" 
      />
      <label 
        htmlFor="resume-upload-input" 
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '30px',
          border: '2px dashed #cbd5e1',
          borderRadius: '12px',
          background: '#f8fafc',
          cursor: 'pointer',
          transition: 'border-color 0.2s'
        }}
        onMouseOver={(e) => e.currentTarget.style.borderColor = '#4f46e5'}
        onMouseOut={(e) => e.currentTarget.style.borderColor = '#cbd5e1'}
      >
        <FaCloudUploadAlt style={{ fontSize: '2rem', color: '#94a3b8', marginBottom: '10px' }} />
        <span style={{ fontWeight: '500', color: '#475569' }}>
          {resumeFile ? resumeFile.name : "Click to select or drag PDF"}
        </span>
        <span style={{ fontSize: '11px', color: '#94a3b8', marginTop: '5px' }}>Max file size: 5MB</span>
      </label>
    </div>
  )}
</section>
              {/* Cover Letter Section */}
              <section className="form-section glass-panel" style={{ background: '#fff', padding: '25px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                  <FaEdit style={{ color: '#f59e0b' }} /> <h3 style={{ margin: 0 }}>Why You?</h3>
                </div>
                <textarea 
                  name="coverLetter" rows="6" value={formData.coverLetter} onChange={handleInputChange} 
                  placeholder="Explain your suitability..." 
                  style={{ width: '100%', padding: '15px', borderRadius: '8px', border: '1px solid #ddd', resize: 'none' }}
                />
              </section>

              <button className="submit-master-btn" onClick={() => validateForm() && setShowConfirm(true)} disabled={submitting} style={{ padding: '18px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' }}>
                {submitting ? <FaSpinner className="spin" /> : "Review Application"}
              </button>
            </div>
          )}
        </div>

        {/* Right Side: Sidebar */}
       <aside className="apply-sidebar" style={{ width: '380px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
  
  {/* Score Section */}
  <div className="intel-card glass-panel" style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #e5e7eb' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px', fontWeight: '700' }}>
      <FaChartPie style={{ color: '#4f46e5' }} /> Compatibility Analysis
    </div>
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '2.8rem', fontWeight: '800', color: '#4f46e5' }}>
        {Number(matchScore).toFixed(2)}%
      </div>
      <p style={{ fontSize: '13px', color: '#6b7280' }}>Requirements Match</p>
    </div>
  </div>

  {/* Skills Section */}
  <div className="intel-card glass-panel" style={{ background: '#fff', padding: '20px', borderRadius: '16px', border: '1px solid #e5e7eb', marginBottom: '20px' }}>
  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px', fontWeight: '700', color: '#374151' }}>
    <FaShieldAlt style={{ color: '#10b981' }} /> Skills for this Role
  </div>

  {/* SECTION A: SKILLS ALREADY IN YOUR PROFILE */}
  <div style={{ marginBottom: '15px' }}>
    <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '800', display: 'block', marginBottom: '8px' }}>FROM YOUR PROFILE</span>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
      {profile?.skills?.map((skill, index) => (
        <span 
          key={index} 
          style={{ padding: '4px 10px', background: '#eff6ff', color: '#2563eb', borderRadius: '6px', fontSize: '12px', fontWeight: '600', border: '1px solid #dbeafe' }}
        >
          {skill}
        </span>
      ))}
    </div>
  </div>

  {/* SECTION B: DYNAMICALLY ADDED SKILLS (Visible when you click recommendations) */}
  {formData.extraSkills && (
    <div style={{ marginBottom: '15px' }}>
      <span style={{ fontSize: '11px', color: '#4f46e5', fontWeight: '800', display: 'block', marginBottom: '8px' }}>ADDED FOR THIS APP</span>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
        {formData.extraSkills.split(',').filter(s => s.trim() !== "").map((skill, index) => (
          <span 
            key={index} 
            style={{ padding: '4px 10px', background: '#f5f3ff', color: '#7c3aed', borderRadius: '6px', fontSize: '12px', fontWeight: '600', border: '1px solid #ddd6fe' }}
          >
            {skill.trim()}
          </span>
        ))}
      </div>
    </div>
  )}

  <hr style={{ border: '0', borderTop: '1px solid #f1f5f9', margin: '15px 0' }} />

  {/* SECTION C: RECOMMENDATIONS (The buttons you click) */}
  <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '800', display: 'block', marginBottom: '8px' }}>RECOMMENDED TO BOOST SCORE</span>
  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
    {missingSkills?.length > 0 ? (
      missingSkills.map(skill => (
        <button 
          key={skill} 
          onClick={() => handleAddSkill(skill)}
          style={{
            padding: '6px 12px',
            background: '#fff',
            color: '#16a34a',
            border: '1px solid #16a34a',
            borderRadius: '100px',
            fontSize: '11px',
            cursor: 'pointer',
            fontWeight: '600',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => {e.target.style.background = '#f0fdf4'}}
          onMouseOut={(e) => {e.target.style.background = '#fff'}}
        >
          + {skill}
        </button>
      ))
    ) : (
      <div style={{ color: '#10b981', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px' }}>
        <FaCheckCircle /> All requirements met!
      </div>
    )}
  </div>
</div>

  {/* Job Snapshot Section */}
 <div className="intel-card glass-panel" style={{ background: '#fff', padding: '20px', borderRadius: '16px', border: '1px solid #e5e7eb' }}>
  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', fontWeight: '700' }}>
    <FaBuilding style={{ color: '#64748b' }} /> Full Job Snapshot
  </div>
  
  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
    
    {/* Organization & Location (Mapped to 'company' and 'location') */}
    <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
      <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '800', textTransform: 'uppercase' }}>Organization</span>
      <div style={{ fontSize: '15px', fontWeight: '700', color: '#1e293b', marginTop: '2px' }}>
        {jobDetails?.company} {/* Matches your JSON 'company' */}
      </div>
      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
        📍 {jobDetails?.location} {/* Matches your JSON 'location' */}
      </div>
    </div>

    {/* Work Mode & Experience Level */}
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
      <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '12px' }}>
        <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '800' }}>MODE</span>
        <div style={{ fontSize: '13px', fontWeight: '600', textTransform: 'capitalize' }}>
          {jobDetails?.workMode?.toLowerCase()} {/* Matches 'ONSITE' */}
        </div>
      </div>
      <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '12px' }}>
        <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '800' }}>LEVEL</span>
        <div style={{ fontSize: '13px', fontWeight: '600', textTransform: 'capitalize' }}>
          {jobDetails?.experienceLevel?.toLowerCase()} {/* Matches 'FRESHER' */}
        </div>
      </div>
    </div>

    {/* Salary Section (Formatted to Currency) */}
    <div style={{ background: '#eff6ff', padding: '14px', borderRadius: '12px', border: '1px solid #dbeafe' }}>
      <span style={{ fontSize: '10px', color: '#2563eb', fontWeight: '800' }}>ANNUAL CTC</span>
      <div style={{ fontSize: '18px', fontWeight: '800', color: '#1e40af', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <FaWallet size={14}/> 
        {jobDetails?.salary ? `₹${Number(jobDetails.salary).toLocaleString('en-IN')}` : "Competitive"}
      </div>
    </div>

    {/* Metadata Footer */}
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 5px 0', fontSize: '11px', color: '#94a3b8' }}>
      <span>Type: {jobDetails?.jobType?.replace('_', ' ')}</span>
      <span>Ref: {jobDetails?.publicId}</span>
    </div>

  </div>
</div>
</aside>
      </main>

      {/* 5. CONFIRMATION MODAL */}
      {showConfirm && (
        <div className="modal-backdrop" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 11000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="confirmation-modal" style={{ background: '#fff', padding: '30px', borderRadius: '16px', maxWidth: '500px', width: '90%', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <h2 style={{ marginBottom: '10px' }}>Submit Application?</h2>
            <p style={{ color: '#6b7280', marginBottom: '20px' }}>Double check your details. Once submitted, you cannot edit this application.</p>
            <div style={{ background: '#f9fafb', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}><span>Role:</span> <strong>{jobDetails?.title}</strong></div>
               <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Name:</span> <strong>{formData.useProfileData ? profile?.name : formData.name}</strong></div>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #ddd', cursor: 'pointer' }} onClick={() => setShowConfirm(false)}>Edit</button>
              <button style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', background: '#4f46e5', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }} onClick={handleFinalSubmit}>
                {submitting ? "Sending..." : "Confirm & Send"}
              </button>
            </div>
          </div>
        </div>
      )}{showConfirm && (
  <div className="modal-backdrop" style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(4px)', zIndex: 11000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <div className="confirmation-modal" style={{ background: '#fff', padding: '32px', borderRadius: '20px', maxWidth: '550px', width: '90%', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #e2e8f0' }}>
      
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div style={{ background: '#eef2ff', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px' }}>
          <FaPaperPlane style={{ color: '#4f46e5', fontSize: '1.5rem' }} />
        </div>
        <h2 style={{ margin: 0, color: '#1e293b', fontSize: '1.5rem', fontWeight: '800' }}>Ready to Apply?</h2>
        <p style={{ color: '#64748b', fontSize: '14px', marginTop: '8px' }}>Please review your application details below.</p>
      </div>

      {/* DETAILED SUMMARY CARD */}
      <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '14px', border: '1px solid #f1f5f9', marginBottom: '24px' }}>
        <div style={{ display: 'grid', gap: '12px', fontSize: '14px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
            <span style={{ color: '#64748b' }}>Applying for:</span>
            <strong style={{ color: '#1e293b' }}>{jobDetails?.title}</strong>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
            <span style={{ color: '#64748b' }}>Applicant:</span>
            <strong style={{ color: '#1e293b' }}>{formData.useProfileData ? profile?.name : formData.name}</strong>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
            <span style={{ color: '#64748b' }}>Resume:</span>
            <span style={{ fontWeight: '600', color: '#10b981', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <FaFilePdf size={12}/> {formData.useExistingResume ? "Profile Resume" : (resumeFile?.name || "Uploaded File")}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#64748b' }}>Match Score:</span>
            <strong style={{ color: '#4f46e5' }}>{Number(matchScore).toFixed(2)}%</strong>
          </div>

        </div>
      </div>

      <div style={{ background: '#fff9f2', border: '1px solid #fee2e2', padding: '12px', borderRadius: '8px', marginBottom: '24px', display: 'flex', gap: '10px' }}>
         <FaExclamationTriangle style={{ color: '#f97316', flexShrink: 0, marginTop: '2px' }} />
         <p style={{ margin: 0, fontSize: '12px', color: '#9a3412', lineHeight: '1.5' }}>
           Once submitted, you cannot change your resume or contact info for this specific role.
         </p>
      </div>

      <div style={{ display: 'flex', gap: '12px' }}>
        <button 
          style={{ flex: 1, padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }} 
          onClick={() => setShowConfirm(false)}
        >
          Go Back
        </button>
        <button 
          style={{ 
            flex: 2, 
            padding: '14px', 
            borderRadius: '12px', 
            border: 'none', 
            background: '#4f46e5', 
            color: '#fff', 
            fontWeight: '700', 
            cursor: submitting ? 'not-allowed' : 'pointer',
            boxShadow: '0 4px 14px 0 rgba(79, 70, 229, 0.39)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }} 
          onClick={handleFinalSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <> <div className="spinner" /> Sending... </>
          ) : (
            "Submit Application"
          )}
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default ApplyJob;