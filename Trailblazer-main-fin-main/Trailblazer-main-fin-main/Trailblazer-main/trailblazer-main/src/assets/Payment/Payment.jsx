import React, { useEffect, useState, useMemo } from "react";
import "./Payment.css";
import { useNavigate, useLocation } from "react-router-dom";
import {
  getStepConfig,
  getStepsWithActiveStates,
} from "../../utils/stepsConfig";
import BackButton from "../../components/BackButton/BackButton";
import { orderManager, formatPrice } from "../../utils/dataManager";
import sampleQR from "../../assets/qr.jpg";
import { getFirestore, collection, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { getStorage, ref, uploadBytes } from "firebase/storage";
import { getAuth } from "firebase/auth";



const Payment = () => {

  const [uploadedReceipt, setUploadedReceipt] = useState(null);

const handleReceiptUpload = (e) => {
  const file = e.target.files[0];
  if (file) setUploadedReceipt(file);
};

  const navigate = useNavigate();
  const location = useLocation();

  const currentOrder = orderManager.getCurrentOrder();
  const templateData = location.state?.templateData || null;
  const orderDetails = location.state?.orderDetails || {};
  const basketItems = location.state?.basketItems || [];

  console.log("PAYMENT: Received basketItems:", basketItems);
  console.log("PAYMENT: Received orderDetails:", orderDetails);
  console.log("PAYMENT: Location state:", location.state);
  console.log("PAYMENT: Template data:", templateData);

  console.log("PAYMENT: Turnaround time sources:");
  console.log(
    "- location.state.orderDetails.turnaroundTime:",
    location.state?.orderDetails?.turnaroundTime
  );
  console.log("- orderDetails.turnaroundTime:", orderDetails.turnaroundTime);
  console.log("- templateData.turnaroundTime:", templateData?.turnaroundTime);
  console.log(
    "- basketItems turnaroundTime:",
    basketItems.map(
      (item) => item.specifications?.turnaroundTime || item.turnaroundTime
    )
  );

  const stepConfig = getStepConfig(templateData, location);
  const steps = getStepsWithActiveStates(stepConfig, "payment");

  const initialDeliveryMethod =
    location.state?.deliveryMethod ||
    orderDetails.deliveryMethod ||
    JSON.parse(localStorage.getItem("user"))?.deliveryMethod ||
    "pickup";

  const getTurnaroundTime = () => {
    const sources = [
      {
        name: "location.state.orderDetails",
        value: location.state?.orderDetails?.turnaroundTime,
      },
      { name: "orderDetails", value: orderDetails.turnaroundTime },
      { name: "templateData", value: templateData?.turnaroundTime },
      {
        name: "basketItems[0].specifications",
        value: basketItems[0]?.specifications?.turnaroundTime,
      },
      { name: "basketItems[0]", value: basketItems[0]?.turnaroundTime },
    ];

    for (const source of sources) {
      if (source.value && source.value !== "Standard" && source.value !== "") {
        console.log(
          "PAYMENT: Using turnaround time from",
          source.name,
          ":",
          source.value
        );
        return source.value;
      }
    }
    console.log("PAYMENT: Defaulting to Standard turnaround time");
    return "Standard";
  };

  const [userDetails, setUserDetails] = useState({
    name: "",
    phoneNumber: "",
    building: "CEA Building",
    room: "41-304",
    deliveryTime: "1:00 PM",
    turnaround: getTurnaroundTime(),
    paymentMethod: orderDetails.paymentMethod || "Cash",
    deliveryAddress: "",
    deliveryMethod: initialDeliveryMethod,
  });

  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

 useEffect(() => {
  const deliveryMethod = location.state?.deliveryMethod || "pickup";

  const isDeliver = deliveryMethod === "deliver";
  const account = isDeliver
    ? location.state?.deliveryDetails?.accountDetails || {}
    : {};

  const delivery = isDeliver
    ? location.state?.deliveryDetails || {}
    : {};

  setUserDetails((prev) => ({
    ...prev,
    deliveryMethod,
    turnaround: getTurnaroundTime(),

    name: isDeliver
      ? `${account.firstName || "Kryzl"} ${account.lastName || "Castaneda"}`
      : "Kryzl Castaneda",

    phoneNumber: isDeliver
      ? account.phoneNumber || "09900112233"
      : "09900112233",

    building: isDeliver
      ? delivery.building || "CEA Building"
      : "CEA Building",

    room: isDeliver
      ? delivery.room || "41-304"
      : "41-304",

    deliveryTime: isDeliver
      ? delivery.deliveryTime || "1:00 PM"
      : "1:00 PM",

    deliveryAddress: isDeliver
      ? `${delivery.building || "CEA Building"}, Room ${delivery.room || "41-304"}`
      : "",

    notes: isDeliver ? delivery.note || "" : "",
  }));
}, [location.state]);

  const handleProceed = async () => {
  if (!termsAccepted) {
    alert("Please accept the terms and conditions to proceed.");
    return;
  }

  try {
    const auth = getAuth();
    const db = getFirestore();
    const storage = getStorage();
    const user = auth.currentUser;

    if (!user) {
      alert("You must be logged in to proceed.");
      return;
    }

    const uid = user.uid;
    const deliveryMethod = userDetails.deliveryMethod.toLowerCase();
    const docRef = doc(db, "pending_service", "PRINT", uid, deliveryMethod === "deliver" ? "Deliver" : "Pickup");

    for (const item of basketItems) {
      const filePath = item.isTemplate
        ? `pending_service/LAYOUT/${uid}/${item.name}`
        : `pending_service/PRINT/${uid}/${item.name}`;

      const fileRef = ref(storage, filePath);
      await uploadBytes(fileRef, item.file);
    }

    if (uploadedReceipt) {
      const receiptRef = ref(storage, `online_payment/receipt/${uploadedReceipt.name}`);
      await uploadBytes(receiptRef, uploadedReceipt);
    }

const adminOrderRef = doc(db, "admin_live_orders", uid);

await setDoc(adminOrderRef, { exists: true }, { merge: true });

const now = new Date();
const orderId = `${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}${now.getFullYear()}-${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}${String(now.getSeconds()).padStart(2, "0")}`;

const orderType = basketItems.some(item => item.isTemplate) ? "LAYOUT" : "PRINT";

const orderDocRef = doc(collection(adminOrderRef, orderType), orderId);

await setDoc(orderDocRef, {
  createdAt: serverTimestamp(),
  Name: userDetails.name,
  "Phone Number": userDetails.phoneNumber,
  fileName: basketItems.map((item) => item.name).join(", "),
  "Building/Department": userDetails.building,
  "Room Number": userDetails.room,
  "Delivery Time": userDetails.deliveryTime,
  "Turnaround Time": userDetails.turnaround,
  "Payment Method": userDetails.paymentMethod,
  "Paper Size":
    basketItems[0]?.specifications?.paperSize ||
    orderDetails.paperSize ||
    "Not specified",
  "Printing Option":
    basketItems[0]?.specifications?.printOption ||
    orderDetails.printOption ||
    "Not specified",
  "Total Amount": parseFloat(totalAmount),
  Status: "Pending",
  Type: userDetails.deliveryMethod === "deliver" ? "Deliver" : "Pickup",
  Notes: userDetails.notes?.trim() || "N/A",
});

    const orderToComplete = {
      basketItems,
      orderDetails: {
        ...orderDetails,
        paymentMethod: userDetails.paymentMethod,
        deliveryMethod: userDetails.deliveryMethod,
        turnaroundTime: userDetails.turnaround,
        deliveryAddress: userDetails.deliveryAddress || "",
        customerPhone: userDetails.phoneNumber,
        customerName: userDetails.name,
        notes: userDetails.notes || "",
        totalAmount: totalAmount,
      },
      templateData,
      userDetails,
    };

    navigate("/confirmation", {
      state: {
        completedOrder: orderToComplete,
        userDetails,
        templateData,
        basketItems,
        orderDetails: orderToComplete.orderDetails,
      },
    });

  } catch (error) {
    console.error("PAYMENT: Error saving order:", error);
    alert("There was an error saving your order. Please try again.");
  }
};

  const handleBack = () => {
    navigate("/delivery", {
      state: {
        ...location.state,
        basketItems,
        orderDetails: {
          ...orderDetails,
          paymentMethod: userDetails.paymentMethod,
        },
        templateData,
      },
    });
  };

  const handleTermsChange = (e) => {
    setTermsAccepted(e.target.checked);
  };

  const openTermsModal = (e) => {
    e.preventDefault();
    setShowTermsModal(true);
  };

  const closeTermsModal = () => {
    setShowTermsModal(false);
  };

  const acceptTerms = () => {
    setTermsAccepted(true);
    setShowTermsModal(false);
  };

  const declineTerms = () => {
    setTermsAccepted(false);
    setShowTermsModal(false);
  };

  const {
    deliveryFee,
    turnaroundFee,
    filesFee,
    totalAmount,
    recalculatedBasePrice,
  } = useMemo(() => {
    console.log("PAYMENT: Recalculating fees with basketItems:", basketItems);
    console.log("PAYMENT: OrderDetails price:", orderDetails.price);

    let recalculatedBasePrice = 0;

    basketItems.forEach((item) => {
      if (item.isTemplate) {
        if (item.templateType === "layout") {
          recalculatedBasePrice += 50; 
        } else if (
          item.templateType === "presentation" ||
          item.templateType === "poster"
        ) {
          recalculatedBasePrice += 50;
        } else if (item.templateType === "resume") {
          recalculatedBasePrice += 30;
        } else {
          recalculatedBasePrice += 25; 
        }
      } else {
        const specs = item.specifications || orderDetails;
        if (specs.paperSize && specs.printOption) {
          const printOption =
            specs.printOption === "Full color" ? "Colored" : specs.printOption;
          const basePrice =
            {
              "Black&White": { Short: 2, A4: 3, Long: 3 },
              Colored: { Short: 10, A4: 12, Long: 12 },
            }[printOption]?.[specs.paperSize] || 0;

          recalculatedBasePrice += basePrice * (item.pageCount || 1);
        }
      }
    });

    const basePrice =
      basketItems.length > 0
        ? recalculatedBasePrice
        : parseFloat(orderDetails.price || "0.00");

    let deliveryFee = 0.0;
    const isCashOnDelivery = userDetails.paymentMethod === "Cash on Delivery";
    const isDelivery = userDetails.deliveryMethod === "deliver";

    if (isCashOnDelivery || isDelivery) {
     const hasLayout = basketItems.some(item => item.isTemplate && item.templateType === "layout");
      deliveryFee = hasLayout ? 20.0 : 10.0;
    }

    let turnaroundFee = 0.0;
    console.log(
      "PAYMENT: Calculating turnaround fee, userDetails.turnaround:",
      userDetails.turnaround
    );

    if (userDetails.turnaround === "Rush") {
      basketItems.forEach((item, index) => {
        console.log(`PAYMENT: Processing item ${index}:`, item);
        if (item.isTemplate) {
          if (item.templateType === "layout") {
            turnaroundFee += 7.0; 
            console.log(`PAYMENT: Added ₱7 rush fee for layout template`);
          }
        } else {
          const itemRushFee = 7.0;
          turnaroundFee += itemRushFee;
          console.log(
            `PAYMENT: Added ₱${itemRushFee} rush fee for file ${item.name} (${
              item.pageCount || 1
            } pages)`
          );
        }
      });
    }

    console.log("PAYMENT: Total turnaround fee:", turnaroundFee);

    const filesFee = basePrice;

    const totalAmount = basePrice + deliveryFee + turnaroundFee;

    console.log(
      "PAYMENT: Calculated fees - Base:",
      basePrice,
      "Delivery:",
      deliveryFee,
      "Rush:",
      turnaroundFee,
      "Total:",
      totalAmount
    );
    console.log("PAYMENT: Fee breakdown details:");
    console.log("- Payment method:", userDetails.paymentMethod);
    console.log("- Delivery method:", userDetails.deliveryMethod);
    console.log("- Turnaround time:", userDetails.turnaround);
    console.log(
      "- Has layout service:",
      basketItems.some(
        (item) => item.isTemplate && item.templateType === "layout"
      )
    );
    console.log(
      "- Total files for rush:",
      basketItems.filter(
        (item) => !item.isTemplate || item.templateType === "layout"
      ).length
    );

    return {
      deliveryFee,
      turnaroundFee,
      filesFee,
      totalAmount: totalAmount.toFixed(2),
      recalculatedBasePrice: basePrice.toFixed(2),
    };
  }, [
    orderDetails.price,
    userDetails.deliveryMethod,
    userDetails.turnaround,
    basketItems,
    orderDetails, 
  ]);

  useEffect(() => {
    console.log("PAYMENT: BasketItems changed:", basketItems);
    console.log("PAYMENT: OrderDetails changed:", orderDetails);
    console.log("PAYMENT: Recalculated base price:", recalculatedBasePrice);
  }, [basketItems, orderDetails, recalculatedBasePrice]);

  if (
    basketItems.length === 0 &&
    (!orderDetails ||
      !orderDetails.price ||
      parseFloat(orderDetails.price) === 0)
  ) {
    return (
      <div className="pay-wrapper">
        <div
          className="pay-error"
          style={{
            padding: "40px 20px",
            textAlign: "center",
            maxWidth: "500px",
            margin: "50px auto",
          }}
        >
          <div style={{ fontSize: "48px", marginBottom: "20px" }}>📭</div>
          <h3 style={{ color: "#e74c3c", marginBottom: "15px" }}>
            No Items in Order
          </h3>
          <p style={{ color: "#666", marginBottom: "30px", lineHeight: "1.5" }}>
            Your basket appears to be empty. You need to add files to your order
            before proceeding to payment.
          </p>
          <div
            style={{
              display: "flex",
              gap: "10px",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={() => navigate("/basket")}
              style={{
                padding: "12px 24px",
                backgroundColor: "#1C7ED6",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "16px",
                fontWeight: "500",
              }}
            >
              ← Go to Basket
            </button>
            <button
              onClick={() => navigate("/upload")}
              style={{
                padding: "12px 24px",
                backgroundColor: "#28a745",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "16px",
                fontWeight: "500",
              }}
            >
              📁 Upload Files
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pay-wrapper">
      {showTermsModal && (
        <div className="pay-modal-overlay" onClick={closeTermsModal}>
          <div className="pay-modal" onClick={(e) => e.stopPropagation()}>
            <div className="pay-modal-content">
              <h3 className="pay-terms-title">
                Terms & Conditions
                <button className="pay-terms-close" onClick={closeTermsModal}>
                  ×
                </button>
              </h3>

              <div className="pay-terms-container">
                <p className="pay-terms-intro">
                  Welcome to Trailblazers Printing and Layout Services! These
                  Terms and Conditions govern your use of our website and
                  services. By accessing or using our website, you agree to
                  comply with these terms.
                </p>

                <div className="pay-terms-section">
                  <span className="pay-terms-label">i. Definitions</span>
                  <p className="pay-terms-text">
                    "CPE" and "Our" refer to CPE 2D Students, the operator of
                    this website.
                    <br />
                    "You" and "Your" refer to the user of our website and
                    services.
                    <br />
                    "Services" refer to our printing and layout customization
                    offerings.
                  </p>
                </div>

                <div className="pay-terms-section">
                  <span className="pay-terms-label">ii. Use of Services</span>
                  <p className="pay-terms-text">
                    You must be a USTP-CDO student.
                    <br />
                    You agree to provide accurate and complete information when
                    placing an order.
                    <br />
                    Unauthorized use of our services or website may result in
                    termination of access.
                  </p>
                </div>

                <div className="pay-terms-section">
                  <span className="pay-terms-label">
                    iii. Orders and Payments
                  </span>
                  <p className="pay-terms-text">
                    All orders must be paid in full before processing.
                    <br />
                    Payment methods accepted include (list payment methods).
                    <br />
                    Prices are subject to change without prior notice.
                  </p>
                </div>

                <div className="pay-terms-section">
                  <span className="pay-terms-label">
                    iv. Customization and Approval
                  </span>
                  <p className="pay-terms-text">
                    Customers must review and approve all design proofs before
                    printing.
                    <br />
                    Once approved, we are not responsible for errors (spelling,
                    layout, color, etc.).
                  </p>
                </div>

                <div className="pay-terms-section">
                  <span className="pay-terms-label">
                    v. Pick-up and Delivery
                  </span>
                  <p className="pay-terms-text">
                    Estimated delivery times vary based on location and service
                    selection.
                    <br />
                    Estimated pick-up time is subject to the admin's
                    availability, and the final schedule will be determined and
                    confirmed by the admin.
                  </p>
                </div>

                <div className="pay-terms-section">
                  <span className="pay-terms-label">
                    vi. Refunds and Cancellations
                  </span>
                  <p className="pay-terms-text">
                    Orders can only be canceled before production starts.
                  </p>
                </div>
              </div>

              <div className="pay-terms-buttons">
                <button className="pay-terms-decline" onClick={declineTerms}>
                  Decline
                </button>
                <button className="pay-terms-accept" onClick={acceptTerms}>
                  Accept
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="pay-steps">
        <div className="pay-step-circles">
          {steps.map((step, index) => (
            <React.Fragment key={step.number}>
              {index > 0 && (
                <div
                  className={`pay-line ${
                    steps[index - 1].active ? "active" : ""
                  }`}
                />
              )}
              <div className={`pay-step-circle ${step.active ? "active" : ""}`}>
                <span className="pay-step-num">{step.number}</span>
              </div>
            </React.Fragment>
          ))}
        </div>
        <div className="pay-step-labels">
          {steps.map((step, i) => (
            <div key={`label-${i}`} className="pay-step-label">
              {step.label}
            </div>
          ))}
        </div>
      </div>

      <h2 className="pay-title">Payment Details</h2>

      <div className="pay-receipt-section">
  <h3 className="pay-receipt-title">GCash Payment</h3>
  <p>Please scan the QR code or type the number for GCash Payment</p>

  <div className="pay-gcash-box">
  <img src={sampleQR} alt="GCash QR" className="pay-qr-img" />
  <p className="pay-number">09054136939 - KR**L KA*E C.</p>
</div>

  <div className="pay-upload-receipt">
    <label htmlFor="receiptUpload" className="pay-upload-label">
      Upload Screenshot/Receipt:
    </label>
    <input
      id="receiptUpload"
      type="file"
      accept="image/*,.pdf"
      onChange={(e) => handleReceiptUpload(e)}
    />
    {uploadedReceipt && (
      <div className="pay-receipt-preview">
        {uploadedReceipt.type.includes("image") ? (
          <img
            src={URL.createObjectURL(uploadedReceipt)}
            alt="Uploaded receipt"
            className="pay-receipt-image"
          />
        ) : (
          <p>📎 {uploadedReceipt.name}</p>
        )}
      </div>
    )}
  </div>
</div>

      <div className="pay-card">
        <div className="pay-doc-preview">
          <div className="pay-doc-box">
            {templateData?.imageSrc ? (
              <div className="pay-doc-preview-content">
                <img
                  src={templateData.imageSrc}
                  alt="Selected template"
                  className="pay-template-image"
                />
              </div>
            ) : basketItems.length > 0 && basketItems[0].file ? (
              <div className="pay-doc-preview-content">
                <embed
                  src={URL.createObjectURL(basketItems[0].file)}
                  type={basketItems[0].file.type}
                  className="pay-template-image"
                />
              </div>
            ) : basketItems.length > 0 ? (
              <div className="pay-doc-preview-content">
                <div
                  style={{
                    padding: "20px",
                    textAlign: "center",
                    color: "#666",
                  }}
                >
                  📄 {basketItems.length} File
                  {basketItems.length !== 1 ? "s" : ""}
                </div>
              </div>
            ) : (
              <div className="pay-doc-preview-content">
                <div
                  style={{
                    padding: "20px",
                    textAlign: "center",
                    color: "#999",
                  }}
                >
                  No files
                </div>
              </div>
            )}
          </div>
          <div className="pay-doc-info">
            {basketItems.length > 0 ? (
              <>
                <div className="pay-doc-title">
                  {basketItems.length === 1
                    ? basketItems[0].name
                    : `${basketItems.length} Files Selected`}
                </div>
                {basketItems.length === 1 ? (
                  <>
                    <div className="pay-doc-detail">
                      {basketItems[0].specifications?.paperSize ||
                        orderDetails.paperSize ||
                        "Paper Size: Not specified"}
                    </div>
                    <div className="pay-doc-detail">
                      {basketItems[0].specifications?.printOption ||
                        orderDetails.printOption ||
                        "Print Option: Not specified"}
                    </div>
                    {basketItems[0].pageCount > 1 && (
                      <div className="pay-doc-detail">
                        {basketItems[0].pageCount} pages
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="pay-doc-detail">
                      Total pages:{" "}
                      {basketItems.reduce(
                        (total, item) => total + (item.pageCount || 1),
                        0
                      )}
                    </div>
                    <div className="pay-doc-detail">Various specifications</div>
                  </>
                )}
              </>
            ) : (
              <>
                <div className="pay-doc-title">No Files Selected</div>
                <div className="pay-doc-detail">
                  Please go back to add files
                </div>
              </>
            )}
          </div>
        </div>

        <div className="pay-info">
          <div className="pay-row">
            <span className="pay-label">Name</span>
            <span className="pay-value">{userDetails.name}</span>
          </div>
          <div className="pay-row">
            <span className="pay-label">Phone Number</span>
            <span className="pay-value">{userDetails.phoneNumber}</span>
          </div>

          {userDetails.deliveryMethod === "deliver" ? (
            <>
              <div className="pay-row">
                <span className="pay-label">Delivery Address</span>
                <span className="pay-value">
                  {userDetails.deliveryAddress ||
                    `${userDetails.building}, Room ${userDetails.room}`}
                </span>
              </div>
              <div className="pay-row">
                <span className="pay-label">Delivery Time</span>
                <span className="pay-value">{userDetails.deliveryTime}</span>
              </div>
            </>
          ) : (
            <>
              <div className="pay-row">
                <span className="pay-label">Building/Department</span>
                <span className="pay-value">{userDetails.building}</span>
              </div>
              <div className="pay-row">
                <span className="pay-label">Room Number</span>
                <span className="pay-value">{userDetails.room}</span>
              </div>
              <div className="pay-row">
                <span className="pay-label">Delivery Time</span>
                <span className="pay-value">{userDetails.deliveryTime}</span>
              </div>
            </>
          )}

          <div className="pay-row">
            <span className="pay-label">Turnaround Time</span>
            <span className="pay-value">{userDetails.turnaround}</span>
          </div>
         <div className="pay-row">
  <span className="pay-label">Payment Method</span>
  <span className="pay-value">{userDetails.paymentMethod}</span>
</div>

{basketItems.length > 0 && (
  <>
    <div className="pay-row">
      <span className="pay-label">Paper Size</span>
      <span className="pay-value">
        {basketItems[0].specifications?.paperSize || orderDetails.paperSize || "Not specified"}
      </span>
    </div>
    <div className="pay-row">
      <span className="pay-label">Printing Option</span>
      <span className="pay-value">
        {basketItems[0].specifications?.printOption || orderDetails.printOption || "Not specified"}
      </span>
    </div>
  </>
)}


          {basketItems.length > 0 && (
            <div
              className="pay-items-summary"
              style={{ marginTop: "20px", marginBottom: "20px" }}
            >
              <h4 style={{ marginBottom: "10px", color: "#333" }}>
                Order Summary:
              </h4>
              {basketItems.map((item, index) => (
                <div
                  key={item.id}
                  className="pay-item-row"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "5px 0",
                    borderBottom:
                      index === basketItems.length - 1
                        ? "none"
                        : "1px solid #eee",
                  }}
                >
                  <span style={{ fontSize: "14px" }}>
                    {item.name}
                    {item.pageCount > 1 && ` (${item.pageCount} files)`}
                    {item.isTemplate && " (Template)"}
                  </span>
                  <span style={{ fontSize: "14px", fontWeight: "bold" }}>
                    ₱
                    {(() => {
                      if (item.isTemplate) {
                        if (item.templateType === "layout") return "50.00";
                        if (
                          item.templateType === "presentation" ||
                          item.templateType === "poster"
                        )
                          return "50.00";
                        if (item.templateType === "resume") return "30.00";
                        return "25.00";
                      } else {
                        const specs = item.specifications || orderDetails;
                        if (specs.paperSize && specs.printOption) {
                          const printOption =
                            specs.printOption === "Full color"
                              ? "Colored"
                              : specs.printOption;
                          const basePrice =
                            {
                              "Black&White": { Short: 2, A4: 3, Long: 3 },
                              Colored: { Short: 10, A4: 12, Long: 12 },
                            }[printOption]?.[specs.paperSize] || 0;
                          return (basePrice * (item.pageCount || 1)).toFixed(2);
                        }
                        return "0.00";
                      }
                    })()}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="pay-breakdown">
            <div className="pay-row">
              <span>
                Delivery Fee
                {userDetails.deliveryMethod === "deliver"
                  ? " (Once per order)"
                  : " (Free pickup)"}
              </span>
              <span>₱{deliveryFee.toFixed(2)}</span>
            </div>
            <div className="pay-row">
              <span>
                Turnaround Fee
                {userDetails.turnaround === "Rush"
                  ? turnaroundFee > 7
                    ? ` (₱7.00 × ${Math.round(turnaroundFee / 7)} files)`
                    : ` (₱7.00 per file)`
                  : " (Standard - Free)"}
              </span>
              <span>₱{turnaroundFee.toFixed(2)}</span>
            </div>
            <div className="pay-row">
              <span>
                File/s Fee ({basketItems.length} item
                {basketItems.length !== 1 ? "s" : ""})
                {basketItems.length === 0 && " - No files"}
              </span>
              <span>₱{filesFee.toFixed(2)}</span>
            </div>
            <hr className="pay-separator" />
            <div className="pay-total">
              <span>Total Amount</span>
              <span>₱{totalAmount}</span>
            </div>
            {basketItems.length === 0 && (
              <div
                style={{
                  marginTop: "10px",
                  color: "#e74c3c",
                  fontSize: "14px",
                  textAlign: "center",
                }}
              >
                No items in basket - please go back to add files
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="pay-terms">
        <input
          type="checkbox"
          id="terms"
          checked={termsAccepted}
          onChange={handleTermsChange}
        />
        <label htmlFor="terms">
          I agree to the{" "}
          <a href="#" className="pay-link" onClick={openTermsModal}>
            terms and conditions
          </a>
          .
        </label>
      </div>

      <div className="pay-actions">
        <BackButton onClick={handleBack} className="payment-style" />
        <button
          className="pay-btn-filled"
          onClick={handleProceed}
          disabled={!termsAccepted}
        >
          Proceed
        </button>
      </div>
    </div>
  );
};

export default Payment;