import React, { Suspense, lazy, useState, useEffect } from "react";
import "../components/Styles/home.css";

// Lazy loading components
const JobCarousel = lazy(() => import("../components/JobList"));
const InternshipCarousel = lazy(() => import("../components/Internship"));
const CompanyCarousel = lazy(() => import("../components/CompanySection"));
const CategoryGrid = lazy(() => import("../components/Category"));
const Stats = lazy(() => import("../components/Stats"));
const Testimonials = lazy(() => import("../components/Testimonials"));
const About = lazy(() => import("../components/About"));
const Hero = lazy(() => import("../components/Hero"));

const SectionLoader = () => (
  <div className="section-loader" style={{ textAlign: "center", padding: "2rem" }}>
    <div className="spinner"></div>
    <p>Updating opportunities...</p>
  </div>
);

const Home = ({ jobs = [], internships = [] }) => {
  const [role, setRole] = useState(null);

  useEffect(() => {
    setRole(localStorage.getItem("role"));
  }, []);

  // Filter trending jobs
  const trendingJobs = jobs.filter(j => j.type === "Full Time");

  return (
    <div className="home-wrapper">
      <main className="home-main">
        {/* If Recruiter is logged in, show a Welcome back banner instead of Hero */}
        {role === "recruiter" ? (
          <div style={styles.recruiterWelcome}>
            <h1>Welcome back, Recruiter</h1>
            <p>You are currently viewing the platform as a guest. Visit your dashboard to manage listings.</p>
            <button onClick={() => window.location.href='/recruiter-dashboard'} style={styles.btn}>
              Go to Recruiter Dashboard
            </button>
          </div>
        ) : (
          <Suspense fallback={<SectionLoader />}><Hero /></Suspense>
        )}

        <Suspense fallback={<SectionLoader />}>
          <section className="section-container">
            <CategoryGrid />
          </section>

          <section className="listings-bg">
            <div className="container-inner">
              <div className="listings-stack">
                <JobCarousel data={trendingJobs} title="Trending Jobs" />
                <InternshipCarousel data={internships} title="Latest Internships" />
              </div>
            </div>
          </section>

          <section className="newsletter-section">
            <div className="newsletter-content">
              <h2 className="newsletter-title">Stay Ahead of the Curve</h2>
              <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
                <input type="email" placeholder="Enter email..." className="newsletter-input" />
                <button type="submit" className="newsletter-btn">Get Alerts</button>
              </form>
            </div>
          </section>

          <section className="section-container">
            <Stats />
            <div className="company-carousel-wrapper">
              <CompanyCarousel title="Featured Recruiters" />
            </div>
          </section>

          <section className="testimonials-bg">
            <Testimonials />
          </section>

          <section className="section-container">
            <About />
          </section>
        </Suspense>
      </main>
    </div>
  );
};

const styles = {
  recruiterWelcome: {
    padding: "4rem 2rem",
    textAlign: "center",
    backgroundColor: "#2c3e50",
    color: "white",
    borderRadius: "10px",
    margin: "20px"
  },
  btn: {
    padding: "10px 20px",
    backgroundColor: "#3498db",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    marginTop: "15px",
    fontWeight: "bold"
  }
};

export default Home;