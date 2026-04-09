import React from "react";
import "./Styles/footer.css";

const Footer = () => (
  <footer className="footer">
    <div className="footer-content">
      <p>© 2026 JobPortal. All rights reserved.</p>
      <div className="footer-links">
        <a href="/about">About</a>
        <a href="/contact">Contact</a>
        <a href="/privacy">Privacy Policy</a>
        <a href="/terms">Terms & Conditions</a>
      </div>
    </div>
  </footer>
);

export default Footer;
