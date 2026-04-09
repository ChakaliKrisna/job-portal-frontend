import React, { Suspense, lazy, useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Footer from "../components/Footer";
import "../components/Styles/home.css";

// Lazy loading components
const JobCarousel = lazy(() => import("../components/JobList"));
const InternshipCarousel = lazy(() => import("../components/Internship"));
const CompanyCarousel = lazy(() => import("../components/CompanySection"));
const CategoryGrid = lazy(() => import("../components/Category"));
const Stats = lazy(() => import("../components/Stats"));
const Testimonials = lazy(() => import("../components/Testimonials"));
const About = lazy(() => import("../components/About"));

const SectionLoader = () => (
  <div className="section-loader" style={{ textAlign: "center", padding: "2rem" }}>
    <div className="spinner"></div>
    <p>Updating opportunities...</p>
  </div>
);

const Home = ({ jobs = [], internships = [] }) => {
  // Console logs to verify data arrival in the browser
  console.log("Home received Jobs:", jobs.length);
  console.log("Home received Internships:", internships.length);

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("token"));
  }, []);

  // Filter trending jobs (Full Time)
  const trendingJobs = jobs.filter(j => j.type === "Full Time");

  return (
    <div className="home-wrapper">
      <Navbar />
      <main className="home-main">
        <Hero />

        <Suspense fallback={<SectionLoader />}>
          {/* Categories */}
          <section className="section-container">
            <CategoryGrid />
          </section>

          {/* Combined Listings Section */}
          <section className="listings-bg">
            <div className="container-inner">
              <div className="listings-stack">
                {/* 1. Job Carousel */}
                <JobCarousel data={trendingJobs} title="Trending Jobs" />
                
                {/* 2. Internship Carousel - CRITICAL: Passing 'internships' prop here */}
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
            <div className="decorative-circle"></div>
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
      <Footer />
    </div>
  );
};

export default Home;