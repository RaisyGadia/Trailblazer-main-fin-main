import React, { useState, useEffect } from "react";
import { PencilIcon } from "@heroicons/react/24/solid";
import "./AdminProfile.css";
import Profile from "../pages/profile.png"; // Using the same profile image
import { useNavigate } from "react-router-dom";

// Common country codes for dropdown
const COUNTRY_CODES = [
  { code: "+63", country: "PH", name: "Philippines" },
  { code: "+1", country: "US", name: "United States" },
  { code: "+44", country: "GB", name: "United Kingdom" },
  { code: "+86", country: "CN", name: "China" },
  { code: "+81", country: "JP", name: "Japan" },
  { code: "+82", country: "KR", name: "South Korea" },
  { code: "+65", country: "SG", name: "Singapore" },
  { code: "+60", country: "MY", name: "Malaysia" },
  { code: "+66", country: "TH", name: "Thailand" },
  { code: "+84", country: "VN", name: "Vietnam" },
];

export default function AdminProfile() {
  const [adminData, setAdminData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    countryCode: "+63",
    phoneNumber: "",
    location: "",
  });

  const [isFirstTimeSetup, setIsFirstTimeSetup] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
  const currentAdminEmail = localStorage.getItem("currentAdminEmail");
  const storedAdmin = JSON.parse(localStorage.getItem("admin"));

  const isFirstTime =
    !storedAdmin ||
    !storedAdmin.firstName ||
    !storedAdmin.lastName ||
    !storedAdmin.email ||
    (currentAdminEmail && storedAdmin.email !== currentAdminEmail);

  setIsFirstTimeSetup(isFirstTime);

  if (storedAdmin && !isFirstTime) {
    setAdminData({
      firstName: storedAdmin.firstName || "",
      lastName: storedAdmin.lastName || "",
      email: storedAdmin.email || currentAdminEmail || "",
      countryCode: storedAdmin.countryCode || "+63",
      phoneNumber: storedAdmin.phoneNumber || "",
      location: storedAdmin.location || "",
    });
  } else {
    setAdminData((prev) => ({
      ...prev,
      firstName: "Trailblazers",
      lastName: "Print & Layout",
      email: currentAdminEmail || "",
    }));
  }
}, []);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setAdminData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!adminData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!adminData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (!adminData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(adminData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveAdminToRegistry = (adminData) => {
    // Get existing admin registry or create new one
    const adminRegistry =
      JSON.parse(localStorage.getItem("adminRegistry")) || [];

    // Check if admin already exists (by email)
    const existingAdminIndex = adminRegistry.findIndex(
      (admin) => admin.email === adminData.email
    );

    if (existingAdminIndex !== -1) {
      // Update existing admin
      adminRegistry[existingAdminIndex] = {
        ...adminData,
        lastUpdated: new Date().toISOString(),
      };
    } else {
      // Add new admin to registry
      adminRegistry.push({
        ...adminData,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
      });
    }

    // Save updated registry back to localStorage
    localStorage.setItem("adminRegistry", JSON.stringify(adminRegistry));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Save admin to registry (list of all created admins)
    saveAdminToRegistry(adminData);

    // Update current admin data in localStorage
    localStorage.setItem("admin", JSON.stringify(adminData));

    const successMessage = isFirstTimeSetup
      ? "Profile setup completed successfully!"
      : "Profile updated successfully!";

    alert(successMessage);

    // Redirect to dashboard after successful save
    navigate("/admindashboard");
  };

  const handleEditClick = () => {
    document.getElementById("upload-admin-profile").click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log("Selected admin profile image:", file);
      // Here you would typically upload the image to a server
      // For now, just log it
    }
  };

  return (
    <div className="admin-profile-content-wrapper">
      <h2 className="ad-title">
        {isFirstTimeSetup ? "Setup Your Profile" : "Admin Profile"}
      </h2>

      <div className="admin-profile-container">
        <header className="admin-profile-header">
          <div className="admin-avatar-container">
            <div className="admin-avatar">
              <img
                src={Profile}
                alt="Admin Profile"
                className="admin-avatar-img"
              />
            </div>
            <button className="admin-edit-badge" onClick={handleEditClick}>
              <PencilIcon className="admin-edit-icon" />
            </button>
            <input
              type="file"
              id="upload-admin-profile"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleImageChange}
            />
          </div>
          <div className="admin-user-info">
            <h2>
              {adminData.firstName && adminData.lastName
                ? `${adminData.firstName} ${adminData.lastName}`
                : "Admin Profile"}
            </h2>
            <p className="admin-role">Admin</p>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="admin-profile-form">
          <div className="admin-form-grid">
            {/* First Row - First Name and Email Address */}
            <div className="admin-form-row">
              <div className="admin-form-field">
                <label htmlFor="firstName">First Name</label>
                <div className="admin-input-container">
                  <div className="admin-input-wrapper">
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={adminData.firstName}
                      onChange={handleChange}
                      className={errors.firstName ? "error" : ""}
                      required
                    />
                  </div>
                </div>
                {errors.firstName && (
                  <span className="error-message">{errors.firstName}</span>
                )}
              </div>
              <div className="admin-form-field">
                <label htmlFor="email">Email Address</label>
                <div className="admin-input-container">
                  <div className="admin-input-wrapper">
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={adminData.email}
                      onChange={handleChange}
                      className={errors.email ? "error" : ""}
                      required
                    />
                  </div>
                </div>
                {errors.email && (
                  <span className="error-message">{errors.email}</span>
                )}
              </div>
            </div>

            {/* Second Row - Last Name and Phone Number */}
            <div className="admin-form-row">
              <div className="admin-form-field">
                <label htmlFor="lastName">Last Name</label>
                <div className="admin-input-container">
                  <div className="admin-input-wrapper">
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={adminData.lastName}
                      onChange={handleChange}
                      className={errors.lastName ? "error" : ""}
                      required
                    />
                  </div>
                </div>
                {errors.lastName && (
                  <span className="error-message">{errors.lastName}</span>
                )}
              </div>
              <div className="admin-form-field">
                <label htmlFor="phone">Phone Number</label>
                <div className="admin-input-container">
                  <div className="admin-input-wrapper">
                    <div className="admin-phone-input">
                      <div className="admin-country-code-wrapper">
                        <select
                          name="countryCode"
                          value={adminData.countryCode}
                          onChange={handleChange}
                          className="admin-country-code"
                        >
                          {COUNTRY_CODES.map((country) => (
                            <option key={country.code} value={country.code}>
                              {country.code}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="admin-phone-number-wrapper">
                        <input
                          type="tel"
                          name="phoneNumber"
                          value={adminData.phoneNumber}
                          onChange={handleChange}
                          className="admin-phone-number"
                          placeholder="Enter your phone number"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Third Row - Location (Left Column Only) */}
            <div className="admin-form-row">
              <div className="admin-form-field">
                <label htmlFor="location">Location</label>
                <div className="admin-input-container">
                  <div className="admin-input-wrapper">
                    <input
                      type="text"
                      id="location"
                      name="location"
                      value={adminData.location}
                      onChange={handleChange}
                      placeholder="Enter your location"
                    />
                  </div>
                </div>
              </div>
              <div className="admin-form-field">
                {/* Empty field to maintain grid structure */}
              </div>
            </div>
          </div>

          <div className="admin-form-actions">
            <button type="submit">
              {isFirstTimeSetup ? "Complete Setup" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
