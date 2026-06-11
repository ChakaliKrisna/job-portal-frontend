import React, { Suspense, lazy, useState, useEffect } from "react";
import { FaArrowRight, FaBell, FaBuilding, FaUserCheck, FaBolt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Hero from "../components/Hero";
import "../components/Styles/home.css";

// Lazy loading sub-modules cleanly
const JobPortal = lazy(() => import("../components/JobList").catch(() => ({ default: () => <MockJobs /> })));
const InternshipCarousel = lazy(() => import("../components/Internship").catch(() => ({ default: () => <MockInternships /> })));
const CompanyCarousel = lazy(() => import("../components/CompanySection").catch(() => ({ default: () => <MockCompanies /> })));

const SectionLoader = () => (
  <div className="section-loader">
    <div className="spinner"></div>
    <p>Parsing Open Pipelines...</p>
  </div>
);

// Fallback Layout Mocks using your precise UI/UX design specifications
const MockJobs = () => {
  const sampleJobs = [
    { id: 1, title: "UI/UX Designer", company: "Accenture", initial: "A", location: "Ahmedabad", package: "₹7.0LPA", badge: "FULL TIME", mode: "ONSITE" },
    { id: 2, title: "Senior Java Engineer", company: "TSAR IT PVT LTD", initial: "T", location: "Remote", package: "₹14.0LPA", badge: "FULL TIME", mode: "REMOTE" },
    { id: 3, title: "Frontend Developer", company: "Stripe", initial: "S", location: "Bangalore", package: "₹12.5LPA", badge: "FULL TIME", mode: "HYBRID" }
  ];

  return (
    <div className="modern-bento-grid">
      {sampleJobs.map((job) => (
        <div key={job.id} className="modern-job-card">
          <div className="card-badge">{job.badge}</div>
          <div className="card-body">
            <div className="company-logo-sm">{job.initial}</div>
            <h4>{job.title}</h4>
            <p className="company-name">{job.company}</p>
            <div className="card-meta">
              <span>
                <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 384 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                  <path d="M172.268 501.67C26.97 291.031 0 269.413 0 192 0 85.961 85.961 0 192 0s192 85.961 192 192c0 77.413-26.97 99.031-172.268 309.67-9.535 13.774-29.93 13.773-39.464 0zM192 272c44.183 0 80-35.817 80-80s-35.817-80-80-80-80 35.817-80 80 35.817 80 80 80z"></path>
                </svg> {job.location}
              </span>
              <span>
                <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                  <path d="M461.2 128H80c-8.84 0-16-7.16-16-16s7.16-16 16-16h384c8.84 0 16-7.16 16-16 0-26.51-21.49-48-48-48H64C28.65 32 0 60.65 0 96v320c0 35.35 28.65 64 64 64h397.2c28.02 0 50.8-21.53 50.8-48V176c0-26.47-22.78-48-50.8-48zM416 336c-17.67 0-32-14.33-32-32s14.33-32 32-32 32 14.33 32 32-14.33 32-32 32z"></path>
                </svg> {job.package}
              </span>
            </div>
          </div>
          <div className="card-footer">
            <span className="mode-pill">{job.mode}</span>
            <button className="save-icon-btn">
              <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 384 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                <path d="M336 0H48C21.49 0 0 21.49 0 48v464l192-112 192 112V48c0-26.51-21.49-48-48-48zm0 428.43l-144-84-144 84V54a6 6 0 0 1 6-6h276c3.314 0 6 2.683 6 5.996V428.43z"></path>
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

// Layout Mock tailored specifically for Internships matching the premium layout syntax
const MockInternships = () => {
  const sampleInternships = [
    { id: 1, title: "Backend Architecture Intern", company: "Enterprise Solutions", initial: "E", location: "Hybrid", package: "₹25k/mo", badge: "INTERNSHIP", mode: "HYBRID" },
    { id: 2, title: "Product Management Associate", company: "Google", initial: "G", location: "Bangalore", package: "Paid Track", badge: "INTERNSHIP", mode: "ONSITE" }
  ];

  return (
    <div className="modern-bento-grid">
      {sampleInternships.map((intern) => (
        <div key={intern.id} className="modern-job-card internship-variant">
          <div className="card-badge internship-badge">{intern.badge}</div>
          <div className="card-body">
            <div className="company-logo-sm intern-logo">{intern.initial}</div>
            <h4>{intern.title}</h4>
            <p className="company-name">{intern.company}</p>
            <div className="card-meta">
              <span>
                <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 384 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                  <path d="M172.268 501.67C26.97 291.031 0 269.413 0 192 0 85.961 85.961 0 192 0s192 85.961 192 192c0 77.413-26.97 99.031-172.268 309.67-9.535 13.774-29.93 13.773-39.464 0zM192 272c44.183 0 80-35.817 80-80s-35.817-80-80-80-80 35.817-80 80 35.817 80 80 80z"></path>
                </svg> {intern.location}
              </span>
              <span>
                <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                  <path d="M461.2 128H80c-8.84 0-16-7.16-16-16s7.16-16 16-16h384c8.84 0 16-7.16 16-16 0-26.51-21.49-48-48-48H64C28.65 32 0 60.65 0 96v320c0 35.35 28.65 64 64 64h397.2c28.02 0 50.8-21.53 50.8-48V176c0-26.47-22.78-48-50.8-48zM416 336c-17.67 0-32-14.33-32-32s14.33-32 32-32 32 14.33 32 32-14.33 32-32 32z"></path>
                </svg> {intern.package}
              </span>
            </div>
          </div>
          <div className="card-footer">
            <span className="mode-pill">{intern.mode}</span>
            <button className="save-icon-btn">
              <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 384 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                <path d="M336 0H48C21.49 0 0 21.49 0 48v464l192-112 192 112V48c0-26.51-21.49-48-48-48zm0 428.43l-144-84-144 84V54a6 6 0 0 1 6-6h276c3.314 0 6 2.683 6 5.996V428.43z"></path>
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

const MockCompanies = () => (
  <div className="company-logos-strip">
    {["Google", "Microsoft", "Amazon", "Stripe", "TCS"].map((c) => (
      <div key={c} className="logo-placeholder">{c}</div>
    ))}
  </div>
);

const Home = () => {
  const [role, setRole] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    setRole(localStorage.getItem("userRole"));
  }, []);

  return (
    <div className="home-wrapper">
      <main className="home-main">
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

        {/* WORKFLOW PIPELINE LAYER */}
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

        {/* TRENDING JOBS SECTION */}
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

        {/* INTERNSHIPS SECTION */}
        <section className="home-section">
          <div className="section-title-area">
            <h2>Active <span className="text-gradient">Internship Tracks</span></h2>
            <p>Kickstart application development experience with dedicated support</p>
          </div>
          <Suspense fallback={<SectionLoader />}>
            <InternshipCarousel />
          </Suspense>
        </section>

        {/* BENTO STATISTICS & SYSTEM MATRICES */}
        <section className="home-section">
          <div className="stats-bento-container">
            <div className="stat-box-bento blue-gradient">
              <FaBuilding className="bento-icon" />
              <h3>500+</h3>
              <p>Verified Partners</p>
            </div>
            <div className="stat-box-bento purple-gradient">
              <FaUserCheck className="bento-icon" />
              <h3>12,000+</h3>
              <p>Active Profiles</p>
            </div>
            <div className="stat-box-bento emerald-gradient">
              <FaBolt className="bento-icon" />
              <h3>48 Hours</h3>
              <p>Guaranteed Feedback</p>
            </div>
          </div>
        </section>

        {/* COMPANY TRUST LAYER */}
        <section className="trending-jobs-bg padding-box">
          <div className="home-section text-center">
            <h3 className="partner-headline">Partnered with Industry Leaders</h3>
            <Suspense fallback={<div className="loading-dots">...</div>}>
              <CompanyCarousel />
            </Suspense>
          </div>
        </section>

        {/* NEWSLETTER PRE-FOOTER */}
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