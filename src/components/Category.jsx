import React from "react";
import { useNavigate } from "react-router-dom";
import { 
  FaLaptopCode, FaBullhorn, FaPalette, 
  FaChartLine, FaUsers, FaHandshake 
} from "react-icons/fa";
import "./Styles/categorygrid.css";

// Updated with exact Backend ENUM values
const categories = [
  { name: "Software Engineering", value: "SOFTWARE_ENGINEERING", icon: <FaLaptopCode />, count: "450+" },
  { name: "Marketing", value: "MARKETING", icon: <FaBullhorn />, count: "120+" },
  { name: "UI/UX Design", value: "UI_UX_DESIGN", icon: <FaPalette />, count: "85+" },
  { name: "Finance", value: "FINANCE", icon: <FaChartLine />, count: "210+" },
  { name: "Human Resources", value: "HUMAN_RESOURCES", icon: <FaUsers />, count: "45+" },
  { name: "Sales", value: "SALES", icon: <FaHandshake />, count: "150+" },
];

const CategoryGrid = () => {
  const navigate = useNavigate();

  return (
    <section className="category-section">
      <div className="category-header">
        <h2 className="category-title">Explore by Category</h2>
        <p className="category-subtitle">Find the right role based on your expertise</p>
      </div>

      <div className="category-grid-container">
        {categories.map((cat) => (
          <div
            key={cat.value}
            className="category-card-premium"
            // FIX: Navigate to /jobs with query parameter
            onClick={() => navigate(`/jobs?category=${cat.value}`)}
          >
            <div className="cat-icon-wrapper">{cat.icon}</div>
            <div className="cat-info">
              <h4>{cat.name}</h4>
              <span>{cat.count} Openings</span>
            </div>
            <div className="cat-arrow">→</div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default CategoryGrid;