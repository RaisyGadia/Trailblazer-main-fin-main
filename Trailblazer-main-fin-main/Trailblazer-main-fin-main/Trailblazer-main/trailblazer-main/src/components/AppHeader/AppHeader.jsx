import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./AppHeader.css";
import {
  LogOut,
  Phone,
  Info,
  Settings,
  Home,
  User as UserIcon,
  ChevronDown,
  ChevronUp,
} from "lucide-react"; // Added ChevronDown and ChevronUp icons
import defaultProfilePic from "../../assets/pages/profile.png"; // Default profile picture
import { orderManager } from "../../utils/dataManager";

const AppHeader = ({
  user,
  profilePic: propProfilePic,
  handleLogout: propHandleLogout,
  sidebarCollapsed,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);

  const effectiveUserProfilePic = propProfilePic || defaultProfilePic;
  const currentUser = user || JSON.parse(localStorage.getItem("user")); // Ensure user is available

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  const handleLogout = () => {
    if (propHandleLogout) {
      propHandleLogout();
    } else {
      localStorage.clear();
      navigate("/");
    }
    setIsDropdownOpen(false);
  };

  const today = new Date();
  const formattedDate = today.toLocaleDateString("en-US", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const getPageTitle = () => {
    switch (location.pathname) {
      case "/dashboard":
        return "Dashboard";
      case "/orderhistory":
        return "Order History";
      case "/profile":
        return "User Profile";
      // Add other routes here
      default:
        return "Trailblazer"; // Fallback title
    }
  };

  return (
    <header
      className={`app-header ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}
    >
      <div className="app-header-title-section">
        <h2 className="app-header-title">{getPageTitle()}</h2>
        {location.pathname === "/dashboard" && (
          <p className="app-header-date">{formattedDate}</p>
        )}
      </div>

      {currentUser && (
        <div
          className={`app-user-profile-box ${isDropdownOpen ? "active" : ""}`}
          onClick={toggleDropdown}
          ref={dropdownRef} // Attach ref here to handle click outside for the whole box + dropdown
        >
          <img
            src={effectiveUserProfilePic}
            alt="Profile"
            className="app-profile-img-main"
          />
          <div className="app-user-details">
            <div className="app-user-name-header">{currentUser?.firstName}</div>
            <div className="app-user-name-header">{currentUser?.lastName}</div>
          </div>
          <div
            className={`app-dropdown-icon-header ${
              isDropdownOpen ? "rotate" : ""
            }`}
          >
            {isDropdownOpen ? (
              <ChevronUp
                size={16}
                color={isDropdownOpen ? "white" : "#2c2480"}
              />
            ) : (
              <ChevronDown size={16} color="#2c2480" />
            )}
          </div>
          {isDropdownOpen && (
            <div className="app-profile-dropdown">
              <div
                className="app-dropdown-header-section"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <img
                  src={effectiveUserProfilePic}
                  alt="Avatar"
                  className="app-dropdown-avatar-img"
                />
                <div className="app-dropdown-user-details">
                  <div className="app-dropdown-user-name">
                    {currentUser?.firstName} {currentUser?.lastName}
                  </div>
                </div>
              </div>

              <Link
                to="/"
                className="app-dropdown-item"
                onClick={() => {
                  orderManager.clearOrderQueue();
                  setIsDropdownOpen(false);
                }}
              >
                <Home size={20} className="app-dropdown-lucide-icon" />
                Home
              </Link>

              <Link
                to="/#service"
                className="app-dropdown-item"
                onClick={() => {
                  orderManager.clearOrderQueue();
                  navigate("/");
                  setTimeout(() => {
                    const serviceSection = document.getElementById("service");
                    serviceSection?.scrollIntoView({ behavior: "smooth" });
                  }, 0);
                  setIsDropdownOpen(false);
                }}
              >
                <Settings size={20} className="app-dropdown-lucide-icon" />
                Services
              </Link>

              <Link
                to="/contact"
                className="app-dropdown-item"
                onClick={() => setIsDropdownOpen(false)}
              >
                <Phone size={20} className="app-dropdown-lucide-icon" />
                Contact Us
              </Link>

              <Link
                to="/aboutus"
                className="app-dropdown-item"
                onClick={() => setIsDropdownOpen(false)}
              >
                <Info size={20} className="app-dropdown-lucide-icon" />
                About Us
              </Link>

              <div className="app-dropdown-item" onClick={handleLogout}>
                <LogOut size={20} className="app-dropdown-lucide-icon" />
                Log Out
              </div>

              <div className="app-dropdown-footer">
                <Link
                  className="app-footer-link"
                  to="/terms"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsDropdownOpen(false);
                  }}
                >
                  Terms & Conditions
                </Link>
                <Link
                  className="app-footer-link"
                  to="/privacy"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsDropdownOpen(false);
                  }}
                >
                  Privacy Policy
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default AppHeader;
