import React from "react";
import "./Footer.css";
import { useNavigate } from "react-router-dom";
import footerLogo from "./logo.png";

function Footer() {
  const navigate = useNavigate();

  return (
    <footer className="footer">
      <div className="footer-brand-container">
        <div className="footer-logo">
          <img src={footerLogo} alt="Logo for footer" />
        </div>
        <div className="footer-text">
          <h1 className="footer-title">TRAILBLAZER</h1>
          <span className="footer-subtext">PRINTING & LAYOUT SERVICES</span>
        </div>
      </div>
      <div className="footer-headings">
        <div className="address">
          <h2>Address:</h2>
          <p>
            USTP- CDO Campus: <br />
            Claro M. Recto Avenue <br />
            Lapasan, Cagayan de
            <br />
            Oro City 9000
          </p>
        </div>
        <div className="contact">
          <h2>Contact Us:</h2>
          <p>+(63)9483757069</p>
        </div>
        <div className="hours">
          <h2>Hours:</h2>
          <p>
            Monday-Friday
            <br />
            9:00 AM - 7:30 PM
          </p>
        </div>
        <div className="terms-and-privacy">
          <h2 className="footer-terms">
            <a href="/terms" target="_blank" rel="noopener noreferrer">
              Terms & Conditions
            </a>
          </h2>
          <h2 className="footer-privacy">
            <a href="/privacy" target="_blank" rel="noopener noreferrer">
              Privacy Policy
            </a>
          </h2>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
