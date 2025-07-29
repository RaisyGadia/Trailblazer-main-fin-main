import React, { useState, useEffect } from "react";
import "./Services.css";
import printing from "./printing-icon.png";
import layout from "./layouting.png";
import { useNavigate } from "react-router-dom";
import { orderManager } from "../../utils/dataManager";

function Services() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check login status when component mounts
  useEffect(() => {
    const checkLoginStatus = () => {
      const loggedIn = localStorage.getItem("loggedIn") === "true";
      setIsLoggedIn(loggedIn);
    };

    checkLoginStatus();

    // Listen for storage changes
    window.addEventListener("storage", checkLoginStatus);
    window.addEventListener("storageUpdated", checkLoginStatus);

    return () => {
      window.removeEventListener("storage", checkLoginStatus);
      window.removeEventListener("storageUpdated", checkLoginStatus);
    };
  }, []);

  const handleRedirect = (path) => {
    if (isLoggedIn) {
      // Clear order queue when starting a new service
      orderManager.clearOrderQueue();
      navigate(path);
    } else {
      navigate("/Signup");
    }
  };

  return (
    <section className="services" id="service">
      <div className="content">
        <h1>OUR SERVICES</h1>
      </div>
      <div className="services-container">
        <div
          className="printing-container"
          onClick={() => handleRedirect("/upload")}
        >
          <div className="printer">
            <img src={printing} alt="Printer icon" />
            <h2 className="printing">Printing</h2>
            <div className="subtext1">
              High-quality prints <br />
              Document printing <br />
              Color and black & white printing <br />
            </div>
          </div>
        </div>
        <div
          className="layout-container"
          onClick={() => handleRedirect("/layout")}
        >
          <div className="layouting">
            <img src={layout} alt="Layout icon" />
            <h2 className="layout">Layout</h2>
            <div className="subtext2">
              Custom layout design <br />
              Minimalist or modern styles <br />
              Ready-to-print layout files <br />
            </div>
          </div>
        </div>
      </div>

      <div className="Rhombus-shapes">
        <div className="rhombus1"></div>
        <div className="rhombus2"></div>
      </div>
    </section>
  );
}
export default Services;
