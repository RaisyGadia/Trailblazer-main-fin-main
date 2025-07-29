// ─────────────────────────────────────────────────────────────
//  SalesPageContent.jsx
// ─────────────────────────────────────────────────────────────

import React, { useEffect, useState, useMemo } from "react";
import { collection, getDocs, getFirestore } from "firebase/firestore";

/**
 * @param {Object} props
 * @param {Function} props.OrdersTableComponent – table component that accepts
 *                                               props { orderData, showActions }
 * @param {Array}    [props.ordersData=[]]      – optional orders array injected
 *                                               from AdminDashboard (will be
 *                                               merged / de-duplicated)
 */
const SalesPageContent = ({ OrdersTableComponent, ordersData = [] }) => {
  /* ──────────────────────────────────────────────
   * 1️⃣  Pull *only* completed orders from Firestore
   * ────────────────────────────────────────────── */
  const [completedOrdersFB, setCompletedOrdersFB] = useState([]);

  useEffect(() => {
    const fetchCompletedSales = async () => {
      try {
        const db = getFirestore();
        const types = ["PRINT", "LAYOUT"];

        // 1. Get every user UID
        const usersSnap = await getDocs(collection(db, "users"));
        const userUIDs = usersSnap.docs.map((d) => d.id);

        const results = [];

        // 2. Dive into completed_orders/{uid}/{type}
        for (const uid of userUIDs) {
          for (const type of types) {
            const snap = await getDocs(
              collection(db, "completed_orders", uid, type)
            );

            snap.forEach((docSnap) => {
              const data = docSnap.data();
              const status = String(data.Status || "completed").toLowerCase();
              if (status !== "completed") return; // safety guard

              const createdAt = new Date(
                data.createdAt?.toDate?.() || Date.now()
              );

              results.push({
                id: docSnap.id,
                name: data.fileName || data.Name || "Untitled",
                type,
                payment: data["Payment Method"] || "Unknown",
                status, // always "completed"
                total: `₱${Number(data["Total Amount"] || 0).toFixed(2)}`,
                orderDate: createdAt.toISOString(),
                uid,
              });
            });
          }
        }

        console.log("✅ completed sales orders:", results);
        setCompletedOrdersFB(results);
      } catch (err) {
        console.error("🔥 Failed to fetch completed sales orders", err);
      }
    };

    fetchCompletedSales();
  }, []);

  /* ──────────────────────────────────────────────
   * 2️⃣  Merge orders coming from AdminDashboard
   *     (if it already injected some) – de-dupe by id
   * ────────────────────────────────────────────── */
  const completedOrders = useMemo(() => {
    const fromProps = ordersData.filter(
      (o) => String(o.status).toLowerCase() === "completed"
    );

    // de-dupe
    const map = new Map();
    [...completedOrdersFB, ...fromProps].forEach((o) => map.set(o.id, o));
    return Array.from(map.values());
  }, [completedOrdersFB, ordersData]);

  /* ──────────────────────────────────────────────
   * 3️⃣  UI state – “Printing” | “Layout” tabs
   * ────────────────────────────────────────────── */
  const [activeSalesTab, setActiveSalesTab] = useState("printing");

  /* ──────────────────────────────────────────────
   * 4️⃣  Compute sales totals
   * ────────────────────────────────────────────── */
  const salesAmounts = useMemo(() => {
    let printing = 0;
    let layout = 0;

    completedOrders.forEach((o) => {
      const amt = Number(o.total.replace(/[^\d.-]/g, ""));
      if (o.type === "LAYOUT") layout += amt;
      else printing += amt;
    });

    return {
      printing: `₱${printing.toFixed(2)}`,
      layout: `₱${layout.toFixed(2)}`,
    };
  }, [completedOrders]);

  /* ──────────────────────────────────────────────
   * 5️⃣  Table rows for the active tab
   * ────────────────────────────────────────────── */
  const displayedOrders = useMemo(() => {
    return completedOrders.filter((o) =>
      activeSalesTab === "layout" ? o.type === "LAYOUT" : o.type !== "LAYOUT"
    );
  }, [activeSalesTab, completedOrders]);

  /* ──────────────────────────────────────────────
   * 6️⃣  Render
   * ────────────────────────────────────────────── */
  return (
    <div
      className="ad-sales-content-wrapper"
      style={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        minHeight: 0,
      }}
    >
      <h2 className="ad-title">Sales</h2>

      {/* Tabs */}
      <div className="ad-tabs-container">
        <div
          className={`ad-tab-item ${
            activeSalesTab === "printing" ? "active" : ""
          }`}
          onClick={() => setActiveSalesTab("printing")}
        >
          Printing
        </div>
        <div
          className={`ad-tab-item ${
            activeSalesTab === "layout" ? "active" : ""
          }`}
          onClick={() => setActiveSalesTab("layout")}
        >
          Layout
        </div>
      </div>

      {/* Sales figure card */}
      <div className="ad-sales-figure-section">
        {activeSalesTab === "printing" && (
          <div className="ad-sales-figure-card">
            <div className="ad-sales-figure-card__amount">
              {salesAmounts.printing}
            </div>
            <div className="ad-sales-figure-card__label">Printing Sales</div>
          </div>
        )}
        {activeSalesTab === "layout" && (
          <div className="ad-sales-figure-card">
            <div className="ad-sales-figure-card__amount">
              {salesAmounts.layout}
            </div>
            <div className="ad-sales-figure-card__label">Layout Sales</div>
          </div>
        )}
      </div>

      <h2 className="ad-subtitle" style={{ marginTop: "var(--space-xl)" }}>
        {activeSalesTab === "printing" ? "Printing Orders" : "Layout Orders"}
      </h2>

      {/* Orders table – no ⋮ actions */}
      <div className="ad-sales-orders-section">
        {OrdersTableComponent && (
          <OrdersTableComponent
            orderData={displayedOrders}
            showActions={false}
          />
        )}
      </div>
    </div>
  );
};

export default SalesPageContent;
