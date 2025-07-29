import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, getFirestore } from "firebase/firestore";
import "./AdminOrderHistory.css";
import { LayoutDashboard, History } from "lucide-react";
import logoImage from "../pages/logo.png";
import profilePic from "../pages/profile.png";
import salesChartImage from "../pages/img/sales.png";

const AdminOrderHistoryContent = ({ OrdersTableComponent }) => {
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    const fetchOrderHistory = async () => {
      const db = getFirestore();
      const statuses = ["completed_orders", "cancelled_orders"];
      const types = ["PRINT", "LAYOUT"];
      const fetched = [];

      const usersSnap = await getDocs(collection(db, "users"));
      const userUIDs = usersSnap.docs.map((doc) => doc.id);

      for (const uid of userUIDs) {
        for (const col of statuses) {
          for (const type of types) {
            const typeSnap = await getDocs(collection(db, col, uid, type));
            for (const orderDoc of typeSnap.docs) {
              const data = orderDoc.data();
              const createdAt = new Date(data.createdAt?.toDate?.() || Date.now());
              const status = (data.Status ?? (col.includes("completed") ? "Completed" : "Cancelled")).toLowerCase();

              fetched.push({
                id: orderDoc.id,
                name: data.fileName || data.Name || "Untitled",
                type,
                payment: data["Payment Method"] || "Unknown",
                status,
                total: `₱${Number(data["Total Amount"] || 0).toFixed(2)}`,
                orderDate: createdAt.toISOString(),
                uid,
              });
            }
          }
        }
      }

      console.log("✅ All fetched admin order history:", fetched);
      setOrders(fetched);
    };

    fetchOrderHistory();
  }, []);

  const filteredOrders =
    activeTab === "all"
      ? orders
      : orders.filter((o) => o.status === activeTab);

  const tabs = [
    { label: "All Orders", value: "all" },
    { label: "Completed", value: "completed" },
    { label: "Cancelled", value: "cancelled" },
  ];

  const renderTable = (data) =>
    OrdersTableComponent ? (
      <OrdersTableComponent orderData={data} showActions={false} />
    ) : (
      <div className="ad-orders-table-container">
        <div className="ad-orders-table">
          <table>
            <thead>
              <tr>
                <th>Order Id</th>
                <th>Name</th>
                <th>Type</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {data.map((order, idx) => (
                <tr key={idx} className={idx % 2 ? "alt-row" : ""}>
                  <td>{order.id}</td>
                  <td>{order.name}</td>
                  <td>{order.type}</td>
                  <td>{order.payment}</td>
                  <td>
                    <span className={`ad-status ${order.status}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </td>
                  <td>{order.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );

  return (
    <div className="aoh-content-wrapper">
      <h2 className="ad-title">Order History</h2>

      <div className="aoh-tabs">
        {tabs.map((t) => (
          <button
            key={t.value}
            className={`aoh-tab-btn ${activeTab === t.value ? "active" : ""}`}
            onClick={() => setActiveTab(t.value)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {filteredOrders.length ? (
        renderTable(filteredOrders)
      ) : (
        <div className="aoh-empty-message">No orders found in this tab.</div>
      )}
    </div>
  );
};

const AdminOrderHistory = () => {
  const navigate = useNavigate();

  return (
    <div className="aoh-container">
      <aside className="ad-sidebar">
        <div className="ad-sidebar-brand">
          <img src={logoImage} alt="Trailblazer Logo" className="aoh-logo" />
          <div className="aoh-logo-details">
            <h1 className="aoh-logo-text">TRAILBLAZER</h1>
            <span className="aoh-tagline">PRINTING & LAYOUT SERVICES</span>
          </div>
        </div>

        <nav className="ad-nav">
          <div className="ad-nav-item" onClick={() => navigate("/admindashboard")}>
            <LayoutDashboard className="aoh-icon" size={35} />
            <span>Live Orders</span>
          </div>
          <div className="ad-nav-item active">
            <div className="ad-nav-indicator" />
            <History className="aoh-icon" size={35} />
            <span>Order History</span>
          </div>
          <div className="ad-nav-item">
            <img src={salesChartImage} alt="Sales" className="nav-item-image" />
            <span>Sales</span>
          </div>
        </nav>
      </aside>

      <div className="ad-content-wrapper">
        <div className="ad-topbar">
          <div className="ad-search">
            <input type="text" placeholder="Search..." />
          </div>
          <div className="ad-user-profile">
            <img src={profilePic} alt="Avatar" className="ad-avatar" />
            <span>Admin</span>
          </div>
        </div>

        <div className="ad-main-content">
          <AdminOrderHistoryContent />
        </div>
      </div>
    </div>
  );
};

export default AdminOrderHistory;
export { AdminOrderHistoryContent };
