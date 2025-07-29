import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Hero.css";
import image from "./printer.png";
import { orderManager } from "../../utils/dataManager";

function Hero() {
  const [showModal, setShowModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  // Check login status when component mounts
  useEffect(() => {
    const checkLoginStatus = () => {
      const loggedIn = localStorage.getItem("loggedIn") === "true";
      setIsLoggedIn(loggedIn);
    };

    checkLoginStatus();

    // Listen for storage changes (in case user logs in/out in another tab)
    window.addEventListener("storage", checkLoginStatus);
    window.addEventListener("storageUpdated", checkLoginStatus);

    return () => {
      window.removeEventListener("storage", checkLoginStatus);
      window.removeEventListener("storageUpdated", checkLoginStatus);
    };
  }, []);

  const handleUploadClick = () => {
    if (isLoggedIn) {
      setShowModal(true);
    } else {
      navigate("/Signup");
    }
  };

  const handleServiceClick = (service) => {
    // Clear order queue when starting a new service
    orderManager.clearOrderQueue();
    navigate(`/upload/${service}`);
    setShowModal(false);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <>
      <section className="hero">
        <div className="content-hero">
          <div className="line1">
            <div>
              <span className="hero1">ONLY IN</span>
              <span className="hero2"> UTSP</span>
            </div>
            <div className="line2">
              <span className="hero3">CDO</span>
              <span className="hero4"> CAMPUS!</span>
            </div>
          </div>

          <div className="line3">
            <span className="hero5">We produce High-Quality For Printing</span>
            <div className="line4">
              <span className="hero6">And Layout Services.</span>
            </div>
          </div>

          {/* Upload Button */}
          <div className="btn-container">
            <button className="upload-btn" onClick={handleUploadClick}>
              UPLOAD NOW!
            </button>
          </div>
        </div>

        <div className="image-landing">
          <img src={image} alt="Printer image with circles" />
        </div>
      </section>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <button className="close-btn" onClick={closeModal}>
              ×
            </button>
            <h3>CHOOSE A SERVICE</h3>
            <div className="service-buttons">
              <button
                className="service-btn"
                onClick={() => handleServiceClick("print")}
              >
                PRINT
              </button>
              <button
                className="service-btn"
                onClick={() => navigate("/layout")}
              >
                LAYOUT
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Hero;
