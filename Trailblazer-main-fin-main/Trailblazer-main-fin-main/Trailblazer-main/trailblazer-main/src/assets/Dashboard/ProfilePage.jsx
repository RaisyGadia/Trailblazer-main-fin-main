import React, { useState, useEffect } from "react";
import { PencilIcon } from "@heroicons/react/24/solid";
import "./ProfilePage.css";
import Sidebar from "../../components/Sidebar/Sidebar";
import AppHeader from "../../components/AppHeader/AppHeader";
import Profile from "../pages/profile.png";
import { useNavigate } from "react-router-dom";

import { getAuth } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

export default function ProfilePage() {
  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    countryCode: "+63",
    phoneNumber: "",
    location: "",
  });

  const [currentDate, setCurrentDate] = useState("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const savedCollapsedState = localStorage.getItem("sidebarCollapsed");
    return savedCollapsedState ? JSON.parse(savedCollapsedState) : false;
  });

  const navigate = useNavigate();

  useEffect(() => {
    const today = new Date();
    const options = { year: "numeric", month: "long", day: "numeric" };
    setCurrentDate(today.toLocaleDateString("en-US", options));

    const fetchUserData = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;

        if (user) {
          const uid = user.uid;
          const docRef = doc(db, "users", uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const data = docSnap.data();
            setUserData((prev) => ({
              ...prev,
              firstName: data.firstName || "",
              lastName: data.lastName || "",
              email: data.email || "",
            }));
          } else {
            console.warn("User document does not exist.");
          }
        } else {
          console.warn("No authenticated user found.");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  const handleSidebarCollapse = (collapsed) => {
    setSidebarCollapsed(collapsed);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Profile updated locally. Add Firestore update if required.");
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log("Selected profile image:", file);
    }
  };

  const handleProfileLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="profile-container">
      <Sidebar onCollapseChange={handleSidebarCollapse} />
      <div className={`main-content-wrapper ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}>
        <div className={`page-header ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}>
          <div className="page-header-title">
            <h2 className="Pp-title">User Profile</h2>
            <p className="date">{currentDate}</p>
          </div>
          <AppHeader
            user={userData}
            profilePic={Profile}
            handleLogout={handleProfileLogout}
            sidebarCollapsed={sidebarCollapsed}
          />
        </div>

        <main className="main-content">
          <section className="content-wrapper">
            <div className="profile-card">
              <header className="profile-header">
                <div className="avatar-container">
                  <div className="avatar">
                    <img src={Profile} alt="Profile" className="avatar-img" />
                  </div>
                  <input
                    type="file"
                    id="upload-profile"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={handleImageChange}
                  />
                </div>
                <div className="user-info">
                  <h2>
                    {userData.firstName} {userData.lastName}
                  </h2>
                  <p className="username">
                    @{userData.firstName.toLowerCase()}_{userData.lastName.toLowerCase()}
                  </p>
                  <p className="gender">Female</p>
                </div>
              </header>

              <form onSubmit={handleSubmit} className="profile-form">
                <div className="form-grid">
                  <div>
                    <label htmlFor="firstName">First Name</label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={userData.firstName}
                      onChange={handleChange}
                      disabled
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName">Last Name</label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={userData.lastName}
                      onChange={handleChange}
                      disabled
                    />
                  </div>
                  <div>
                    <label htmlFor="email">Email Address</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={userData.email}
                      onChange={handleChange}
                      disabled
                    />
                  </div>
                  <div>
                    <label htmlFor="phone">Phone Number</label>
                    <div className="phone-input">
                      <input
                        type="text"
                        name="countryCode"
                        value={userData.countryCode}
                        onChange={handleChange}
                        className="country-code"
                        disabled
                      />
                      <input
                        type="text"
                        name="phoneNumber"
                        value={userData.phoneNumber}
                        onChange={handleChange}
                        className="phone-number"
                      />
                    </div>
                  </div>
                  <div className="loc">
                    <label htmlFor="location">Location</label>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      value={userData.location}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button type="submit">Save Changes</button>
                </div>
              </form>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
