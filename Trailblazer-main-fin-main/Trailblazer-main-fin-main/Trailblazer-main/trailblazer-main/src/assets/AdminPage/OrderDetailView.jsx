import React, { useState, useEffect } from "react";
import "./OrderDetailView.css";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../assets/firebase";

const CustomerCard = ({ order }) => {
  const [customer, setCustomer] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
  });

  useEffect(() => {
    const fetchCustomer = async () => {
      if (!order?.uid) return;
      const userRef = doc(db, "users", order.uid);
      const snapshot = await getDoc(userRef);
      if (snapshot.exists()) {
        const data = snapshot.data();
        setCustomer({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          email: data.email || "",
          phoneNumber: data.phoneNumber || data.phone || "",
        });
      }
    };
    fetchCustomer();
  }, [order?.uid]);

  return (
    <div className="ad-detail-section ad-customer-section">
      <h3 className="ad-section-title">Customer</h3>
      <div className="ad-customer-info">
        <span>
          <strong>Name:</strong>{" "}
          {customer.firstName || customer.lastName
            ? `${customer.firstName} ${customer.lastName}`.trim()
            : "—"}
        </span>
        <span>
          <strong>Phone:</strong> {customer.phoneNumber || "—"}
        </span>
        <span>
          <strong>Email:</strong> {customer.email || "—"}
        </span>
      </div>
    </div>
  );
};

const DeliveryDetailsSection = ({ order }) => {
  const [serviceType, setServiceType] = useState("—");
  const [deliveryTime, setDeliveryTime] = useState("—");

  useEffect(() => {
    const fetchDetails = async () => {
      if (!order?.uid || !order?.type || !order?.id) return;

      try {
        const docRef = doc(
          db,
          "admin_live_orders",
          order.uid,
          order.type,
          order.id
        );
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
          const data = snapshot.data();
          setServiceType(data.Type || "—");
          setDeliveryTime(data["Delivery Time"] || "—");
        }
      } catch (err) {
        console.error("❌ Failed to fetch delivery details:", err);
        setServiceType("—");
        setDeliveryTime("—");
      }
    };

    fetchDetails();
  }, [order?.uid, order?.type, order?.id]);

  return (
    <div className="ad-delivery-section">
      <h3 className="ad-section-title">Delivery Details</h3>
      <div className="ad-delivery-info">
        <div>
          <strong>File:</strong> {order.name}
        </div>
        <div>
          <strong>Address:</strong> CEA Building, 41-304
        </div>
        <div>
          <strong>Delivery Time:</strong> {deliveryTime}
        </div>
        <div>
          <strong>Turnaround Time:</strong> {order.turnaround || "Standard"}
        </div>
        <div>
          <strong>Service Type:</strong> {serviceType}
        </div>
      </div>
    </div>
  );
};

const SpecificationsSection = ({ order }) => {
  const [notes, setNotes] = useState("—");
  const [paperSize, setPaperSize] = useState("—");
  const [printingOption, setPrintingOption] = useState("—");

  useEffect(() => {
    const fetchDetails = async () => {
      if (!order?.uid || !order?.type || !order?.id) return;

      try {
        const docRef = doc(db, "admin_live_orders", order.uid, order.type, order.id);
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
          const data = snapshot.data();
          setNotes(data.notes || data.Notes || "—");
          setPaperSize(data["Paper Size"] || "—");
          setPrintingOption(data["Printing Option"] || "—");
        }
      } catch (err) {
        console.error("❌ Failed to fetch specs and notes:", err);
      }
    };

    fetchDetails();
  }, [order?.uid, order?.type, order?.id]);

  return (
    <div className="ad-specs-section">
      <h3 className="ad-section-title">Specifications</h3>
      <div className="ad-specs-content">
        <div><strong>Paper Size:</strong> {paperSize}</div>
        <div><strong>Printing Option:</strong> {printingOption}</div>
        <div><strong>Notes:</strong> {notes}</div>
      </div>
    </div>
  );
};

