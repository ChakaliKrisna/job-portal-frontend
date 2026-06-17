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
    <p>Loading jobs...</p>
  </div>
);

const Home = () => {
  const [role, setRole] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    setRole(localStorage.getItem("userRole"));
  }, []);

  // Updated to human-friendly UX text
  const valueFeatures = [
    { title: "Resume Upload", text: "Upload your resume easily", icon: <FaFileAlt className="feat-ico" /> },
    { title: "One-Click Apply", text: "Apply to jobs in one click", icon: <FaBolt className="feat-ico" /> },
    { title: "Recruiter Dashboard", text: "Manage applicants in one place", icon: <FaUserTie className="feat-ico" /> },
    { title: "Email Notifications", text: "Get job alerts by email", icon: <FaBell className="feat-ico" /> },
    { title: "Company Profiles", text: "View company details and hiring info", icon: <FaBuilding className="feat-ico" /> }
  ];

  return (
    <div className="home-wrapper">
      <main className="home-main">
        
        {/* SECTION 1: HERO CONTAINER (Handles Role-Based Routing Internally) */}
        {role === "RECRUITER" ? (
          <section className="recruiter-hero-dashboard">
            <div className="recruiter-hero-content">
              <h1>Welcome back, <span className="text-gradient">Recruiter</span></h1>
              <p>Manage job posts, track applicants, and review candidates easily.</p>
              <button className="dashboard-btn" onClick={() => navigate('/recruiter-dashboard')}>
                Go to Dashboard <FaArrowRight />
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
            <p>Your simple path to landing the perfect opportunity</p>
          </div>
          <div className="workflow-bento-grid">
            <div className="workflow-step">
              <div className="step-num">01</div>
              <h4>Create Account</h4>
              <p>Sign up and build your profile to showcase your skills.</p>
            </div>
            <div className="workflow-step">
              <div className="step-num">02</div>
              <h4>Find Jobs</h4>
              <p>Get matched with relevant opportunities matching your goals.</p>
            </div>
            <div className="workflow-step">
              <div className="step-num">03</div>
              <h4>Apply & Track</h4>
              <p>Apply instantly and track your application status easily.</p>
            </div>
          </div>
        </section>

        {/* SECTION 3: TRENDING FEATURED OPPORTUNITIES */}
        <section className="trending-jobs-bg">
          <div className="home-section">
            <div className="section-title-area">
              <h2>Latest <span className="text-gradient">Job Openings</span></h2>
              <p>Top opportunities curated just for you</p>
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
            <p>Learn real-world skills through internships with top companies</p>
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
                <h2>Top <span className="text-gradient">Companies</span></h2>
                <p>Top companies hiring on our platform right now</p>
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
            <h2>Platform <span className="text-gradient">Features</span></h2>
            <p>Everything you need to streamline your job search and hiring process</p>
          </div>
          <div className="platform-features-bento-grid">
            {valueFeatures.map((feat, idx) => (
              <div key={idx} className="feature-bento-item-card">
                <div className="feat-header-row">
                  {feat.icon}
                  <h4>{feat.title}</h4>
                </div>
                <p>{feat.text}</p>
                <div className="feat-check-badge"><FaCheckCircle /> Verification Completed</div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 7: CALL TO ACTION (CTA) TRIGGER */}
        <section className="home-section global-cta-banner-wrapper">
          <div className="cta-banner-inner-content">
            <h2>Ready to find your dream job?</h2>
            <p>Join thousands of students and developers finding jobs daily.</p>
            <div className="cta-action-button-group">
              <button onClick={() => navigate("/jobs")} className="cta-primary-btn">
                Browse Jobs <FaArrowRight />
              </button>
              <button
                onClick={() => {
                  const role = localStorage.getItem("role");

                  if (role === "ROLE_RECRUITER" || role === "RECRUITER") {
                    navigate("/company-profile");
                  } else if (role === "ROLE_STUDENT" || role === "STUDENT") {
                    navigate("/profile");
                  } else {
                    navigate("/");
                  }
                }}
                className="cta-secondary-btn"
              >
                Complete Your Profile
              </button>
            </div>
          </div>
        </section>

        {/* SECTION 8: SYSTEM NOTIFICATION STREAM */}
        <section className="modern-newsletter">
          <div className="newsletter-inner">
            <div className="news-text">
              <FaBell className="bell-icon" />
              <h3>Get job alerts instantly</h3>
              <p>Receive notifications immediately when jobs matching your profile are posted.</p>
            </div>
            <form className="news-form" onSubmit={(e) => e.preventDefault()}>
              <input type="email" placeholder="Enter your email address" />
              <button type="submit">Notify Me</button>
            </form>
          </div>
        </section>

      </main>
    </div>
  );
};

export default Home;