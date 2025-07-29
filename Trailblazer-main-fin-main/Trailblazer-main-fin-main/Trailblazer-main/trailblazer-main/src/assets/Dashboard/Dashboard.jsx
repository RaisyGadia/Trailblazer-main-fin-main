import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AppHeader from "../../components/AppHeader/AppHeader";
import Sidebar from "../../components/Sidebar/Sidebar";
import "./Dashboard.css";
import profilePic from "../pages/profile.png";
import OrderReceived from "../pages/OrderReceived.png";
import Delivered from "../pages/4.png";
import BusinesswomanWavingHello from "../pages/businesswomanwavinghello.svg";

import {
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

const ORDER_STEPS = [
  {
    status: "Pending",
    label: "Order Received",
    image: OrderReceived,
  },
  {
    status: "Completed",
    label: "Delivered!",
    image: Delivered,
  },
];

export default function Dashboard() {
  const [orders, setOrders] = useState([]);
  const [currentOrderIndex, setCurrentOrderIndex] = useState(0);
  const [firestoreUser, setFirestoreUser] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem("sidebarCollapsed");
    return saved ? JSON.parse(saved) : false;
  });
  const [currentDate, setCurrentDate] = useState("");

  const navigate = useNavigate();
  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    const today = new Date();
    const options = { year: "numeric", month: "long", day: "numeric" };
    setCurrentDate(today.toLocaleDateString("en-US", options));
  }, []);

  // 🟢 Fetch user's orders
  useEffect(() => {
    const fetchOrders = async () => {
      const db = getFirestore();
      if (!user?.uid) return;

      const uid = user.uid;
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

            allOrders.push({
              orderId: docSnap.id,
              fileName: data.fileName || data.selectedTemplate || "Untitled",
              type,
              date: createdAt,
              payment: data["Payment Method"] || data.paymentMethod || "N/A",
              status: folder.status,
              amount: data["Total Amount"] || data.paymentAmount || 0,
            });
          });
        }
      }

      allOrders.sort((a, b) => new Date(b.date) - new Date(a.date));
      setOrders(allOrders);
    };

    fetchOrders();
  }, [user?.uid]);

  // 🟢 Fetch Firestore User (for greeting)
  useEffect(() => {
    const fetchUserFromFirestore = async () => {
      if (!user?.uid) return;
      const db = getFirestore();
      const userRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(userRef);
      if (docSnap.exists()) {
        setFirestoreUser(docSnap.data());
      }
    };

    fetchUserFromFirestore();
  }, [user?.uid]);

  const currentOrder = orders[currentOrderIndex] || null;

  const handlePreviousOrder = () => {
    if (currentOrderIndex > 0) {
      setCurrentOrderIndex(currentOrderIndex - 1);
    }
  };

  const handleNextOrder = () => {
    if (currentOrderIndex < orders.length - 1) {
      setCurrentOrderIndex(currentOrderIndex + 1);
    }
  };

  const formatDate = (date) => {
    const d = new Date(date);
    return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  const formatAmount = (amt) => `₱${parseFloat(amt).toFixed(2)}`;

  const currentStepIndex = ORDER_STEPS.findIndex(
    (step) => step.status === currentOrder?.status
  );

  return (
    <div className="dashboard-container">
      <Sidebar onCollapseChange={setSidebarCollapsed} />
      <div className={`main-content-wrapper ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}>
        <div className={`page-header ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}>
          <div className="page-header-title">
            <h2>Dashboard</h2>
            <p className="date">{currentDate}</p>
          </div>
          <AppHeader
            user={user}
            profilePic={profilePic}
            handleLogout={() => {
              localStorage.clear();
              navigate("/");
            }}
            sidebarCollapsed={sidebarCollapsed}
          />
        </div>

        <main className="main-dashboard">
          <div className="welcome-card">
            <div>
              <h2>Hi, {firestoreUser?.firstName || "Guest"}!</h2>
              <p>Welcome To Trailblazer Printing And<br />Layout Services.</p>
            </div>
            <img src={BusinesswomanWavingHello} alt="Welcome" className="welcome-card-svg" />
          </div>

          <div className="order-progress">
            <h3>Order Progress</h3>

            {currentOrder ? (
              <>
                <div className="order-info">
                  <div className="order-row"><span className="order-label">Order ID:</span><span className="order-value">{currentOrder.orderId}</span></div>
                  <div className="order-row"><span className="order-label">File Name:</span><span className="order-value">{currentOrder.fileName}</span></div>
                  <div className="order-row"><span className="order-label">Type:</span><span className="order-value">{currentOrder.type}</span></div>
                  <div className="order-row"><span className="order-label">Date:</span><span className="order-value">{formatDate(currentOrder.date)}</span></div>
                  <div className="order-row"><span className="order-label">Payment:</span><span className="order-value">{currentOrder.payment}</span></div>
                  <div className="order-row"><span className="order-label">Status:</span><span className={`order-value status-${currentOrder.status.toLowerCase()}`}>{currentOrder.status}</span></div>
                  <div className="order-row"><span className="order-label">Total Amount:</span><span className="order-value1">{formatAmount(currentOrder.amount)}</span></div>
                </div>

                <div className="progress-steps">
                  {ORDER_STEPS.map((step, index) => (
                    <React.Fragment key={step.status}>
                      <div className={`step ${index <= currentStepIndex ? "active" : ""}`}>
                        <div className={`icon-circle ${index <= currentStepIndex ? "highlight" : ""}`}>
                          <img src={step.image} alt={step.label} className="step-img" />
                        </div>
                        <p>{step.label}</p>
                      </div>
                      {index < ORDER_STEPS.length - 1 && <div className="line"></div>}
                    </React.Fragment>
                  ))}
                </div>

                {orders.length > 1 && (
                  <div className="order-nav">
                    <button onClick={handlePreviousOrder} disabled={currentOrderIndex === 0}>◀</button>
                    <span>Order {currentOrderIndex + 1} of {orders.length}</span>
                    <button onClick={handleNextOrder} disabled={currentOrderIndex === orders.length - 1}>▶</button>
                  </div>
                )}
              </>
            ) : (
              <p>No orders to show yet.</p>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
