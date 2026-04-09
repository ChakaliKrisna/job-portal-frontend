import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { useNavigate } from "react-router-dom";
import { FaBuilding, FaMapMarkerAlt, FaRocket, FaMoneyBillWave, FaChevronRight } from "react-icons/fa";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "./Styles/internship.css";

// No changes to imports neededconst MOCK_INTERNSHIPS = [
 const internships=[{
    id: 1,
    title: "Java Backend Intern",
    company: "TechNova Solutions",
    location: "Remote",
    stipend: "₹15,000/mo",
    type: "Internship"
  },
  {
    id: 2,
    title: "Full Stack Developer",
    company: "CloudScale Inc.",
    location: "Bangalore",
    stipend: "₹25,000/mo",
    type: "Internship"
  },
  {
    id: 3,
    title: "UI/UX Design Intern",
    company: "Creative Pulse",
    location: "Remote",
    stipend: "Unpaid",
    type: "Internship"
  },
  {
    id: 4,
    title: "Data Analyst Intern",
    company: "Insight Data",
    location: "Hyderabad",
    stipend: "₹20,000/mo",
    type: "Internship"
  },
  {
    id: 5,
    title: "Marketing Strategy",
    company: "Growth Hackers",
    location: "Mumbai",
    stipend: "₹12,000/mo",
    type: "Internship"
  },
  {
    id: 6,
    title: "React.js Intern",
    company: "Vite Flow",
    location: "Remote",
    stipend: "₹18,000/mo",
    type: "Internship"
  }
];


const InternshipCarousel = ({ data = [], title = "Latest Internships" }) => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("All");

  // Dynamic Filtering Logic with added safety check
  const filteredData = data.filter((intern) => {
    // Ensure intern object exists and has the required fields
    const location = intern.location?.toLowerCase() || "";
    const stipend = intern.stipend || "Unpaid";

    if (activeFilter === "All") return true;
    if (activeFilter === "Remote") return location === "remote";
    if (activeFilter === "Paid") return stipend !== "Unpaid"; 
    return true;
  });

  return (
    <section className="internship-section">
      <div className="carousel-header-wrapper">
        <div className="header-content">
          <h2 className="carousel-title">{title}</h2>
          <div className="filter-pill-container">
            {["All", "Remote", "Paid"].map((type) => (
              <button
                key={type}
                className={`filter-pill ${activeFilter === type ? "active" : ""}`}
                onClick={() => setActiveFilter(type)}
              >
                {/* Visual feedback: add the icon only to the Paid pill */}
                {type === "Paid" && <FaMoneyBillWave className="mr-2 text-green-500" />}
                {type}
              </button>
            ))}
          </div>
        </div>
        <button onClick={() => navigate("/internships")} className="view-all-link">
          Explore All <FaChevronRight className="ml-1 text-xs" />
        </button>
      </div>

      {filteredData.length > 0 ? (
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={25}
          slidesPerView={1}
          pagination={{ clickable: true }}
          autoplay={{ delay: 4000, disableOnInteraction: false }}
          breakpoints={{
            640: { slidesPerView: 1 },
            768: { slidesPerView: 2 },
            1100: { slidesPerView: 3 },
          }}
          className="internship-swiper"
        >
          {filteredData.map((intern) => (
            <SwiperSlide key={intern.id}>
              <div className="intern-card-premium">
                <div className="intern-card-main">
                  <div className="intern-icon-box">
                    {/* You could eventually map specific icons to specific titles here */}
                    <FaRocket />
                  </div>
                  <div className="intern-text">
                    <h4>{intern.title}</h4>
                    <p className="intern-company">
                      <FaBuilding className="inline-icon" /> {intern.company}
                    </p>
                  </div>
                </div>

                <div className="intern-meta">
                  <span className="meta-item">
                    <FaMapMarkerAlt className="meta-icon" /> {intern.location}
                  </span>
                  
                  {/* Your excellent Dynamic Stipend Tag Logic */}
                  <span className={`stipend-tag ${intern.stipend === "Unpaid" ? "unpaid" : "paid"}`}>
                    {intern.stipend !== "Unpaid" ? (
                      <span className="flex items-center">
                        <FaMoneyBillWave className="mr-1" /> {intern.stipend}
                      </span>
                    ) : (
                      "Certificate Only"
                    )}
                  </span>
                </div>

                <button 
                  className="intern-apply-btn"
                  onClick={() => navigate(`/internship/${intern.id}`)}
                >
                  Apply Now
                </button>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      ) : (
        <div className="empty-filter-state">
          <div className="text-4xl mb-4">🔍</div>
          <p>No {activeFilter.toLowerCase()} internships found.</p>
          <button 
            onClick={() => setActiveFilter("All")} 
            className="clear-filters-btn"
          >
            Show All Opportunities
          </button>
        </div>
      )}
    </section>
  );
};

export default InternshipCarousel;