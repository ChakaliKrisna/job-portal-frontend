import React, { useEffect, useState } from "react";
import axios from "axios";
import { 
  FaUserEdit, FaFileAlt, FaGithub, FaGraduationCap, FaTools, 
  FaProjectDiagram, FaTimes, FaLink, FaCloudUploadAlt, FaDownload, 
  FaLightbulb, FaRocket, FaPlus, FaTrash, FaExternalLinkAlt, FaEdit 
} from "react-icons/fa";
import "../components/Styles/dashboard.css";

const API_BASE = "http://localhost:8080";

const UserDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [strength, setStrength] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // 1. Unified State for Text & Projects
  const [formData, setFormData] = useState({
    skills: [], // Array to match backend List<String>
    education: "",
    projects: [], // Array of Objects
    githubUrl: "",
  });

  // 2. File State
  const [files, setFiles] = useState({
    profileImage: null,
    resume: null
  });

  const token = localStorage.getItem("token");

  const fetchProfileData = async () => {
    try {
      const [profRes, strengthRes] = await Promise.all([
        axios.get(`${API_BASE}/api/users/student/profile`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_BASE}/api/users/student/profile/completion`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      setProfile(profRes.data);
      setStrength(strengthRes.data);

      if (profRes.data) {
        setFormData({
          skills: profRes.data.skills || [],
          education: profRes.data.education || "",
          projects: profRes.data.projects || [],
          githubUrl: profRes.data.githubUrl || "",
        });
      }
    } catch (err) {
      console.error("Profile data fetch failed");
    }
  };

  useEffect(() => { fetchProfileData(); }, []);

  // --- PROJECT & SKILL HANDLERS ---
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

  // ✅ Functional Resume Download
  const handleDownloadResume = () => {
    if (!profile?.resumeUrl) return;
    const link = document.createElement("a");
    link.href = `${API_BASE}${profile.resumeUrl}`;
    link.setAttribute("download", profile.resumeFileName || "Student_Resume.pdf");
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      // STEP A: Update JSON Data
      await axios.put(`${API_BASE}/api/users/student/profile`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // STEP B: Upload files if selected
      if (files.profileImage || files.resume) {
        const data = new FormData();
        if (files.profileImage) data.append("profileImage", files.profileImage);
        if (files.resume) data.append("resume", files.resume);

        await axios.post(`${API_BASE}/api/users/student/upload`, data, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          }
        });
      }

      alert("Profile updated successfully! 🚀");
      setIsModalOpen(false);
      fetchProfileData(); 
    } catch (err) {
      alert("Error updating profile.");
    }
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        
        {/* HEADER */}
        <header className="glass-header">
          <div className="hero-profile">
            <div className="avatar-canvas">
              {profile?.profileImageUrl ? (
                <img src={`${API_BASE}${profile.profileImageUrl}`} alt="Profile" className="avatar-img" />
              ) : (
                <div className="avatar-placeholder">{localStorage.getItem("userName")?.charAt(0)}</div>
              )}
              <div className="glow-ring"></div>
            </div>
            <div className="hero-details">
              <h1>{localStorage.getItem("userName")}</h1>
              <p className="subtitle">Aspiring Java Full-Stack Developer</p>
            </div>
          </div>
          <button className="action-pill" onClick={() => setIsModalOpen(true)}>
            <FaUserEdit /> Edit Portfolio
          </button>
        </header>

        <div className="bento-layout">
          {/* SIDEBAR */}
          <aside className="bento-aside">
            <div className="bento-card glass strength-card">
              <h3>Profile Strength</h3>
              <div className="circular-progress-box">
                 <svg viewBox="0 0 36 36" className="circular-chart">
                  <path className="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path className="circle" strokeDasharray={`${strength}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <text x="18" y="20.35" className="percentage">{strength}%</text>
                </svg>
              </div>
            </div>

            <div className="bento-card glass ai-tips">
              <h4><FaLightbulb className="icon-gold" /> Quick Tips</h4>
              <div className="tip-chip"><FaRocket /> Use keywords like "Spring Boot"</div>
              {strength < 100 && <div className="tip-chip warning"><FaRocket /> Add projects for 100%</div>}
            </div>
          </aside>

          {/* MAIN BENTO */}
          <main className="bento-main">
            <div className="inner-grid">
              
              <div className="bento-item glass">
                <div className="item-header"><FaTools /> <span>Technical Skills</span></div>
                <div className="pill-cloud">
                  {profile?.skills?.length > 0 ? profile.skills.map((s, i) => (
                    <span key={i} className="tech-pill">{s}</span>
                  )) : <p className="empty-text">No skills listed</p>}
                </div>
              </div>

              <div className="bento-item glass">
                <div className="item-header"><FaFileAlt /> <span>Documents</span></div>
                {profile?.resumeUrl ? (
                  <div className="resume-widget">
                    <p className="file-name-text">{profile.resumeFileName || "Resume.pdf"}</p>
                    <div className="btn-group">
                      <button onClick={handleDownloadResume} className="mini-btn highlight"><FaDownload /></button>
                    </div>
                  </div>
                ) : <p className="empty-text">No resume uploaded</p>}
                {profile?.githubUrl && (
                  <a href={profile.githubUrl} target="_blank" className="github-link-box">
                    <FaGithub /> GitHub Repo
                  </a>
                )}
              </div>

              <div className="bento-item glass full-width">
                <div className="item-header"><FaProjectDiagram /> <span>Projects</span></div>
                <div className="projects-display-grid">
                  {profile?.projects?.map((proj, i) => (
                    <div key={i} className="project-display-card">
                      <div className="proj-card-top">
                        <h4>{proj.title}</h4>
                        <a href={proj.githubLink} target="_blank"><FaExternalLinkAlt /></a>
                      </div>
                      <p className="proj-desc">{proj.description}</p>
                      <div className="proj-tags">
                        {proj.techStack?.split(",").map((t, ti) => <span key={ti} className="tech-tag">{t.trim()}</span>)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bento-item glass full-width">
                <div className="item-header"><FaGraduationCap /> <span>Education</span></div>
                <p className="education-text">{profile?.education || "Not added."}</p>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* UPDATE MODAL */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="profile-modal glass animated-zoom-in">
            <div className="modal-header">
              <h2>Refine Your Profile</h2>
              <button className="close-x" onClick={() => setIsModalOpen(false)}><FaTimes /></button>
            </div>
            <form onSubmit={handleUpdate} className="profile-form scroll-form">
              
              <div className="form-section-label">Identity & Links</div>
              <div className="input-row">
                <div className="input-group">
                  <label>Education</label>
                  <input type="text" value={formData.education} onChange={(e) => setFormData({...formData, education: e.target.value})} />
                </div>
                <div className="input-group">
                  <label>Skills (Comma Separated)</label>
                  <input type="text" value={formData.skills.join(", ")} onChange={(e) => setFormData({...formData, skills: e.target.value.split(",")})} />
                </div>
              </div>

              <div className="section-header-flex">
                <label className="section-label">Projects List</label>
                <button type="button" className="add-proj-btn" onClick={addProject}><FaPlus /> Add Project</button>
              </div>

              <div className="projects-edit-list">
                {formData.projects.map((proj, index) => (
                  <div key={index} className="project-edit-card">
                    <div className="edit-card-header">
                      <span>Project #{index + 1}</span>
                      <button type="button" onClick={() => removeProject(index)} className="del-btn"><FaTrash /></button>
                    </div>
                    <input placeholder="Title" value={proj.title} onChange={(e) => handleProjectChange(index, "title", e.target.value)} />
                    <textarea placeholder="Description" value={proj.description} onChange={(e) => handleProjectChange(index, "description", e.target.value)} />
                    <div className="input-row">
                      <input placeholder="Tech Stack" value={proj.techStack} onChange={(e) => handleProjectChange(index, "techStack", e.target.value)} />
                      <input placeholder="GitHub Link" value={proj.githubLink} onChange={(e) => handleProjectChange(index, "githubLink", e.target.value)} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="form-section-label">Media Uploads</div>
              <div className="input-row">
                <div className="input-group">
                  <label><FaCloudUploadAlt /> Profile Image</label>
                  <input type="file" accept="image/*" onChange={(e) => setFiles({...files, profileImage: e.target.files[0]})} />
                </div>
                <div className="input-group">
                  <label><FaFileAlt /> Resume (PDF)</label>
                  <input type="file" accept=".pdf" onChange={(e) => setFiles({...files, resume: e.target.files[0]})} />
                </div>
              </div>

              <button type="submit" className="save-btn-modern">Apply Changes</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;