import React, { Suspense, lazy, useState, useEffect } from "react";
import { 
  FaArrowRight, FaBell, FaBuilding, FaBolt, 
  FaLaptopCode, FaCheckCircle, FaUserTie, FaFileAlt
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Hero from "../components/Hero";
import "../components/Styles/home.css";

// Lazy loading live modules tied to the backend database endpoints
const JobPortal = lazy(() => import("../components/JobList"));
const CompanyCarousel = lazy(() => import("../components/CompanySection"));

const SectionLoader = () => (
  <div className="section-loader">
    <div className="spinner"></div>
    <p>Parsing Open Pipelines...</p>
  </div>
);

const Home = () => {
  const [role, setRole] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    setRole(localStorage.getItem("userRole"));
  }, []);

  // Simplified to only include platform capabilities grid data
  const valueFeatures = [
    { title: "Resume Upload", text: "Match your technical portfolio parser dynamically.", icon: <FaFileAlt className="feat-ico" /> },
    { title: "One-Click Apply", text: "Dispatch secure profile applications in a single action.", icon: <FaBolt className="feat-ico" /> },
    { title: "Recruiter Dashboard", text: "Track candidate interaction pipelines step by step.", icon: <FaUserTie className="feat-ico" /> },
    { title: "Email Notifications", text: "Receive automated alerts matching your selected stack.", icon: <FaBell className="feat-ico" /> },
    { title: "Company Profiles", text: "Review internal operational data models natively.", icon: <FaBuilding className="feat-ico" /> }
  ];

  return (
    <div className="home-wrapper">
      <main className="home-main">
        
        {/* SECTION 1: HERO CONTAINER (Handles Role-Based Routing Internally) */}
        {role === "RECRUITER" ? (
          <section className="recruiter-hero-dashboard">
            <div className="recruiter-hero-content">
              <h1>Welcome Back, <span className="text-gradient">Recruiter Hub</span></h1>
              <p>Manage listings, track status updates, and view applicant pipelines natively.</p>
              <button className="dashboard-btn" onClick={() => navigate('/recruiter-dashboard')}>
                Go to Workspace Console <FaArrowRight />
              </button>
            </div>
          </section>
        ) : (
          <Hero />
        )}

        {/* SECTION 2: SYSTEM WORKFLOW INSTRUCTIONS */}
        <section className="home-section">
          <div className="section-title-area">
            <h2>How It <span className="text-gradient">Works</span></h2>
            <p>Your timeline from discovery to onboarding verified roles</p>
          </div>
          <div className="workflow-bento-grid">
            <div className="workflow-step">
              <div className="step-num">01</div>
              <h4>Account Identity</h4>
              <p>Setup your account profile mapping specialized core skillsets cleanly.</p>
            </div>
            <div className="workflow-step">
              <div className="step-num">02</div>
              <h4>Engine Matching</h4>
              <p>Our search algorithms query specifications immediately across active roles.</p>
            </div>
            <div className="workflow-step">
              <div className="step-num">03</div>
              <h4>Direct Placement</h4>
              <p>Track analytics logs directly through verified 48h loop iterations.</p>
            </div>
          </div>
        </section>

        {/* SECTION 3: TRENDING FEATURED OPPORTUNITIES */}
        <section className="trending-jobs-bg">
          <div className="home-section">
            <div className="section-title-area">
              <h2>Featured <span className="text-gradient">Opportunities</span></h2>
              <p>High-priority pipelines looking for active technical assets right now</p>
            </div>
            <Suspense fallback={<SectionLoader />}>
              <JobPortal isHomePage={true} />
            </Suspense>
          </div>
        </section>

        {/* SECTION 4: ACTIVE INTERNSHIPS (Using your JobPortal's explicit internshipMode prop) */}
        <section className="home-section">
          <div className="section-title-area">
            <h2>Active <span className="text-gradient">Internships</span></h2>
            <p>Gain industrial software deployment milestones alongside enterprise engineering leaders</p>
          </div>
          <Suspense fallback={<SectionLoader />}>
            <JobPortal 
              isHomePage={true} 
              internshipMode={true} 
            />
          </Suspense>
        </section>

        {/* SECTION 5: FEATURED CORPORATE PARTNERS */}
        <section className="trending-jobs-bg padding-box">
          <div className="text-center">
            <div className="home-section">
              <div className="section-title-area">
                <h2>Top Tier <span className="text-gradient">Companies</span></h2>
                <p>Direct platform placement nodes established with ecosystem industry pioneers</p>
              </div>
              <Suspense fallback={<div className="loading-dots">...</div>}>
                <CompanyCarousel />
              </Suspense>
            </div>
          </div>
        </section>

        {/* SECTION 6: INTEGRATED APPLICATION SUITE ARCHITECTURE */}
        <section className="home-section platform-features-bg-wrapper">
          <div className="section-title-area">
            <h2>Platform <span className="text-gradient">Capabilities</span></h2>
            <p>A modern ecosystem designed to optimize discovery pipelines</p>
          </div>
          <div className="platform-features-bento-grid">
            {valueFeatures.map((feat, idx) => (
              <div key={idx} className="feature-bento-item-card">
                <div className="feat-header-row">
                  {feat.icon}
                  <h4>{feat.title}</h4>
                </div>
                <p>{feat.text}</p>
                <div className="feat-check-badge"><FaCheckCircle /> Production Ready</div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 7: CALL TO ACTION (CTA) TRIGGER */}
        <section className="home-section global-cta-banner-wrapper">
          <div className="cta-banner-inner-content">
            <h2>Ready to Land Your Dream Track?</h2>
            <p>Join thousands of technical profiles parsing production dependencies daily across active teams.</p>
            <div className="cta-action-button-group">
              <button onClick={() => navigate("/jobs")} className="cta-primary-btn">
                Browse System Jobs <FaArrowRight />
              </button>
              <button onClick={() => navigate("/profile")} className="cta-secondary-btn">
                Complete Account Setup
              </button>
            </div>
          </div>
        </section>

        {/* SECTION 8: SYSTEM NOTIFICATION STREAM */}
        <section className="modern-newsletter">
          <div className="newsletter-inner">
            <div className="news-text">
              <FaBell className="bell-icon" />
              <h3>Instant Stream Alerts</h3>
              <p>Receive live notifications immediately when jobs matching your stack drop.</p>
            </div>
            <form className="news-form" onSubmit={(e) => e.preventDefault()}>
              <input type="email" placeholder="Enter dev configuration email address" />
              <button type="submit">Notify Me</button>
            </form>
          </div>
        </section>

      </main>
    </div>
  );
};

export default Home;