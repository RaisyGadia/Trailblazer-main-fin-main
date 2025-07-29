import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logoImage from "../pages/logo.png";
import "./forgot-password.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock } from "@fortawesome/free-solid-svg-icons";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [showMessage, setShowMessage] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      setShowMessage(true); // Show "code sent" message

      setTimeout(() => {
        navigate("/verify-email", { state: { email } });
      }, 1500); // Delay before navigation
    }
  };

  return (
    <div className="fp-container">
      <div className="fp-logo-container">
        <img
          src={logoImage}
          alt="Trailblazer Printing Logo"
          className="fp-logo-img"
        />
        <h1 className="fp-brand-text">
          TRAILBLAZER
          <br />
          <span className="fp-sub-text">PRINTING & LAYOUT SERVICES</span>
        </h1>
      </div>

      <div className="fp-card">
        <h2 className="fp-card-title">FORGOT PASSWORD</h2>

        <div className="fp-lock-icon">
          <div className="fp-icon">
            <FontAwesomeIcon icon={faLock} />
            <span className="fp-question-mark">?</span>
          </div>
        </div>

        <p className="fp-description">
          Please enter your email address to receive a verification code.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="fp-input-group">
            <label htmlFor="email" className="fp-input-label">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="fp-input-field"
              required
            />
          </div>
          {showMessage && (
            <p className="fp-confirmation-message">Verification code sent!</p>
          )}
          <div className="fp-submit-btn-container">
            <button type="submit" className="fp-submit-btn">
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
