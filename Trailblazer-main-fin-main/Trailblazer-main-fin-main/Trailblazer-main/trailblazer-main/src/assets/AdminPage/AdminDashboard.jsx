import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom"; // Added useLocation
import {
  User,
  LogOut,
  LayoutDashboard,
  History,
  Search,
  Mail,
  ShoppingBag,
  Clock,
  Truck,
  BarChartBig,
  Menu,
  Circle, // For status dot
} from "lucide-react";
import {
  setDoc,
  deleteDoc
} from "firebase/firestore";
import "./AdminDashboard.css";
import AdminSalesComponent from "./AdminSales"; // Import the separate AdminSales component
import { AdminOrderHistoryContent } from "./AdminOrderHistory"; // Import the order history content component
import AdminProfile from "./AdminProfile"; // Import the AdminProfile component
import OrderDetailView from "./OrderDetailView"; // Import the OrderDetailView component
import logoImage from "../pages/logo.png"; // Ensure these paths are correct
import profilePic from "../pages/profile.png";
import { db } from "../../assets/firebase"; // adjust path if needed
import { getFirestore, collection, getDocs, doc, onSnapshot } from "firebase/firestore";
import { getDoc } from "firebase/firestore";

import {
  orderManager,
  ORDER_STATUS,
  formatPrice,
  formatDate,
} from "../../utils/dataManager";

