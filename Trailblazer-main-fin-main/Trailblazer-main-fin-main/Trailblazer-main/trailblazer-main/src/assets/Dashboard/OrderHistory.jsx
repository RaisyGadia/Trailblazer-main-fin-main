import React, { useState, useEffect } from "react";
import AppHeader from "../../components/AppHeader/AppHeader";
import Sidebar from "../../components/Sidebar/Sidebar";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import "./OrderHistory.css";
import Profile from "../pages/profile.png";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

export default function OrderHistoryPage() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const [currentDate, setCurrentDate] = useState("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem("sidebarCollapsed");
    return saved ? JSON.parse(saved) : false;
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const today = new Date();
    const options = { year: "numeric", month: "long", day: "numeric" };
    setCurrentDate(today.toLocaleDateString("en-US", options));
  }, []);

  useEffect(() => {
  const fetchOrders = async () => {
    const db = getFirestore();
    const auth = getAuth();
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    const uid = currentUser.uid;
    let allOrders = [];

    const folders = [
      { status: "Pending", path: "admin_live_orders" },
      { status: "Completed", path: "completed_orders" },
      { status: "Cancelled", path: "cancelled_orders" },
    ];

    const types = ["PRINT", "LAYOUT"];

    for (const folder of folders) {
      for (const type of types) {
        const subColRef = collection(db, folder.path, uid, type);
        const snap = await getDocs(subColRef);

        snap.forEach((docSnap) => {
          const data = docSnap.data();
          const createdAt = data.createdAt?.toDate?.();
          if (!createdAt) return;

          const orderId = docSnap.id;
          const fileName = data.fileName || data.selectedTemplate || "Untitled";
          const amount = data["Total Amount"] || data.paymentAmount || 0;

          allOrders.push({
            orderId,
            fileName,
            type,
            date: createdAt.toISOString(),
            payment: data["Payment Method"] || data.paymentMethod || "N/A",
            status: folder.status,
            amount: `₱${amount.toFixed(2)}`
          });
        });
      }
    }

    allOrders.sort((a, b) => new Date(b.date) - new Date(a.date));
    setOrders(allOrders);
  };

  fetchOrders();
}, []);


  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const handleSidebarCollapse = (collapsed) => {
    setSidebarCollapsed(collapsed);
  };

  const handleSearch = (e) => setSearchTerm(e.target.value);

  const filteredOrders = orders.filter(
    (order) =>
      order.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.orderId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSort = (criteria) => {
    const sorted = [...orders].sort((a, b) => {
      switch (criteria) {
        case "date":
          return new Date(b.date) - new Date(a.date);
        case "az":
          return a.fileName.localeCompare(b.fileName);
        case "orderId":
          return a.orderId.localeCompare(b.orderId);
        default:
          return 0;
      }
    });
    setOrders(sorted);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}-${date.getFullYear()}`;
  };

  return (
    <div className="oh-container">
      <Sidebar onCollapseChange={handleSidebarCollapse} />
      <div className={`main-content-wrapper ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}>
        <div className={`page-header ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}>
          <div className="page-header-title">
            <h2>Order History</h2>
          </div>
          <AppHeader
            user={user}
            profilePic={Profile}
            handleLogout={handleLogout}
            sidebarCollapsed={sidebarCollapsed}
          />
        </div>

        <main className="oh-main">
          <div className="oh-search-sort">
            <div className="search-container">
              <input
                type="text"
                placeholder="Search..."
                className="oh-search-box"
                value={searchTerm}
                onChange={handleSearch}
              />
              <Search className="search-icon" size={20} color="#2f2785" />
            </div>
            <select
              className="oh-sort-dropdown"
              onChange={(e) => handleSort(e.target.value)}
            >
              <option value="">Sort by</option>
              <option value="date">Date (Newest)</option>
              <option value="az">File Name (A-Z)</option>
              <option value="orderId">Order ID</option>
            </select>
          </div>

          <div className="oh-table">
            <table>
              <thead>
                <tr>
                  <th>Order Id</th>
                  <th>File Name</th>
                  <th>Type</th>
                  <th>Date</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order, i) => (
                  <tr key={i}>
                    <td>{order.orderId}</td>
                    <td>{order.fileName}</td>
                    <td>{order.type}</td>
                    <td>{formatDate(order.date)}</td>
                    <td>{order.payment}</td>
                    <td className={`status-${order.status.toLowerCase()}`}>
                      {order.status}
                    </td>
                    <td>{order.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}
