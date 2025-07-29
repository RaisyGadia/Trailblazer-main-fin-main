import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Sidebar.css"; // Import the new sidebar CSS
import { User, Clock, LayoutGrid, PanelLeftDashed } from "lucide-react";
import logoImage from "../../assets/pages/logo.png"; // Corrected path to logo

// Define the navigation items
const navItems = [
  {
    to: "/dashboard",
    icon: LayoutGrid,
    label: "Dashboard",
    pageName: "dashboard",
  },
  {
    to: "/profile",
    icon: User,
    label: "Profile",
    pageName: "profile",
  },
  {
    to: "/orderhistory",
    icon: Clock,
    label: "Order History",
    pageName: "orderhistory",
  },
];

export default function Sidebar({ onCollapseChange }) {
  const location = useLocation(); // Get current location
  const currentPath = location.pathname;

  // Initialize collapsed state from localStorage, default to false if not found
  const [collapsed, setCollapsed] = useState(() => {
    const savedCollapsedState = localStorage.getItem("sidebarCollapsed");
    return savedCollapsedState ? JSON.parse(savedCollapsedState) : false;
  });

  const toggleCollapse = () => {
    const newCollapsedState = !collapsed;
    setCollapsed(newCollapsedState);
    // Persist the new state to localStorage
    localStorage.setItem("sidebarCollapsed", JSON.stringify(newCollapsedState));
  };

  useEffect(() => {
    if (onCollapseChange) {
      onCollapseChange(collapsed);
    }
  }, [collapsed, onCollapseChange]);

  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="logo-section-sidebar">
        {!collapsed && (
          <div className="S-sidebar-brand">
            <img
              src={logoImage}
              alt="Trailblazer Printing Logo"
              className="brand-logo"
            />
            <div className="brand-info">
              <h1 className="brand-title">TRAILBLAZER</h1>
              <span className="brand-subtitle">PRINTING & LAYOUT SERVICES</span>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="S-sidebar-brand-collapsed">
            <img
              src={logoImage}
              alt="Trailblazer Printing Logo"
              className="brand-logo-collapsed"
            />
          </div>
        )}
      </div>

      <nav className="S-sidebar-nav">
        <ul>
          {navItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <li
                key={item.pageName}
                className={currentPath === item.to ? "active" : ""}
              >
                <Link to={item.to}>
                  <IconComponent className="icon" />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <button className="collapse-btn" onClick={toggleCollapse}>
          <PanelLeftDashed size={24} color="white" />
        </button>
      </div>
    </aside>
  );
}