const AdminDashboard = () => {
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [selectedActionOrderIndex, setSelectedActionOrderIndex] =
    useState(null);
  const [actionDropdownPosition, setActionDropdownPosition] = useState({
    top: 0,
    left: 0,
  });
  const [selectedChatUser, setSelectedChatUser] = useState(null);
  const [viewingOrder, setViewingOrder] = useState(null);
  const actionDropdownRefs = useRef([]);
  const navigate = useNavigate();
  const location = useLocation(); // Get current location

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [adminName, setAdminName] = useState("Jane Doe");

  const toggleUserDropdown = () => setIsUserDropdownOpen((prev) => !prev);
  const toggleMobileSidebar = () => setIsMobileSidebarOpen((prev) => !prev);

  const toggleActionDropdown = (event, index) => {
    const button = actionDropdownRefs.current[index];
    if (!button) return;
    const rect = button.getBoundingClientRect();
    setActionDropdownPosition({
      top: rect.bottom + window.scrollY + 5,
      // Adjust left based on dropdown width, could be more dynamic
      left: rect.left + window.scrollX - (150 - rect.width / 2),
    });
    setSelectedActionOrderIndex((prevIndex) =>
      prevIndex === index ? null : index
    );
  };

  const handleClickOutside = (event) => {
    // Close user dropdown
    if (!event.target.closest(".ad-user-profile")) {
      setIsUserDropdownOpen(false);
    }
    // Close action dropdown
    if (
      !event.target.closest(".ad-floating-action-dropdown") &&
      !event.target.closest(".ad-dropdown")
    ) {
      setSelectedActionOrderIndex(null);
    }
    // Close mobile sidebar if clicking outside on larger screens (optional behavior)
    // if (isMobileSidebarOpen && window.innerWidth > 768 && !event.target.closest('.ad-sidebar')) {
    //   setIsMobileSidebarOpen(false);
    // }
  };

  const handleOrderAction = async (actionType) => {
  const selectedOrder = orders[selectedActionOrderIndex];
  if (!selectedOrder) return;

  const { uid, type, id } = selectedOrder;
  const currentOrderRef = doc(db, "admin_live_orders", uid, type, id);
  const targetCollection = actionType === "Cancelled" ? "cancelled_orders" : "completed_orders";
  const targetOrderRef = doc(db, targetCollection, uid, type, id);

  try {
    const snapshot = await getDoc(currentOrderRef);
    if (!snapshot.exists()) return;

    const data = snapshot.data();
    data.Status = actionType; // Update status
    await setDoc(targetOrderRef, data); // Move to completed/cancelled
    await deleteDoc(currentOrderRef);   // Remove from admin_live_orders

    // Update UI
    setOrders((prevOrders) =>
      prevOrders.map((order, index) =>
        index === selectedActionOrderIndex
          ? { ...order, status: actionType, isLocked: true }
          : order
      )
    );
    setSelectedActionOrderIndex(null);
  } catch (error) {
    console.error(`Failed to ${actionType.toLowerCase()} order:`, error);
  }
};

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleProfileClick = () => navigate("/admin-profile");
  const handleLogOut = () => navigate("/");
  const handleNavClick = (path) => {
    // Clear the viewing order when navigating to a different page
    setViewingOrder(null);
    navigate(path);
    if (isMobileSidebarOpen) {
      setIsMobileSidebarOpen(false); // Close mobile sidebar on nav
    }
  };

  const handleViewOrder = (order) => {
    setViewingOrder(order);
    setSelectedActionOrderIndex(null); // Close dropdown
  };

  const handleBackToOrders = () => {
    setViewingOrder(null);
    // Navigation will be handled by the current page state automatically
  };

  // Function to refresh admin name from localStorage
  const refreshAdminName = () => {
    // First check email consistency
    const emailConsistent = checkEmailConsistency();
    if (!emailConsistent) {
      setAdminName("Jane Doe");
      return;
    }

    const storedAdmin = JSON.parse(localStorage.getItem("admin"));
    if (storedAdmin && storedAdmin.firstName && storedAdmin.lastName) {
      setAdminName(`${storedAdmin.firstName} ${storedAdmin.lastName}`);
    } else {
      setAdminName("Jane Doe");
    }
  };

  // Function to check if current admin email matches stored profile
  const checkEmailConsistency = () => {
    const currentAdminEmail = localStorage.getItem("currentAdminEmail");
    const storedAdmin = JSON.parse(localStorage.getItem("admin"));

    // If there's a current admin email and stored admin data
    if (currentAdminEmail && storedAdmin && storedAdmin.email) {
      // If emails don't match, it means a different admin logged in
      if (currentAdminEmail !== storedAdmin.email) {
        // Load the correct admin profile from registry
        const adminRegistry =
          JSON.parse(localStorage.getItem("adminRegistry")) || [];
        const correctAdmin = adminRegistry.find(
          (admin) => admin.email === currentAdminEmail
        );

        if (correctAdmin) {
          // Load correct admin profile
          localStorage.setItem("admin", JSON.stringify(correctAdmin));
          setAdminName(`${correctAdmin.firstName} ${correctAdmin.lastName}`);
        } else {
          // Admin not found in registry, reset to default
          localStorage.removeItem("admin");
          setAdminName("Jane Doe");
          return false; // Profile needs to be set up
        }
      }
    }
    return true; // Emails match or no conflict
  };

  // Function to check if admin profile is complete
  const checkProfileCompletion = () => {
    // First check email consistency
    const emailConsistent = checkEmailConsistency();
    if (!emailConsistent) {
      // Email mismatch detected, redirect to profile setup
      navigate("/admin-profile");
      return false;
    }

    const storedAdmin = JSON.parse(localStorage.getItem("admin"));

    // Check if required fields are present and not empty
    if (
      !storedAdmin ||
      !storedAdmin.firstName ||
      !storedAdmin.lastName ||
      !storedAdmin.email ||
      storedAdmin.firstName.trim() === "" ||
      storedAdmin.lastName.trim() === "" ||
      storedAdmin.email.trim() === ""
    ) {
      // Profile is incomplete, redirect to profile page
      navigate("/admin-profile");
      return false;
    }
    return true;
  };

  // Get real orders from data manager
  const [orders, setOrders] = useState([]);
  const [orderStats, setOrderStats] = useState({});

useEffect(() => {
  const db = getFirestore();
  const fetchAllOrders = async () => {
    try {
      const adminOrdersRef = collection(db, "admin_live_orders");
      const adminDocsSnap = await getDocs(adminOrdersRef);

      let allFetchedOrders = [];

      for (const adminDoc of adminDocsSnap.docs) {
        const uid = adminDoc.id;

        const orderTypes = ["PRINT", "LAYOUT"];
        for (const type of orderTypes) {
          const subColRef = collection(db, "admin_live_orders", uid, type);
          const subColSnap = await getDocs(subColRef);

          for (const orderDoc of subColSnap.docs) {
            const data = orderDoc.data();
            const createdAt = new Date(data.createdAt?.toDate?.() || Date.now());

            allFetchedOrders.push({
  id: orderDoc.id,
  name: data.fileName || "Untitled",
  type: type,
  payment: data["Payment Method"] || "Unknown",
  status: data.Status || "Pending",
  total: `₱${Number(data["Total Amount"] || 0).toFixed(2)}`,
  orderDate: createdAt.toISOString(),
  files: [data.fileName || "Untitled"],
  uid,
  isLocked: ["Cancelled", "Completed"].includes(data.Status),
});
          }
        }
      }

      console.log("📦 All admin orders:", allFetchedOrders);
      setOrders(allFetchedOrders);
    } catch (error) {
      console.error("Error fetching all orders:", error);
    }
  };

  fetchAllOrders();
  refreshAdminName(); 


}, []);

  useEffect(() => {
    refreshAdminName();
  }, [location.pathname]);

  const getDisplayStatus = (status) => {
    switch (status) {
      case ORDER_STATUS.RECEIVED:
        return "Order Received";
      case ORDER_STATUS.PROCESSING:
        return "Processing";
      case ORDER_STATUS.ON_THE_WAY:
        return "On The Way";
      case ORDER_STATUS.READY_FOR_PICKUP:
        return "Ready";
      case ORDER_STATUS.DELIVERED:
        return "Delivered";
      case ORDER_STATUS.CANCELLED:
        return "Cancelled";
      default:
        return "Pending";
    }
  };

  const handleStatusUpdate = (orderId, newStatus) => {
    const success = orderManager.updateOrderStatus(orderId, newStatus);
    if (success) {

      const transformedOrders = allOrders.map((order) => ({
        id: order.id,
        name: order.customerName,
        type: order.deliveryMethod === "deliver" ? "Delivery" : "Pick-up",
        payment:
          order.paymentMethod === "Cash on Delivery"
            ? "COD"
            : `Paid(${order.paymentMethod})`,
        status: getDisplayStatus(order.status),
        total: formatPrice(order.totalAmount),
        orderDate: order.orderDate,
        files: order.files,
      }));
      setOrders(transformedOrders);
    }
  };

  // Real chat message data - empty by default, will be populated from a real messaging system
  const chatUsers = [];

  // Calculate dynamic summary data based on real orders
  const getSummaryCardsData = () => {
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(
      (order) => order.status !== "Delivered" && order.status !== "Cancelled"
    ).length;

    // Count orders delivered today
    const today = new Date().toDateString();
    const completedToday = orders.filter((order) => {
      const orderDate = new Date(order.orderDate);
      return order.status === "Completed"
 && orderDate.toDateString() === today;
    }).length;

    return {
      liveOrders: [
        {
          title: totalOrders.toString(),
          subtitle: "Total Orders",
          icon: ShoppingBag,
        },
        { title: pendingOrders.toString(), subtitle: "Pending", icon: Clock },
        {
          title: completedToday.toString(),
          subtitle: "Completed Today",
          icon: Truck,
        },
      ],
      // Define more for other pages if needed
    };
  };

  const navItems = [
    { title: "Live Orders", icon: LayoutDashboard, path: "/admindashboard" },
    { title: "Order History", icon: History, path: "/admin-orderhistory" },
    { title: "Sales", icon: BarChartBig, path: "/admin-sales" },
  ];

  const renderOrderStatus = (status) => {
    let statusClass = "";
    let statusIcon = null;
    let backgroundColor = "";
    let textColor = "";

    switch (status.toLowerCase().replace(/\s+/g, "")) {
      case "completed":
  statusClass = "completed";
  statusIcon = <Circle size={8} className="ad-status-icon" />;
  backgroundColor = "#e8f5e8";
  textColor = "#2d5a2d";
  break;
      case "ontheway":
        statusClass = "ontheway";
        statusIcon = <Truck size={12} className="ad-status-icon" />;
        backgroundColor = "#fff3cd";
        textColor = "#856404";
        break;
      case "ready":
      case "readyforpickup":
        statusClass = "ready";
        statusIcon = <Clock size={12} className="ad-status-icon" />;
        backgroundColor = "#d1ecf1";
        textColor = "#0c5460";
        break;
      case "processing":
        statusClass = "processing";
        statusIcon = <Circle size={8} className="ad-status-icon spinning" />;
        backgroundColor = "#e2e3ff";
        textColor = "#383d9a";
        break;
      case "orderreceived":
        statusClass = "received";
        statusIcon = <ShoppingBag size={12} className="ad-status-icon" />;
        backgroundColor = "#f8f9fa";
        textColor = "#495057";
        break;
      case "cancelled":
        statusClass = "cancelled";
        statusIcon = <Circle size={8} className="ad-status-icon" />;
        backgroundColor = "#f8d7da";
        textColor = "#721c24";
        break;
      default:
        statusClass = "default";
        statusIcon = <Circle size={8} className="ad-status-icon" />;
        backgroundColor = "#f8f9fa";
        textColor = "#495057";
    }

    return (
      <span
        className={`ad-status ${statusClass}`}
        style={{
          backgroundColor: backgroundColor,
          color: textColor,
          padding: "6px 12px",
          borderRadius: "20px",
          fontSize: "12px",
          fontWeight: "500",
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          border: `1px solid ${textColor}20`,
          whiteSpace: "nowrap",
        }}
      >
        {statusIcon}
        {status}
      </span>
    );
  };
const OrdersTable = ({ orderData, showActions = true }) => (
  <div className="ad-orders-table-container">
    <div className="ad-orders-table">
      <table>
        <thead>
          <tr>
            <th>Order Id</th>
            <th>File Name</th>
            <th>Type</th>
            <th>Payment</th>
            <th>Status</th>
            <th>Total</th>
            {showActions && <th>Action</th>}
          </tr>
        </thead>
        <tbody>
          {(orderData || orders).map((order, index) => (
            <tr
              key={order.id + index}
              className={index % 2 === 1 ? "alt-row" : ""}
            >
              <td>{order.id}</td>
              <td>{order.name}</td>
              <td>{order.type}</td>
              <td>{order.payment}</td>
              <td>{renderOrderStatus(order.status)}</td>
              <td>{order.total}</td>
              {showActions && (
                <td>
                  <div className="ad-action-wrapper">
                    <button
                      className="ad-dropdown"
                      onClick={(e) => toggleActionDropdown(e, index)}
                      ref={(el) => (actionDropdownRefs.current[index] = el)}
                    >
                      ⋮
                    </button>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {/* Action dropdown menu — only show if actions are enabled */}
    {showActions && selectedActionOrderIndex !== null && (
      <div
        className="ad-floating-action-dropdown"
        style={{
          top: actionDropdownPosition.top,
          left: actionDropdownPosition.left,
        }}
      >
        <div
          onClick={() => handleViewOrder(orders[selectedActionOrderIndex])}
          style={{ color: "black" }}
        >
          View Order
        </div>

        {!orders[selectedActionOrderIndex]?.isLocked && (
          <>
            <div
              onClick={() => handleOrderAction("Cancelled")}
              style={{ color: "red" }}
            >
              Cancel Product
            </div>
            <div
              onClick={() => handleOrderAction("Completed")}
              style={{ color: "green" }}
            >
              Complete
            </div>
          </>
        )}
      </div>
    )}
  </div>
);

  const LiveOrdersPageContent = () => (
    <div
      className="ad-live-orders-content-wrapper"
      style={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        minHeight: 0,
        width: "100%",
      }}
    >
      <h2 className="ad-title">Live Orders</h2>
      <div className="ad-summary">
        {getSummaryCardsData().liveOrders.map((card, index) => (
          <div key={index} className="ad-summary-card">
            <div className="ad-summary-icon-wrapper">
              <card.icon size={30} className="summary-icon-svg" />
            </div>
            <div className="ad-summary-text">
              <div className="ad-summary-number">{card.title}</div>
              <div className="ad-summary-label">{card.subtitle}</div>
            </div>
          </div>
        ))}
      </div>
      <h2 className="ad-subtitle">Current Orders</h2>
      <OrdersTable orderData={orders.filter((o) => !["Completed", "Cancelled"].includes(o.status))} />

    </div>
  );

 const OrderHistoryPageContent = () => (
  <AdminOrderHistoryContent
    OrdersTableComponent={(props) => <OrdersTable {...props} showActions={false} />}
    ordersData={orders}
  />
);

  const SalesPageContent = () => (
    <AdminSalesComponent
      OrdersTableComponent={OrdersTable}
      ordersData={orders}
    />
  );

  const AdminProfilePageContent = () => <AdminProfile />;

  
  const getCurrentPageName = () => {
    const currentPath = location.pathname.toLowerCase();
    if (currentPath.includes("/admin-sales")) {
      return "Sales";
    } else if (currentPath.includes("/admin-orderhistory")) {
      return "Order History";
    }
    return "Live Orders";
  };

  const renderPageContent = () => {
    // If viewing an order, show the detail view
    if (viewingOrder) {
      return (
        <OrderDetailView
          order={viewingOrder}
          onBack={handleBackToOrders}
          sourcePage={getCurrentPageName()}
          onNavigate={handleNavClick}
        />
      );
    }

    const currentPath = location.pathname.toLowerCase();
    console.log("Current Path in renderPageContent:", currentPath); // DEBUG LOG
    if (currentPath.includes("/admin-sales")) {
      console.log("Rendering Sales Route"); // DEBUG LOG
      return <SalesPageContent />;
    } else if (currentPath.includes("/admin-orderhistory")) {
      console.log("Rendering Order History Route"); // DEBUG LOG
      return <OrderHistoryPageContent />;
    } else if (currentPath.includes("/admin-profile")) {
      console.log("Rendering Admin Profile Route"); // DEBUG LOG
      return <AdminProfilePageContent />;
    }
    // Default to Live Orders / AdminDashboard
    console.log("Rendering Live Orders (Default) Route"); // DEBUG LOG
    return <LiveOrdersPageContent />;
  };

  const sidebarClasses = `ad-sidebar ${isMobileSidebarOpen ? "open" : ""}`;

  return (
    <div
      className={`ad-dashboard ${isMobileSidebarOpen ? "sidebar-is-open" : ""}`}
    >
      <aside className={sidebarClasses}>
        <div className="ad-sidebar-brand">
          <img src={logoImage} alt="Trailblazer Logo" className="ad-logo" />
          <div className="ad-logo-details">
            <h1 className="ad-logo-text">TRAILBLAZER</h1>
            <span className="ad-tagline">PRINTING & LAYOUT SERVICES</span>
          </div>
        </div>

        <nav className="ad-nav">
          {navItems.map((item, index) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <div
                key={index}
                className={`ad-nav-item ${isActive ? "active" : ""}`}
                onClick={() => handleNavClick(item.path)}
                title={item.title}
              >
                {isActive && <div className="ad-nav-indicator" />}
                <Icon size={24} className="ad-nav-icon" />
                <span>{item.title}</span>
              </div>
            );
          })}
        </nav>
        {/* You can add a footer to the sidebar if needed */}
        {/* <div className="ad-sidebar-footer"> ... </div> */}
      </aside>

      {isMobileSidebarOpen && (
        <div className="ad-mobile-overlay" onClick={toggleMobileSidebar}></div>
      )}

      <div className="ad-content-wrapper">
        <div className="ad-topbar">
          <button className="ad-hamburger-menu" onClick={toggleMobileSidebar}>
            <Menu size={28} />
          </button>
          <div className="ad-search">
            <Search className="ad-search-icon" size={20} />
            <input type="text" placeholder="Search..." />
          </div>
          <div className="ad-user-profile" onClick={toggleUserDropdown}>
            <img src={profilePic} alt="Avatar" className="ad-avatar" />
            <span>{adminName}</span>
            <div
              className={`ad-dropdown-arrow ${
                isUserDropdownOpen ? "rotate" : ""
              }`}
            >
              ▼ {/* Using a simple arrow character */}
            </div>
            {isUserDropdownOpen && (
              <div className="ad-dropdown-menu">
                <ul>
                  <li onClick={handleProfileClick}>
                    <User size={20} className="ad-dropdown-icon" /> Admin
                    Profile
                  </li>
                  <li onClick={handleLogOut}>
                    <LogOut size={20} className="ad-dropdown-icon" /> Log Out
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="ad-main-content">{renderPageContent()}</div>
      </div>
    </div>
  );
};

export default AdminDashboard;
