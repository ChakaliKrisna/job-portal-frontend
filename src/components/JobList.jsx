import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { FaMapMarkerAlt, FaWallet, FaClock, FaArrowRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom"; // Use navigate for SPA feel
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "./Styles/joblist.css";

const jobs = [
  { id: 1, title: "Frontend Developer", company: "Google", location: "Hyderabad", salary: "₹12-18 LPA", type: "Full Time", posted: "2 days ago", logo: "https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_Reference_icon.png" },
  { id: 2, title: "Backend Engineer", company: "Amazon", location: "Bangalore", salary: "₹15-25 LPA", type: "Remote", posted: "Just now", logo: "https://upload.wikimedia.org/wikipedia/commons/d/de/Amazon_icon.png" },
  { id: 3, title: "Java Full Stack Intern", company: "Tsar IT", location: "Remote", salary: "₹15k-25k/mo", type: "Internship", posted: "1 day ago", logo: "https://cdn-icons-png.flaticon.com/512/5968/5968282.png" },
  { id: 4, title: "Software Engineer", company: "Microsoft", location: "Delhi", salary: "₹20-30 LPA", type: "Full Time", posted: "5 hours ago", logo: "https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg" },
];

const JobCarousel = ({ title = "Trending Opportunities" }) => {
  const navigate = useNavigate();

  return (
    <section className="carousel-section">
      <div className="container">
        <div className="carousel-header">
          <h2 className="display-title">{title}</h2>
          <button onClick={() => navigate("/jobs")} className="text-btn">
            View All <FaArrowRight />
          </button>
        </div>

        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={30}
          slidesPerView={1}
          autoplay={{ delay: 3000 }}
          pagination={{ clickable: true }}
          breakpoints={{
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
          className="job-swiper"
        >
          {jobs.map((job) => (
            <SwiperSlide key={job.id}>
              <div className="premium-job-card">
                <div className="card-top">
                  <img src={job.logo} alt={job.company} className="card-logo" />
                  <span className="badge-type">{job.type}</span>
                </div>

                <div className="card-body">
                  <h4 className="job-role">{job.title}</h4>
                  <p className="job-brand">{job.company}</p>
                  
                  <div className="job-meta-list">
                    <span className="meta-tag"><FaMapMarkerAlt /> {job.location}</span>
                    <span className="meta-tag"><FaWallet /> {job.salary}</span>
                    <span className="meta-tag"><FaClock /> {job.posted}</span>
                  </div>
                </div>

                <div className="card-footer">
                  <button 
                    className="btn-glass-action"
                    onClick={() => navigate(`/job/${job.id}`)}
                  >
                    View Details
                  </button>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default JobCarousel;