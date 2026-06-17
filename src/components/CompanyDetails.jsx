import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  FaBuilding, FaMapMarkerAlt, FaGlobe, FaEnvelope, 
  FaBriefcase, FaThLarge, FaSearch, FaArrowRight, 
  FaFolder, FaCalendarAlt, FaHourglassHalf, 
  FaTrophy, FaUserTie, FaShareSquare, FaTools, FaCheckCircle
} from "react-icons/fa";
import "../../src/components/CompanyDetails.css";

const CompanyDetails = () => {
  const { companyPublicId } = useParams(); 
  const navigate = useNavigate();

  // Core Structural States
  const [company, setCompany] = useState(null);
  const [allCompanyJobs, setAllCompanyJobs] = useState([]); 
  const [companyJobsPreview, setCompanyJobsPreview] = useState([]); 
  const [filteredJobs, setFilteredJobs] = useState([]); 
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Structural Analytics State Properties
  const [analytics, setAnalytics] = useState({
    totalVacancies: 0,
    totalApplications: 0,
    technologiesUsed: [],
    featuredJob: null,
    uniqueRecruiters: []
  });

  const fetchCompanyJobs = async (id) => {
    try {
      const response = await axios.get(
        `https://job-portal-backend-365l.onrender.com/job-portal/jobs/company/${id}`
      );
      
      let rawJobsArray = [];
      if (response.data && Array.isArray(response.data.content)) {
        rawJobsArray = response.data.content;
      } else if (Array.isArray(response.data)) {
        rawJobsArray = response.data;
      } else if (response.data && Array.isArray(response.data.jobs)) {
        rawJobsArray = response.data.jobs;
      }

      setAllCompanyJobs(rawJobsArray);

      // Extract Company Meta Information dynamically from the first job entry if root metadata route failed
      if (rawJobsArray.length > 0) {
        const referenceEntry = rawJobsArray[0];
        setCompany(prevCompany => ({
          name: prevCompany?.name || prevCompany?.companyName || referenceEntry.companyName || "Top Corporate Partner",
          logo: prevCompany?.logoUrl || prevCompany?.logo || prevCompany?.companyLogo || referenceEntry.companyLogo,
          location: prevCompany?.location || referenceEntry.companyLocation || referenceEntry.location || "Global Operations",
          website: prevCompany?.website || referenceEntry.companyWebsite,
          description: prevCompany?.description || (referenceEntry.description ? referenceEntry.description.split("\n\n")[0] : "Corporate details index pending upload."),
          size: prevCompany?.companySize || prevCompany?.size || "10,000+ Employees"
        }));
      }

      // Metrics Analytics Pipeline (Fallback to 1 vacancy per job listing if field omitted)
      const totalVacancies = rawJobsArray.reduce((sum, j) => sum + (j.openings || 1), 0);
      const totalApplications = rawJobsArray.reduce((sum, j) => sum + (j.applicationsCount || 0), 0);

      // Unique Technology Extraction 
      const techSet = new Set();
      rawJobsArray.forEach(j => j.skillsRequired?.forEach(s => techSet.add(s)));
      const technologiesUsed = Array.from(techSet);

      // Premium Highlight Processing (High paying roles)
      const sortedJobsBySalary = [...rawJobsArray].sort((a, b) => (b.salary || 0) - (a.salary || 0));
      const featuredJob = sortedJobsBySalary.length > 0 ? sortedJobsBySalary[0] : null;

      // Recruiter De-duplication Matrix
      const recruiterMap = new Map();
      rawJobsArray.forEach(j => {
        if (j.recruiter?.email) {
          recruiterMap.set(j.recruiter.email, j.recruiter);
        }
      });
      const uniqueRecruiters = Array.from(recruiterMap.values());

      setAnalytics({
        totalVacancies,
        totalApplications,
        technologiesUsed,
        featuredJob,
        uniqueRecruiters
      });

      // Show up to 4 roles initially in preview component
      const initialPreview = rawJobsArray.slice(0, 4);
      setCompanyJobsPreview(initialPreview);
      setFilteredJobs(initialPreview);

    } catch (err) {
      console.error("Error fetching company positions feed:", err);
    }
  };

  useEffect(() => {
    const getCompanyData = async () => {
      try {
        setLoading(true);
        
        // Attempt loading company root metadata profile wrapper
        try {
          const companyResponse = await axios.get(
            `https://job-portal-backend-365l.onrender.com/job-portal/company/${companyPublicId}`
          );
          if (companyResponse.data) {
            setCompany(companyResponse.data);
          }
        } catch (e) {
          console.warn("Dedicated company route missing or blank parameters, deriving metadata from jobs payload.");
        }

        // Fetch positions list
        await fetchCompanyJobs(companyPublicId);
        setError(null);
      } catch (err) {
        console.error("Error loading component matrix:", err);
        setError("Failed to stream complete company details across current port.");
      } finally {
        setLoading(false);
      }
    };

    if (companyPublicId) getCompanyData();
  }, [companyPublicId]);

  // Client Search filtering processing block
  useEffect(() => {
    const filtered = companyJobsPreview.filter((job) =>
      job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.skillsRequired?.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredJobs(filtered);
  }, [searchTerm, companyJobsPreview]);

  const formatPostedDate = (dateString) => {
    if (!dateString) return "Recently";
    return new Date(dateString).toLocaleDateString('en-US', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  };

  const calculateDaysLeft = (closedDateString) => {
    if (!closedDateString) return null;
    const difference = new Date(closedDateString).getTime() - new Date().getTime();
    return Math.ceil(difference / (1000 * 60 * 60 * 24));
  };

  if (loading) return <div className="modern-loading-container"><div className="modern-spinner"></div></div>;
  if (error) return <div className="modern-container"><div className="modern-error-banner">{error}</div></div>;

  // REPAIR MAP LOGIC FOR CLEAN IMAGE RESOLUTION
  const resolvedLogoUrl = company?.logoUrl || company?.logo || company?.companyLogo;
  const resolvedCompanyName = company?.name || company?.companyName || "Corporate Partner";
  const resolvedLocation = company?.location || "Global Operations";
  const resolvedCompanySize = company?.companySize || company?.size || "10,000+ Employees";

  return (
    <div className="modern-container">
      {company && (
        <>
          {/* Header Section */}
          <div className="company-profile-hub">
            <div className="company-hero-banner">
              {company.bannerUrl ? (
                <img src={company.bannerUrl} alt="Corporate space banner" className="banner-img" />
              ) : (
                <div className="banner-fallback-gradient" />
              )}
            </div>

            <div className="profile-identity-strip">
              <div className="identity-left-group">
                {/* FIXED LOGO FALLBACK SYSTEM */}
                {resolvedLogoUrl ? (
                  <img 
                    src={resolvedLogoUrl} 
                    alt={`${resolvedCompanyName} Brand Identity`} 
                    className="company-avatar-frame" 
                  />
                ) : (
                  <div className="company-avatar-fallback"><FaBuilding /></div>
                )}
                <div className="identity-text">
                  <h1 className="company-brand-title">{resolvedCompanyName}</h1>
                  <p className="company-sub-meta">
                    <FaMapMarkerAlt /> {resolvedLocation} &bull; 
                    <span className="ms-1 text-primary fw-medium"> {resolvedCompanySize} Employees</span>
                  </p>
                </div>
              </div>

              {company.website && (
                <a href={company.website} target="_blank" rel="noreferrer" className="visit-site-btn">
                  Visit Website <FaShareSquare />
                </a>
              )}
            </div>

            {/* Metrics Dashboard */}
            <div className="analytics-dashboard-grid">
              <div className="analytics-card">
                <span className="analytics-num text-indigo">{allCompanyJobs.length}</span>
                <span className="analytics-lbl">Open Roles</span>
              </div>
              <div className="analytics-card">
                <span className="analytics-num text-emerald">{analytics.totalVacancies}</span>
                <span className="analytics-lbl">Total Vacancies</span>
              </div>
              <div className="analytics-card">
                <span className="analytics-num text-amber">{analytics.totalApplications}</span>
                <span className="analytics-lbl">Applicants Received</span>
              </div>
              <div className="analytics-card">
                <span className="analytics-num text-rose">{analytics.technologiesUsed.length}</span>
                <span className="analytics-lbl">Core Tech Stack</span>
              </div>
            </div>

            <div className="company-body-layout-grid">
              <div className="body-left-rail">
                <section className="profile-info-block">
                  <h3 className="rail-block-title">Company Profile Overview</h3>
                  <p className="corporate-statement-text">{company.description || "Corporate description statement profile details index pending upload."}</p>
                </section>

                <section className="profile-info-block">
                  <h3 className="rail-block-title"><FaTools /> Technologies Deployed Here</h3>
                  <div className="tech-stack-universe">
                    {analytics.technologiesUsed.length > 0 ? (
                      analytics.technologiesUsed.map((tech) => (
                        <span key={tech} className="tech-universe-pill">{tech}</span>
                      ))
                    ) : (
                      <span className="text-muted small">Standard baseline development parameters.</span>
                    )}
                  </div>
                </section>

                {/* Featured Opportunity Card */}
                {analytics.featuredJob && (
                  <section className="profile-info-block featured-job-section">
                    <div className="featured-ribbon"><FaTrophy /> Premium Opportunity</div>
                    <h4 className="featured-role-title">{analytics.featuredJob.title}</h4>
                    <div className="featured-meta-row">
                      <span className="feat-salary">₹{analytics.featuredJob.salary ? (analytics.featuredJob.salary / 100000).toFixed(1) : "N/A"} LPA</span>
                      <span className="feat-badge">{analytics.featuredJob.workMode}</span>
                      <span className="feat-badge">{analytics.featuredJob.location}</span>
                    </div>
                    <button 
                      className="featured-explore-btn"
                      onClick={() => navigate(`/job/${analytics.featuredJob.publicId}`)}
                    >
                      View Featured Opportunity <FaArrowRight />
                    </button>
                  </section>
                )}
              </div>

              <div className="body-right-rail">
                <section className="profile-info-block recruiters-block">
                  <h3 className="rail-block-title"><FaUserTie /> Active Talent Partners</h3>
                  <div className="recruiters-card-stack">
                    {analytics.uniqueRecruiters.length > 0 ? (
                      analytics.uniqueRecruiters.map((recruiter, i) => (
                        <div key={i} className="recruiter-mini-card">
                          <div className="recruiter-avatar-circle">
                            {recruiter.name?.charAt(0).toUpperCase() || "HR"}
                          </div>
                          <div className="recruiter-meta-details">
                            <p className="recruiter-profile-name">{recruiter.name || "Talent Team"}</p>
                            <p className="recruiter-profile-email"><FaEnvelope /> {recruiter.email}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="recruiter-mini-card">
                        <div className="recruiter-avatar-circle">HR</div>
                        <div className="recruiter-meta-details">
                          <p className="recruiter-profile-name">Talent Acquisition Team</p>
                          <p className="recruiter-profile-email"><FaEnvelope /> recruitment@company.com</p>
                        </div>
                      </div>
                    )}
                  </div>
                </section>

                <section className="profile-info-block culture-block">
                  <h3 className="rail-block-title">Verified Core Perks</h3>
                  <div className="culture-perks-stack">
                    <span className="perk-tag"><FaCheckCircle /> Comprehensive Medical Cover</span>
                    <span className="perk-tag"><FaCheckCircle /> Generous Annual Learning Credits</span>
                    <span className="perk-tag"><FaCheckCircle /> Tailored Hybrid Workspace Frameworks</span>
                  </div>
                </section>
              </div>
            </div>
          </div>

          {/* Active Job Postings Display List */}
          <section className="recommendations-section">
            <div className="section-header-row">
              <div className="section-title-area">
                <h2>Active Career Postings</h2>
                <span className="job-count-badge">Displaying {filteredJobs.length} Positions</span>
              </div>
              
              <div className="modern-search-wrapper">
                <FaSearch className="search-input-icon" />
                <input 
                  type="text" 
                  placeholder="Filter openings by keyword..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="modern-filter-input"
                />
              </div>
            </div>

            {filteredJobs.length === 0 ? (
              <div className="empty-state">No active postings matching filter strings found.</div>
            ) : (
              <div className="modern-job-grid">
                {filteredJobs.map((job) => {
                  const daysLeft = calculateDaysLeft(job.closedDate);
                  return (
                    <article 
                      key={job.publicId} 
                      className="modern-job-card"
                      onClick={() => navigate(`/job/${job.publicId}`)}
                    >
                      <div className="job-card-header">
                        <div>
                          <h3 className="job-title-text">{job.title}</h3>
                          {job.category && (
                            <span className="category-badge">
                              <FaFolder style={{marginRight: '4px'}} /> {job.category.replace("_", " ")}
                            </span>
                          )}
                        </div>
                        <span className="job-mode-tag">{job.workMode}</span>
                      </div>

                      <div className="job-details-middle">
                        <div className="text-salary">
                          <span>₹{job.salary ? (job.salary / 100000).toFixed(1) : "N/A"} LPA</span>
                        </div>
                        <div className="detail-meta-row">
                          <span><FaBriefcase /> {job.experienceLevel ? job.experienceLevel.replace('_', ' ') : "Entry Level"}</span>
                          <span><FaMapMarkerAlt /> {job.location}</span>
                        </div>
                      </div>

                      <div className="card-timeline-status-bar">
                        <span className="timeline-stamp-text">
                          <FaCalendarAlt /> Posted: {formatPostedDate(job.postedDate)}
                        </span>
                        
                        {daysLeft !== null ? (
                          daysLeft > 0 ? (
                            <span className="deadline-badge urgency-active">
                              <FaHourglassHalf /> {daysLeft} Days Left
                            </span>
                          ) : (
                            <span className="deadline-badge urgency-expired">⛔ Expired</span>
                          )
                        ) : (
                          <span className="deadline-badge urgency-active">🔥 Open</span>
                        )}
                      </div>

                      <div className="job-skills-footer">
                        <div className="skills-pill-group">
                          {job.skillsRequired?.slice(0, 3).map((skill) => (
                            <span key={skill} className="skill-pill">{skill}</span>
                          ))}
                          {job.skillsRequired?.length > 3 && (
                            <span className="skills-overflow">+{job.skillsRequired.length - 3}</span>
                          )}
                        </div>
                        <div className="action-arrow"><FaArrowRight /></div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

            <div className="view-all-footer-action">
              <button 
                className="view-all-jobs-btn"
                onClick={() => navigate(`/jobs?company=${companyPublicId}`)}
              >
                <FaThLarge style={{marginRight: '8px'}} /> View All Openings ({allCompanyJobs.length})
              </button>
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default CompanyDetails;