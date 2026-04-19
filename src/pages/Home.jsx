import React, { Suspense, lazy, useState, useEffect } from "react";
import { FaArrowRight, FaBriefcase, FaRocket, FaBell } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "../components/Styles/home.css";

// Lazy loading components
const JobPortal = lazy(() => import("../components/JobList"));
const InternshipCarousel = lazy(() => import("../components/Internship"));
const CompanyCarousel = lazy(() => import("../components/CompanySection"));
const CategoryGrid = lazy(() => import("../components/Category"));
const Stats = lazy(() => import("../components/Stats"));
const Hero = lazy(() => import("../components/Hero"));

const SectionLoader = () => (
  <div className="section-loader">
    <div className="spinner"></div>
    <p>Loading Opportunities...</p>
  </div>
);

const Home = ({ internships = [] }) => {
  const [role, setRole] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    setRole(localStorage.getItem("role"));
  }, []);

  return (
    <div className="home-wrapper">
      <main className="home-main">
        {/* HERO SECTION */}
        {role === "recruiter" ? (
          <section className="recruiter-hero">
            <div className="recruiter-hero-content">
              <h1>Welcome back, <span className="text-gradient">Recruiter</span></h1>
              <p>Find the best talent for your organization today.</p>
              <button className="dashboard-btn" onClick={() => navigate('/recruiter-dashboard')}>
                Go to Dashboard <FaArrowRight />
              </button>
            </div>
          </section>
        ) : (
          <Suspense fallback={<SectionLoader />}><Hero /></Suspense>
        )}

        {/* CATEGORY EXPLORER */}
        <section className="home-section">
          <div className="section-title-area">
            <h2>Explore by <span className="text-gradient">Category</span></h2>
            <p>Find jobs tailored to your specific skillset</p>
          </div>
          <Suspense fallback={<SectionLoader />}>
            <CategoryGrid />
          </Suspense>
        </section>

        {/* TRENDING JOBS - PASSING PROPS TO SHOW ONLY 6 JOBS */}
        <section className="trending-jobs-bg">
          <div className="home-section">
            <Suspense fallback={<SectionLoader />}>
              <JobPortal isHomePage={true} />
            </Suspense>
          </div>
        </section>

        {/* INTERNSHIPS SECTION */}
        <section className="home-section">
          <div className="section-title-area">
            <h2>Latest <span className="text-gradient">Internships</span></h2>
            <p>Launch your career with hands-on experience</p>
          </div>
          <Suspense fallback={<SectionLoader />}>
            <InternshipCarousel data={internships} />
          </Suspense>
        </section>

        {/* STATS & COMPANIES */}
        <section className="stats-company-section">
          <Suspense fallback={<SectionLoader />}>
            <Stats />
            <div className="featured-companies-box">
              <h3>Partnered with Top Companies</h3>
              <CompanyCarousel />
            </div>
          </Suspense>
        </section>

        {/* NEWSLETTER - MODERN GRADIENT DESIGN */}
        <section className="modern-newsletter">
          <div className="newsletter-inner">
            <div className="news-text">
              <FaBell className="bell-icon" />
              <h3>Don't miss out on new openings</h3>
              <p>Get instant alerts when jobs matching your profile are posted.</p>
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