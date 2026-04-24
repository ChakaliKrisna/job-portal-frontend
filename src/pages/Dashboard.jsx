import React, { useEffect, useState } from "react";
import axios from "axios";
import { 
  FaUserEdit, FaFileAlt, FaGithub, FaGraduationCap, FaTools, 
  FaProjectDiagram, FaTimes, FaLink, FaCloudUploadAlt, FaDownload, 
  FaLightbulb, FaRocket, FaPlus, FaTrash, FaExternalLinkAlt, 
  FaMapMarkerAlt, FaPhoneAlt, FaLinkedin, FaBriefcase, FaTrophy 
} from "react-icons/fa";
import "../components/Styles/dashboard.css";

const API_BASE = "http://localhost:8080";

const UserDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [strength, setStrength] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState("basic");
  const token = localStorage.getItem("token");

  // 1. Unified State for All Professional Fields
  const [formData, setFormData] = useState({
    skills: [],
    education: "",
    projects: [],
    githubUrl: "",
    phoneNumber: "",
    location: "",
    headline: "",
    experience: "",
    achievements: "",
    linkedinUrl: ""
  });

  const [files, setFiles] = useState({ profileImage: null, resume: null });

  const fetchProfileData = async () => {
    try {
      const [profRes, strengthRes] = await Promise.all([
        axios.get(`${API_BASE}/api/users/student/profile`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_BASE}/api/users/student/profile/completion`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      const data = profRes.data;
      setProfile(data);
      setStrength(strengthRes.data);

      if (data) {
        setFormData({
          skills: data.skills || [],
          education: data.education || "",
          projects: data.projects || [],
          githubUrl: data.githubUrl || "",
          phoneNumber: data.phoneNumber || "",
          location: data.location || "",
          headline: data.headline || "",
          experience: data.experience || "",
          achievements: data.achievements || "",
          linkedinUrl: data.linkedinUrl || ""
        });
      }
    } catch (err) {
      console.error("Profile data fetch failed");
    }
  };

  useEffect(() => { fetchProfileData(); }, []);

  const handleProjectChange = (index, field, value) => {
    const updatedProjects = [...formData.projects];
    updatedProjects[index][field] = value;
    setFormData({ ...formData, projects: updatedProjects });
  };

  const addProject = () => {
    setFormData({
      ...formData,
      projects: [...formData.projects, { title: "", description: "", techStack: "", githubLink: "" }]
    });
  };

  const removeProject = (index) => {
    setFormData({ ...formData, projects: formData.projects.filter((_, i) => i !== index) });
  };

  const handleDownloadResume = () => {
  if (!profile?.resumeUrl) return;
  
  // Construct the full URL to your Spring Boot backend
  const fileUrl = `${API_BASE}${profile.resumeUrl}`;
  
  // Opens the PDF in a new tab instead of a forced background download
  window.open(fileUrl, "_blank", "noreferrer");
};

const handleOpenProject = (url) => {
  if (!url) return;
  // Standardizing the URL (adding https if missing)
  const validUrl = url.startsWith('http') ? url : `https://${url}`;
  window.open(validUrl, "_blank", "noreferrer");
};
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      // Clean skills array
      const cleanedData = {
        ...formData,
        skills: typeof formData.skills === 'string' 
          ? formData.skills.split(",").map(s => s.trim()) 
          : formData.skills
      };

      await axios.put(`${API_BASE}/api/users/student/profile`, cleanedData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (files.profileImage || files.resume) {
        const data = new FormData();
        if (files.profileImage) data.append("profileImage", files.profileImage);
        if (files.resume) data.append("resume", files.resume);

        await axios.post(`${API_BASE}/api/users/student/upload`, data, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" }
        });
      }

      alert("Portfolio Synchronized! 🚀");
      setIsModalOpen(false);
      fetchProfileData();
    } catch (err) {
      alert("Error updating profile.");
    }
  };


    return (
  <div className="dashboard-page">
    <div className="dashboard-container">
      
      {/* --- HERO SECTION --- */}
      <header className="glass-card hero-header animate-fade-in">
        <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'center' }}>
          <div className="avatar-canvas">
            {profile?.profileImageUrl ? (
              <img src={`${API_BASE}${profile.profileImageUrl}`} alt="Profile" className="avatar-img" />
            ) : (
              <div className="avatar-placeholder" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: '800', color: '#10b981' }}>
                {localStorage.getItem("userName")?.charAt(0)}
              </div>
            )}
          </div>
          
          <div className="hero-details">
            <h1 style={{ fontSize: '2.8rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.02em' }}>
              {localStorage.getItem("userName")}
            </h1>
            <p style={{ color: '#6366f1', fontWeight: '600', fontSize: '1.2rem', marginTop: '4px' }}>
              {profile?.headline || "Java Full-Stack Developer"}
            </p>
            <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1.2rem', color: '#64748b' }}>
              {profile?.location && <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><FaMapMarkerAlt color="#10b981"/> {profile.location}</span>}
              {profile?.phoneNumber && <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><FaPhoneAlt color="#10b981"/> {profile.phoneNumber}</span>}
            </div>
          </div>
        </div>
        
        <button className="btn-primary-gradient" onClick={() => setIsModalOpen(true)}>
          <FaUserEdit style={{ marginRight: '8px' }} /> Edit Profile
        </button>
      </header>

      <div className="bento-grid">
        
        {/* --- LEFT SIDEBAR --- */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="glass-card" style={{ padding: '2.5rem', textAlign: 'center' }}>
            <h4 style={{ color: '#64748b', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.5rem' }}>Portfolio Status</h4>
            <div style={{ position: 'relative', width: '130px', margin: '0 auto' }}>
              <svg viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="18" cy="18" r="16" fill="none" stroke="#f1f5f9" strokeWidth="3.5" />
                <circle cx="18" cy="18" r="16" fill="none" stroke="url(#grad1)" strokeWidth="3.5" strokeDasharray={`${strength}, 100`} strokeLinecap="round" />
                <defs>
                  <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#6366f1" />
                  </linearGradient>
                </defs>
              </svg>
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%) rotate(90deg)', fontSize: '1.4rem', fontWeight: '800', color: '#0f172a' }}>
                {strength}%
              </div>
            </div>
            <p style={{ marginTop: '1.5rem', fontSize: '0.85rem', color: '#94a3b8' }}>Keep updating to reach 100%!</p>
          </div>

          <div className="glass-card" style={{ padding: '2rem' }}>
            <h4 style={{ marginBottom: '1.2rem', fontWeight: '700' }}>Social Profiles</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {profile?.linkedinUrl && <a href={profile.linkedinUrl} className="social-pill-light"><FaLinkedin color="#0077b5"/> LinkedIn</a>}
              {profile?.githubUrl && <a href={profile.githubUrl} className="social-pill-light"><FaGithub color="#1e293b"/> GitHub Repo</a>}
              {profile?.resumeUrl && <button onClick={handleDownloadResume} className="social-pill-light" style={{ background: '#f0fdf4', color: '#10b981', border: '1px solid #dcfce7' }}>
                <FaDownload /> Download Resume
              </button>}
            </div>
          </div>
        </aside>

        {/* --- MAIN CONTENT AREA --- */}
        <main className="main-content-grid">
          <section className="glass-card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#10b981', fontWeight: '700', marginBottom: '1rem', fontSize: '1.1rem' }}>
              <div style={{ padding: '8px', background: '#ecfdf5', borderRadius: '10px' }}><FaBriefcase /></div>
              Experience
            </div>
            <p style={{ lineHeight: '1.7', color: '#475569' }}>{profile?.experience || "No professional journey added yet..."}</p>
          </section>

          <section className="glass-card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#f59e0b', fontWeight: '700', marginBottom: '1rem', fontSize: '1.1rem' }}>
              <div style={{ padding: '8px', background: '#fffbeb', borderRadius: '10px' }}><FaTrophy /></div>
              Achievements
            </div>
            <p style={{ lineHeight: '1.7', color: '#475569' }}>{profile?.achievements || "Honors and awards will appear here."}</p>
          </section>

          <section className="glass-card span-full" style={{ padding: '2.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#6366f1', fontWeight: '700', marginBottom: '1.5rem', fontSize: '1.1rem' }}>
              <div style={{ padding: '8px', background: '#eef2ff', borderRadius: '10px' }}><FaTools /></div>
              Technical Expertise
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
              {profile?.skills?.map((s, i) => (
                <span key={i} className="tech-pill">{s}</span>
              ))}
            </div>
          </section>

          {/* PROJECT GRID */}
          <section className="span-full">
            <h3 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '1.5rem', color: '#0f172a' }}>Selected Projects</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2rem' }}>
              {profile?.projects?.map((proj, i) => (
                <div key={i} className="glass-card" style={{ padding: '2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <h4 style={{ fontSize: '1.2rem', fontWeight: '700' }}>{proj.title}</h4>
                    <button onClick={() => handleOpenProject(proj.githubLink)} style={{ color: '#6366f1', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem' }}>
                      <FaExternalLinkAlt />
                    </button>
                  </div>
                  <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '1.5rem', lineHeight: '1.6' }}>{proj.description}</p>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {proj.techStack?.split(",").map((t, ti) => (
                      <span key={ti} style={{ fontSize: '0.75rem', fontWeight: '600', padding: '4px 10px', background: '#f1f5f9', color: '#475569', borderRadius: '6px' }}>
                        {t.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  

      {/* FULL-FEATURED MODAL */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="profile-modal modern-white-theme animated-zoom-in">
            <div className="modal-header-white">
              <div className="header-title">
                <div className="green-accent-dot"></div>
                <h2>Professional Portfolio Editor</h2>
              </div>
              <button className="close-btn-minimal" onClick={() => setIsModalOpen(false)}><FaTimes /></button>
            </div>

            <form onSubmit={handleUpdate} className="profile-form-clean scroll-form">
              
              {/* SECTION 1: Identity */}
              <div className="form-step">
                <div className="step-label">
                  <span className="step-number">01</span>
                  <h4>Identity & Links</h4>
                </div>
                <div className="input-field-group">
                  <label>Professional Headline</label>
                  <input className="modern-input" value={formData.headline} onChange={(e) => setFormData({...formData, headline: e.target.value})} placeholder="e.g. Java Intern at TSAR IT" />
                </div>
                <div className="input-grid-2">
                  <div className="input-field-group">
                    <label>Location</label>
                    <div className="input-with-icon"><FaMapMarkerAlt className="input-icon" /><input value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} /></div>
                  </div>
                  <div className="input-field-group">
                    <label>LinkedIn URL</label>
                    <div className="input-with-icon"><FaLinkedin className="input-icon" /><input value={formData.linkedinUrl} onChange={(e) => setFormData({...formData, linkedinUrl: e.target.value})} /></div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: Content */}
              <div className="form-step">
                <div className="step-label">
                  <span className="step-number">02</span>
                  <h4>Narrative</h4>
                </div>
                <div className="input-field-group">
                  <label>Experience Summary</label>
                  <textarea className="modern-textarea" value={formData.experience} onChange={(e) => setFormData({...formData, experience: e.target.value})} />
                </div>
                <div className="input-field-group">
                  <label>Key Achievements</label>
                  <textarea className="modern-textarea" value={formData.achievements} onChange={(e) => setFormData({...formData, achievements: e.target.value})} />
                </div>
              </div>

              {/* SECTION 3: Projects */}
              <div className="form-step">
                <div className="step-label-flex">
                  <div className="step-label"><span className="step-number">03</span><h4>Projects</h4></div>
                  <button type="button" className="add-project-pill" onClick={addProject}><FaPlus /> Add</button>
                </div>
                {formData.projects.map((proj, idx) => (
                  <div key={idx} className="project-card-white animate-slide-up">
                    <div className="card-header-clean">
                      <h5>Project #{idx + 1}</h5>
                      <button type="button" onClick={() => removeProject(idx)} className="remove-icon-btn"><FaTrash /></button>
                    </div>
                    <input className="sub-input" placeholder="Title" value={proj.title} onChange={(e) => handleProjectChange(idx, "title", e.target.value)} />
                    <textarea className="sub-textarea" placeholder="Description" value={proj.description} onChange={(e) => handleProjectChange(idx, "description", e.target.value)} />
                    <div className="input-grid-2">
                      <input placeholder="Tech Stack" value={proj.techStack} onChange={(e) => handleProjectChange(idx, "techStack", e.target.value)} />
                      <input placeholder="GitHub Link" value={proj.githubLink} onChange={(e) => handleProjectChange(idx, "githubLink", e.target.value)} />
                    </div>
                  </div>
                ))}
              </div>

              {/* SECTION 4: Skills & Media */}
              <div className="form-step no-border">
                <div className="step-label"><span className="step-number">04</span><h4>Skills & Media</h4></div>
                <div className="input-field-group">
                  <label>Skills (Comma separated)</label>
                  <input className="modern-input" value={formData.skills.join(", ")} onChange={(e) => setFormData({...formData, skills: e.target.value.split(",")})} />
                </div>
                <div className="file-upload-grid">
                  <div className="file-drop-zone">
                    <FaCloudUploadAlt className="upload-icon" />
                    <label>Profile Image</label>
                    <input type="file" onChange={(e) => setFiles({...files, profileImage: e.target.files[0]})} />
                  </div>
                  <div className="file-drop-zone">
                    <FaFileAlt className="upload-icon" />
                    <label>Resume (PDF)</label>
                    <input type="file" onChange={(e) => setFiles({...files, resume: e.target.files[0]})} />
                  </div>
                </div>
              </div>

              <div className="modal-footer-sticky">
                <button type="submit" className="btn-primary-green"><FaRocket /> Sync Portfolio</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;