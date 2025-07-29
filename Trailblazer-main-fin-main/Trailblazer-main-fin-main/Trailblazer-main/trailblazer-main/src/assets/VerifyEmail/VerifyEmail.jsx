import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import logoImage from "../pages/logo.png";
import "./VerifyEmail.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelopeOpenText,
  faLockOpen,
  faCircleCheck,
} from "@fortawesome/free-solid-svg-icons";

export default function VerifyEmail() {
  const location = useLocation();
  const email = location.state?.email || "your email";
  const [code, setCode] = useState(["", "", "", ""]);
  const [seconds, setSeconds] = useState(60);
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPasswordUpdated, setIsPasswordUpdated] = useState(false);

  useEffect(() => {
    if (seconds === 0) {
      setIsResendDisabled(false);
      return;
    }

    const interval = setInterval(() => {
      setSeconds((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [seconds]);

  const handleCodeChange = (value, index) => {
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
  };

  const handleResendCode = (e) => {
    e.preventDefault();
    alert(`Resending code to ${email}`);
    setSeconds(60);
    setIsResendDisabled(true);
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const handleVerify = () => {
    setIsVerified(true); // Simulate verification
  };

  const handleSavePassword = () => {
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      alert("Password must be at least 8 characters.");
      return;
    }

    // Optionally add strength validation with RegEx here

    setIsPasswordUpdated(true); // Show updated confirmation
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
          TRAILBLAZER <br />
          <span className="fp-sub-text">PRINTING & LAYOUT SERVICES</span>
        </h1>
      </div>

      <div className="fp-card">
        <div className="fp-content-wrapper">
          {!isVerified ? (
            <>
              <h2 className="fp-card-title">VERIFY YOUR EMAIL</h2>
              <div className="fp-lock-icon">
                <div className="fp-icon">
                  <FontAwesomeIcon icon={faEnvelopeOpenText} />
                </div>
              </div>

              <p className="fp-description">
                Enter the code we've sent to <strong>{email}</strong>
              </p>

              <div className="fp-code-inputs">
                {code.map((digit, index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleCodeChange(e.target.value, index)}
                    className="fp-code-input"
                  />
                ))}
              </div>

              <div className="fp-timer">
                {isResendDisabled ? (
                  <p>Resend code in {formatTime(seconds)}</p>
                ) : (
                  <p></p>
                )}
              </div>

              {seconds === 0 && (
                <p className="fp-resend">
                  Didn't receive the code?{" "}
                  <a
                    href="#"
                    onClick={handleResendCode}
                    className="fp-resend-link"
                    disabled={isResendDisabled}
                  >
                    Resend code
                  </a>
                </p>
              )}

              <div className="fp-submit-btn-container">
                <button className="fp-submit-btn" onClick={handleVerify}>
                  Verify
                </button>
              </div>
            </>
          ) : !isPasswordUpdated ? (
            <>
              <div className="fp-password-container">
                <h2 className="fp-card-title">CREATE NEW PASSWORD</h2>
                <div className="fp-lock-icon">
                  <div className="fp-icon">
                    <FontAwesomeIcon icon={faLockOpen} />
                  </div>
                </div>

                <p className="fp-description">
                  Your new password must be different from your previous
                  password.
                </p>

                <input
                  type="password"
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="fp-password-input"
                />
                <input
                  type="password"
                  placeholder="Confirm New Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="fp-password-input"
                />
                <small className="fp-password-note">
                  Password must be 8+ characters: contains uppercase, lowercase,
                  number
                </small>

                <div className="fp-submit-btn-container">
                  <button
                    className="fp-submit-btn"
                    onClick={handleSavePassword}
                  >
                    Save
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="updated-password-container">
                <h2 className="fp-card-title">PASSWORD UPDATED</h2>
                <div className="fp-lock-icon">
                  <FontAwesomeIcon
                    icon={faCircleCheck}
                    className="check-icon"
                  />
                </div>
                <p className="fp-description">
                  Your password has been updated.
                </p>
                <div className="fp-submit-btn-container">
                  <button
                    className="fp-login-btn"
                    onClick={() => (window.location.href = "/login")}
                  >
                    Login
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
