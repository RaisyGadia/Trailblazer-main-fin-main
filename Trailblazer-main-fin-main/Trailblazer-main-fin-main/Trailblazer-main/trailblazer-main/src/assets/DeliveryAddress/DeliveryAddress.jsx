import React, { useState, useEffect } from "react";
import "./DeliveryAddress.css";
import editIcon from "../pages/img/edit.png";
import { useNavigate, useLocation } from "react-router-dom";
import {
  getStepConfig,
  getStepsWithActiveStates,
} from "../../utils/stepsConfig";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";



const DeliveryAddress = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const stepConfig = getStepConfig(location.state?.templateData, location);
  const steps = getStepsWithActiveStates(stepConfig, "delivery");

  const paymentMethod =
    location.state?.orderDetails?.paymentMethod || "Not selected";

  const [accountDetails, setAccountDetails] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
  });

  const [deliveryDetails, setDeliveryDetails] = useState({
    building: "CEA Building",
    room: "41-304",
    deliveryTime: "1:00 PM",
    note: "",
  });

  const [isEditingAccount, setIsEditingAccount] = useState(false);
  const [isEditingDelivery, setIsEditingDelivery] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      const auth = getAuth();
      const db = getFirestore();
      const currentUser = auth.currentUser;

      if (currentUser) {
        try {
          const userDocRef = doc(db, "users", currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();

            setAccountDetails({
              firstName: userData.firstName || "",
              lastName: userData.lastName || "",
              phoneNumber: userData.phoneNumber || "",
            });

            setDeliveryDetails((prev) => ({
              ...prev,
              building: userData.building || prev.building,
              room: userData.room || prev.room,
              deliveryTime: userData.deliveryTime || prev.deliveryTime,
              note: userData.note || "",
            }));
          }
        } catch (error) {
          console.error("Failed to fetch user data:", error);
        }
      }
    };

    fetchUserData();
  }, []);

  const handleAccountChange = (e) => {
    const { name, value } = e.target;
    setAccountDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleDeliveryChange = (e) => {
    const { name, value } = e.target;
    setDeliveryDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleNext = () => {
    if (
      !accountDetails.firstName ||
      !accountDetails.lastName ||
      !accountDetails.phoneNumber
    ) {
      alert("Please complete all account details before proceeding.");
      return;
    }

    // Save for later use if needed
    const updatedUser = {
      ...accountDetails,
      ...deliveryDetails,
    };
    localStorage.setItem("user", JSON.stringify(updatedUser));

    // Proceed to payment
    navigate("/payment", {
      state: {
        basketItems: location.state?.basketItems || [],
        orderDetails: {
          ...location.state?.orderDetails,
          paymentMethod: paymentMethod,
          turnaroundTime:
            location.state?.orderDetails?.turnaroundTime || "Standard",
          price: location.state?.orderDetails?.price || "0.00",
        },
        deliveryMethod: "deliver",
        deliveryDetails: {
          ...deliveryDetails,
          deliveryAddress: `${deliveryDetails.building}, Room ${deliveryDetails.room}`,
          accountDetails: { ...accountDetails },
        },
        templateData: location.state?.templateData,
      },
    });
  };

  return (
    <div className="da-wrapper">
      {/* STEP UI */}
      <div className="da-steps">
        <div className="da-step-circles">
          {steps.map((step, index) => (
            <React.Fragment key={step.number}>
              {index > 0 && (
                <div
                  className={`da-step-line ${
                    steps[index - 1].active ? "active" : ""
                  }`}
                />
              )}
              <div className={`da-step-circle ${step.active ? "active" : ""}`}>
                <span className="da-step-num">{step.number}</span>
              </div>
            </React.Fragment>
          ))}
        </div>
        <div className="da-step-labels">
          {steps.map((step) => (
            <div key={`label-${step.number}`} className="da-step-label">
              {step.label}
            </div>
          ))}
        </div>
      </div>

      <h2 className="da-heading">Enter Your Delivery Address</h2>

      {/* ACCOUNT DETAILS */}
      <div className="da-cards">
        <div className="da-card">
          <div className="da-card-header">
            <h2>Account Details</h2>
            <img
              src={editIcon}
              alt="Edit"
              className="da-edit-icon"
              onClick={() => setIsEditingAccount((prev) => !prev)}
            />
          </div>
          <div className="da-card-body">
            {["firstName", "lastName", "phoneNumber"].map((field) => (
              <div className="da-row" key={field}>
                <span className="da-label">
                  {field === "phoneNumber"
                    ? "Phone Number"
                    : field.charAt(0).toUpperCase() + field.slice(1)}
                </span>
                {isEditingAccount ? (
                  <input
                    className="da-input"
                    type="text"
                    name={field}
                    value={accountDetails[field]}
                    onChange={handleAccountChange}
                  />
                ) : (
                  <span className="da-value">{accountDetails[field]}</span>
                )}
              </div>
            ))}
            <div className="da-row">
              <span className="da-label">Payment Method</span>
              <span className="da-value">{paymentMethod}</span>
            </div>
          </div>
        </div>

        {/* DELIVERY DETAILS */}
        <div className="da-card">
          <div className="da-card-header">
            <h2>Delivery Address</h2>
            <img
              src={editIcon}
              alt="Edit"
              className="da-edit-icon"
              onClick={() => setIsEditingDelivery((prev) => !prev)}
            />
          </div>
          <div className="da-card-body">
            {["building", "room", "deliveryTime", "note"].map((field) => (
              <div className="da-row" key={field}>
                <span className="da-label">
                  {field === "deliveryTime"
                    ? "Delivery Time"
                    : field === "room"
                    ? "Room/Office"
                    : field === "note"
                    ? "Note"
                    : "Building/Department"}
                </span>
                {isEditingDelivery ? (
                  <input
                    className="da-input"
                    type={field === "deliveryTime" ? "time" : "text"}
                    name={field}
                    value={deliveryDetails[field]}
                    onChange={handleDeliveryChange}
                  />
                ) : (
                  <span className="da-value">
                    {deliveryDetails[field] || "None"}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ACTION BUTTONS */}
      <div className="da-btns">
        <button
          className="da-btn-outline"
          onClick={() => navigate("/basket", { state: location.state })}
        >
          Back
        </button>
        <button className="da-btn-primary" onClick={handleNext}>
          Next
        </button>
      </div>
    </div>
  );
};

export default DeliveryAddress;
