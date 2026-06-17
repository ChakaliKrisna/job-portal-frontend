import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import axios from "axios";
import { FaBuilding, FaArrowRight, FaCalendarAlt, FaUsers } from "react-icons/fa";

// Import Swiper styling assets directly
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "./Styles/companessections.css";

const CompanyCarousel = () => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch company dataset directly from Spring Boot REST API
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true);
        const response = await axios.get("https://job-portal-backend-365l.onrender.com/job-portal/company");
        
        // Handle array normalization safely depending on backend payload structure
        if (Array.isArray(response.data)) {
          setCompanies(response.data);
        } else if (response.data && Array.isArray(response.data.content)) {
          setCompanies(response.data.content);
        }
        setError(null);
      } catch (err) {
        console.error("Error loading featured corporate data streams:", err);
        setError("Unable to load featured companies.");
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  if (loading) {
    return (
      <section className="company-carousel-loading">
        <div className="carousel-skeleton-spinner"></div>
      </section>
    );
  }

  if (error || companies.length === 0) {
    return (
      <section className="company-carousel-empty">
        <p>{error || "No active company profiles discovered."}</p>
      </section>
    );
  }

  return (
    <section className="company-carousel">
      <div className="carousel-header-block">
        <h3>Featured Companies</h3>
        <p>Discover top-tier workplaces hiring right now</p>
      </div>

      <Swiper
        modules={[Navigation, Pagination]}
        spaceBetween={24}
        slidesPerView={1}
        navigation
        pagination={{ clickable: true }}
        breakpoints={{
          640: { slidesPerView: 2, spaceBetween: 20 },
          1024: { slidesPerView: 3, spaceBetween: 24 },
          1400: { slidesPerView: 4, spaceBetween: 24 }
        }}
        className="premium-swiper-wrapper"
      >
        {companies.map((company) => {
          // Identify the targeting key (prefers publicId as used by your details page layout)
          const corporateTargetId = company.publicId || company.id;
          
          // RESOLVED: Safely fall back to backend's logoUrl property
          const resolvedLogo = company.logoUrl || company.logo || company.companyLogo;
          
          // UI ENHANCEMENT: Safeguard layout heights by handling text truncation
          const rawDescription = company.description || company.desc || "";
          const truncatedDescription = rawDescription.length > 120 
            ? `${rawDescription.substring(0, 115)}...` 
            : rawDescription || "Explore career possibilities and structural milestones.";

          return (
            <SwiperSlide key={corporateTargetId}>
              <div
                className="company-card"
                onClick={() => navigate(`/company/${corporateTargetId}`)}
              >
                <div className="company-card-upper">
                  {resolvedLogo ? (
                    <div className="logo-img-container">
                      <img 
                        src={resolvedLogo} 
                        alt={`${company.name || 'Company'} Identity`} 
                        className="company-logo" 
                        loading="lazy"
                        onError={(e) => {
                          // Fallback if image URL returns 404 or broken resource link
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      <div className="company-logo-fallback" style={{ display: 'none' }}>
                        <FaBuilding />
                      </div>
                    </div>
                  ) : (
                    <div className="company-logo-fallback">
                      <FaBuilding />
                    </div>
                  )}
                  <span className="hiring-badge">Hiring</span>
                </div>

                <div className="company-card-body">
                  <h4>{company.name || company.companyName || "Anonymous Enterprise"}</h4>
                  
                  {/* UI ENHANCEMENT: Optional inline metadata chips */}
                  <div className="company-meta-pills">
                    {company.companySize && (
                      <span className="meta-pill">
                        <FaUsers /> {company.companySize}
                      </span>
                    )}
                    {company.foundedYear && (
                      <span className="meta-pill">
                        <FaCalendarAlt /> Est. {company.foundedYear}
                      </span>
                    )}
                  </div>

                  <p className="company-card-desc">
                    {truncatedDescription}
                  </p>
                </div>

                <div className="company-card-footer">
                  <span className="location-tag">
                    📍 {company.location && company.location.trim() !== "" ? company.location : "Global"}
                  </span>
                  <div className="action-arrow-indicator">
                    <FaArrowRight />
                  </div>
                </div>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>

      <div className="explore-btn-container">
        <button
          onClick={() => navigate("/companies")}
          className="explore-btn"
        >
          Explore More Companies
          <FaArrowRight className="btn-icon-shift" />
        </button>
      </div>
    </section>
  );
};

export default CompanyCarousel;