import React, { Suspense, lazy, useState, useEffect } from "react";
import { 
  FaArrowRight, FaBell, FaBuilding, FaBolt, 
  FaCheckCircle, FaUserTie, FaFileAlt
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Hero from "../components/Hero";
import "../components/Styles/home.css";

const JobPortal = lazy(() => import("../components/JobList"));
const CompanyCarousel = lazy(() => import("../components/CompanySection"));

const SectionLoader = () => (
  <div className="section-loader">
    <div className="spinner"></div>
    <p>Curating premium listings...</p>
  </div>
);

const Home = () => {
  const [role, setRole] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const savedRole = localStorage.getItem("userRole") || localStorage.getItem("role");
    setRole(savedRole);
  }, []);

  const valueFeatures = [
    { title: "Resume Upload", text: "Upload your resume easily and parse data instantaneously.", icon: <FaFileAlt className="feat-ico" /> },
    { title: "One-Click Apply", text: "Apply to global jobs in one single click seamlessly.", icon: <FaBolt className="feat-ico" /> },
    { title: "Recruiter Dashboard", text: "Manage applicants, track pipelines, and review candidates.", icon: <FaUserTie className="feat-ico" /> },
    { title: "Email Notifications", text: "Get hyper-focused, relevant job alerts directly to your inbox.", icon: <FaBell className="feat-ico" /> },
    { title: "Company Profiles", text: "View transparent company details and hiring insights.", icon: <FaBuilding className="feat-ico" /> }
  ];

  const handleProfileNavigation = () => {
    if (role === "ROLE_RECRUITER" || role === "RECRUITER") {
      navigate("/company-profile");
    } else if (role === "ROLE_STUDENT" || role === "STUDENT") {
      navigate("/profile");
    } else {
      navigate("/");
    }
  };

  return (
    <div className="home-wrapper">
      <main className="home-main">
        
        {/* SECTION 1: HERO CONTAINER */}
        {role === "RECRUITER" || role === "ROLE_RECRUITER" ? (
          <section className="recruiter-hero-dashboard fade-in">
            <div className="recruiter-hero-content">
              <span className="badge-pill">Recruiter Workspace</span>
              <h1>Welcome back, <span className="text-gradient">Visionary</span></h1>
              <p>Your workspace is primed. Manage job posts, track active pipelines, and discover premium talent effortlessly.</p>
              <button className="dashboard-btn" onClick={() => navigate('/recruiter-dashboard')}>
                Go to Dashboard <FaArrowRight className="arrow-icon" />
              </button>
            </div>
          </section>
        ) : (
          <div className="fade-in">
            <Hero />
          </div>
        )}

        {/* SECTION 2: SYSTEM WORKFLOW INSTRUCTIONS */}
        <section className="home-section scroll-animate">
          <div className="section-title-area">
            <span className="section-subtitle">The Ecosystem</span>
            <h2>How It <span className="text-gradient">Works</span></h2>
            <p>Your simple path to landing the perfect opportunity</p>
          </div>
          <div className="workflow-bento-grid">
            <div className="workflow-step">
              <div className="step-num">01</div>
              <h4>Create Account</h4>
              <p>Sign up and build an intelligent portfolio to showcase your elite skills.</p>
            </div>
            <div className="workflow-step">
              <div className="step-num">02</div>
              <h4>Find Jobs</h4>
              <p>Get matched with hyper-relevant opportunities matching your professional milestones.</p>
            </div>
            <div className="workflow-step">
              <div className="step-num">03</div>
              <h4>Apply & Track</h4>
              <p>Apply instantly through telemetry channels and track application loops end-to-end.</p>
            </div>
          </div>
        </section>

        {/* SECTION 3: TRENDING FEATURED OPPORTUNITIES */}
        <section className="trending-jobs-bg scroll-animate">
          <div className="home-section">
            <div className="section-title-area">
              <span className="section-subtitle">Live Streams</span>
              <h2>Latest <span className="text-gradient">Job Openings</span></h2>
              <p>Top opportunities curated just for you</p>
            </div>
            <Suspense fallback={<SectionLoader />}>
              <JobPortal isHomePage={true} />
            </Suspense>
          </div>
        </section>

        {/* SECTION 4: ACTIVE INTERNSHIPS */}
        <section className="home-section scroll-animate">
          <div className="section-title-area">
            <span className="section-subtitle">Accelerate Career</span>
            <h2>Active <span className="text-gradient">Internships</span></h2>
            <p>Learn real-world skills through internships with top companies</p>
          </div>
          <Suspense fallback={<SectionLoader />}>
            <JobPortal isHomePage={true} internshipMode={true} />
          </Suspense>
        </section>

        {/* SECTION 5: FEATURED CORPORATE PARTNERS */}
        <section className="trending-jobs-bg padding-box scroll-animate">
          <div className="home-section">
            <div className="section-title-area text-center">
              <span className="section-subtitle">Network Hub</span>
              <h2>Top <span className="text-gradient">Companies</span></h2>
              <p>Top companies hiring on our platform right now</p>
            </div>
            <Suspense fallback={<div className="loading-dots"><span>.</span><span>.</span><span>.</span></div>}>
              <CompanyCarousel />
            </Suspense>
          </div>
        </section>

        {/* SECTION 6: PLATFORM FEATURES */}
        <section className="home-section platform-features-bg-wrapper scroll-animate">
          <div className="section-title-area">
            <span className="section-subtitle">Core Architecture</span>
            <h2>Platform <span className="text-gradient">Features</span></h2>
            <p>Everything you need to streamline your job search and hiring process</p>
          </div>
          <div className="platform-features-bento-grid">
            {valueFeatures.map((feat, idx) => (
              <div key={idx} className="feature-bento-item-card">
                <div className="feat-header-row">
                  <div className="icon-box-wrapper">{feat.icon}</div>
                  <h4>{feat.title}</h4>
                </div>
                <p>{feat.text}</p>
                <div className="feat-check-badge">
                  <FaCheckCircle /> Enterprise Verified
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 7: CALL TO ACTION (CTA) TRIGGER */}
        <section className="home-section global-cta-banner-wrapper scroll-animate">
          <div className="cta-banner-inner-content">
            <h2>Ready to discover your absolute dream job?</h2>
            <p>Join thousands of students, developers, and builders securing roles daily.</p>
            <div className="cta-action-button-group">
              <button onClick={() => navigate("/jobs")} className="cta-primary-btn">
                Browse Openings <FaArrowRight />
              </button>
              <button onClick={handleProfileNavigation} className="cta-secondary-btn">
                Complete Your Profile
              </button>
            </div>
          </div>
        </section>

        {/* SECTION 8: SYSTEM NOTIFICATION STREAM */}
        <section className="modern-newsletter scroll-animate">
          <div className="newsletter-inner">
            <div className="news-text">
              <div className="bell-glow-container">
                <FaBell className="bell-icon" />
              </div>
              <h3>Get job alerts instantly</h3>
              <p>Receive notifications immediately when jobs matching your profile match live servers.</p>
            </div>
            <form className="news-form" onSubmit={(e) => e.preventDefault()}>
              <input type="email" placeholder="Enter your email address" required />
              <button type="submit">Notify Me</button>
            </form>
          </div>
        </section>

      </main>
    </div>
  );
};

export default Home;