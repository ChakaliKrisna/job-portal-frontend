import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
// import "./Styles/testimonials.css";
import "./Styles/testimonial.css"

const testimonials = [
  { id: 1, name: "Rahul", feedback: "This platform helped me land my first internship!" },
  { id: 2, name: "Priya", feedback: "Easy to use and lots of opportunities." },
  { id: 3, name: "Arjun", feedback: "Great for recruiters to find talent quickly." },
  { id: 4, name: "Sneha", feedback: "The Explore More section made job hunting simple." },
  { id: 5, name: "Vikram", feedback: "I found my dream role here!" },
];

const Testimonials = () => (
  <section className="testimonials">
    <h3>What Our Users Say</h3>
    <Swiper spaceBetween={20} slidesPerView={2}>
      {testimonials.map((t) => (
        <SwiperSlide key={t.id}>
          <div className="testimonial-card">
            <p>"{t.feedback}"</p>
            <h4>- {t.name}</h4>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  </section>
);

export default Testimonials;