const ProductSection = ({ order, items = [], serviceType }) => {
  const calculatePrice = (item) => {
    const quantity = item.quantity ?? 1;
    const pages = item.pageCount || 1;

    if (item.isTemplate) {
      if (item.templateType === "layout") return 50 * quantity;
      if (["presentation", "poster"].includes(item.templateType)) return 50 * quantity;
      if (item.templateType === "resume") return 30 * quantity;
      return 25 * quantity;
    }

    const specs = item.specifications || item;
    const printOptionRaw = specs.printOption;
    const printOption = printOptionRaw === "Full color" ? "Colored" : printOptionRaw;
    const paperSize = specs.paperSize;

    const priceMap = {
      "Black&White": { Short: 2, A4: 3, Long: 3 },
      Colored: { Short: 10, A4: 12, Long: 12 },
    };

    const basePrice = priceMap?.[printOption]?.[paperSize] || 0;
    return basePrice * pages * quantity;
  };

  const getServiceLabel = (item) => {
    if (item.isTemplate) {
      const type = item.templateType;
      return type ? type.charAt(0).toUpperCase() + type.slice(1) : "Layout";
    }
    return "Print";
  };

  const productTotal = items.reduce((sum, item) => sum + calculatePrice(item), 0);

  const hasSpecialTemplate = items.some(
    (item) =>
      item.isTemplate &&
      ["layout", "presentation", "poster", "resume"].includes(item.templateType)
  );

  const deliveryFee =
    serviceType?.toLowerCase() === "pickup"
      ? 0
      : hasSpecialTemplate
      ? 20
      : 10;

  const turnaroundFee = order?.turnaround?.toLowerCase() === "rush" ? 7 : 0;
  const totalAmount = productTotal + deliveryFee + turnaroundFee;
};

const OrderDetailsCard = ({ order }) => {
  const [fullOrder, setFullOrder] = useState(order);

  useEffect(() => {
    const fetchOrderData = async () => {
      if (!order?.uid || !order?.type || !order?.id) return;
      try {
        const docRef = doc(db, "admin_live_orders", order.uid, order.type, order.id);
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
          const data = snapshot.data();
          if (!data.products || data.products.length === 0) {
            console.warn("⚠️ No products found in order:", data);
          }
          setFullOrder({ ...order, ...data });
        }
      } catch (error) {
        console.error("❌ Failed to fetch product data:", error);
      }
    };

    fetchOrderData();
  }, [order?.uid, order?.type, order?.id]);

  return (
    <div className="ad-detail-section ad-order-details-card">
      <CustomerCard order={fullOrder} />
      <div className="ad-detail-sections-row">
        <DeliveryDetailsSection order={fullOrder} />
        <SpecificationsSection order={fullOrder} />
      </div>
      <ProductSection order={fullOrder} items={fullOrder.products || []} serviceType={fullOrder.Type} />
    </div>
  );
};

const OrderDetailView = ({ order, onBack, sourcePage = "Live Orders", onNavigate }) => {
  const getBreadcrumbPath = () => {
    switch (sourcePage) {
      case "Order History":
        return { path: "/admin-orderhistory", label: "Order History" };
      case "Sales":
        return { path: "/admin-sales", label: "Sales" };
      default:
        return { path: "/admindashboard", label: "Live Orders" };
    }
  };

  const breadcrumbPath = getBreadcrumbPath();

  return (
    <div className="ad-order-detail-view">
      <div className="ad-order-detail-header">
        <div className="ad-breadcrumb">
          <span
            className="ad-breadcrumb-item clickable"
            onClick={() => onNavigate(breadcrumbPath.path)}
          >
            {breadcrumbPath.label}
          </span>
          <span className="ad-breadcrumb-separator">&gt;</span>
          <span className="ad-breadcrumb-item">Orders</span>
        </div>
        <h2 className="ad-order-title">Order {order.id}</h2>
      </div>

      <div className="ad-order-detail-content">
        <OrderDetailsCard order={order} />
      </div>
    </div>
  );
};

export default OrderDetailView;

export {
  CustomerCard,
  OrderDetailsCard,
  DeliveryDetailsSection,
  SpecificationsSection,
  ProductSection,
};
