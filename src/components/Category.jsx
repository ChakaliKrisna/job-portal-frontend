import React from "react";
import { useNavigate } from "react-router-dom";
import { 
  FaLaptopCode, FaBullhorn, FaPalette, 
  FaChartLine, FaUsers, FaHandshake 
} from "react-icons/fa";
import "./Styles/categorygrid.css";

const categories = [
  { name: "IT & Software", slug: "it", icon: <FaLaptopCode />, count: "450+" },
  { name: "Marketing", slug: "marketing", icon: <FaBullhorn />, count: "120+" },
  { name: "UI/UX Design", slug: "design", icon: <FaPalette />, count: "85+" },
  { name: "Finance", slug: "finance", icon: <FaChartLine />, count: "210+" },
  { name: "Human Resource", slug: "hr", icon: <FaUsers />, count: "45+" },
  { name: "Sales", slug: "sales", icon: <FaHandshake />, count: "150+" },
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
            key={cat.slug}
            className="category-card-premium"
            onClick={() => navigate(`/category/${cat.slug}`)}
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