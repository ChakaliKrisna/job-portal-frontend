import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "./Styles/companessections.css";

const companies = [
  { id: 1, name: "Google", desc: "Innovating the future", logo: "https://via.placeholder.com/80" },
  { id: 2, name: "Amazon", desc: "Customer-first company", logo: "https://via.placeholder.com/80" },
  { id: 3, name: "Microsoft", desc: "Empowering every person", logo: "https://via.placeholder.com/80" },
  { id: 4, name: "Flipkart", desc: "India’s leading e-commerce", logo: "https://via.placeholder.com/80" },
];

const CompanyCarousel = () => (
  <section className="company-carousel">
    <h3>Featured Companies</h3>
    <Swiper
      spaceBetween={20}
      slidesPerView={3}
      navigation
      pagination={{ clickable: true }}
    >
      {companies.map((company) => (
        <SwiperSlide key={company.id}>
          <div
            className="company-card"
            onClick={() => window.location.href = `/company/${company.id}`}
          >
            <img src={company.logo} alt={company.name} className="company-logo" />
            <h4>{company.name}</h4>
            <p>{company.desc}</p>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
    <div className="explore-btn-container">
      <button
        onClick={() => window.location.href = "/companies"}
        className="explore-btn"
      >
        Explore More Companies →
      </button>
    </div>
  </section>
);

export default CompanyCarousel;
