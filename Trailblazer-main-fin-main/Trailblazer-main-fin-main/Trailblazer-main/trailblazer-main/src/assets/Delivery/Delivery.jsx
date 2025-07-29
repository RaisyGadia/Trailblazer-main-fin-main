import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Delivery.css";
import {
  getStepConfig,
  getStepsWithActiveStates,
} from "../../utils/stepsConfig";
import BackButton from "../../components/BackButton/BackButton";

const Delivery = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedOption, setSelectedOption] = useState("pickup");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [deliveryConstraints, setDeliveryConstraints] = useState({
    pickupAllowed: true,
    deliveryAllowed: true,
    message: "",
  });

  // Dynamically determine step configuration based on service type
  const stepConfig = getStepConfig(location.state?.templateData, location);
  const steps = getStepsWithActiveStates(stepConfig, "delivery");

  // Check payment method and set delivery constraints
  useEffect(() => {
    const orderDetails = location.state?.orderDetails || {};
    const paymentMethodFromState = orderDetails.paymentMethod || "";
    setPaymentMethod(paymentMethodFromState);

    // Set constraints based on payment method
    let constraints = {
      pickupAllowed: true,
      deliveryAllowed: true,
      message: "",
    };

    switch (paymentMethodFromState) {
      case "GCash":
        constraints = {
          pickupAllowed: true,
          deliveryAllowed: true,
          message: "GCash payment allows both pickup and delivery options.",
        };
        break;
      case "Cash":
        constraints = {
          pickupAllowed: true,
          deliveryAllowed: true,
          message: "Cash payment allows both pickup and delivery options.",
        };
        break;
      case "Cash on Delivery":
        constraints = {
          pickupAllowed: false,
          deliveryAllowed: true,
          message: "Cash on Delivery requires delivery to your location.",
        };
        // Force delivery option for Cash on Delivery
        setSelectedOption("deliver");
        break;
      default:
        constraints = {
          pickupAllowed: true,
          deliveryAllowed: true,
          message: "Please select a payment method in the previous step.",
        };
    }

    setDeliveryConstraints(constraints);
    console.log(
      "DELIVERY: Payment method:",
      paymentMethodFromState,
      "Constraints:",
      constraints
    );
  }, [location.state]);

  const handleNext = () => {
  if (selectedOption === "deliver") {
    navigate("/deliveryaddress", {
      state: {
        ...location.state,
        deliveryMethod: selectedOption,
      },
    });
  } else {
    navigate("/payment", {
      state: {
        ...location.state,
        deliveryMethod: selectedOption,
      },
    });
  }
};


  // Handle back navigation to basket page
  const handleBack = () => {
    const stateToPass = {
      ...location.state,
      basketItems: location.state?.basketItems || [],
      orderDetails:
        location.state?.orderDetails || location.state?.specifications || {},
      specifications:
        location.state?.specifications || location.state?.orderDetails || {},
      templateData: location.state?.templateData || null,
    };

    // Pass the current state back when navigating to basket page
    navigate("/basket", {
      state: stateToPass,
    });
  };

  return (
    <div className="delivery-wrapper">
      <BackButton onClick={handleBack} />

      <div className="delivery-steps">
        <div className="delivery-step-circles">
          {steps.map((step, index) => (
            <React.Fragment key={step.number}>
              {index > 0 && (
                <div
                  className={`delivery-line ${
                    steps[index - 1].active ? "active" : ""
                  }`}
                ></div>
              )}
              <div
                className={`delivery-step-circle ${
                  step.active ? "active" : ""
                }`}
              >
                <span className="delivery-step-num">{step.number}</span>
              </div>
            </React.Fragment>
          ))}
        </div>
        <div className="delivery-step-labels">
          {steps.map((step) => (
            <div key={`label-${step.number}`} className="delivery-step-label">
              {step.label}
            </div>
          ))}
        </div>
      </div>

      <h2 className="delivery-title">Delivery Method</h2>

      {paymentMethod && (
        <div className="delivery-notice">
          <p>
            <strong>Payment Method:</strong> {paymentMethod}
          </p>
          {deliveryConstraints.message && (
            <p className="delivery-constraint-message">
              {deliveryConstraints.message}
            </p>
          )}
        </div>
      )}

      <div className="delivery-options">
        <div
          className={`delivery-option ${
            selectedOption === "pickup" ? "selected" : ""
          } ${!deliveryConstraints.pickupAllowed ? "disabled" : ""}`}
          onClick={() =>
            deliveryConstraints.pickupAllowed && setSelectedOption("pickup")
          }
        >
          <input
            type="radio"
            name="delivery"
            value="pickup"
            checked={selectedOption === "pickup"}
            onChange={() =>
              deliveryConstraints.pickupAllowed && setSelectedOption("pickup")
            }
            id="pickup-radio"
            disabled={!deliveryConstraints.pickupAllowed}
          />
          <div className="delivery-info">
            <h4>Pick-up</h4>
            <div className="delivery-details">
              <p>
                CEA Building
                <br />
                Ground Floor
                <br />
                10:00 AM
              </p>
              <p className="delivery-note">
                <em>
                  Note: Get your print in <strong>approximately 7 minutes</strong>
                </em>
              </p>
            </div>
          </div>
        </div>

        <div
          className={`delivery-option ${
            selectedOption === "deliver" ? "selected" : ""
          } ${!deliveryConstraints.deliveryAllowed ? "disabled" : ""}`}
          onClick={() =>
            deliveryConstraints.deliveryAllowed && setSelectedOption("deliver")
          }
        >
          <input
            type="radio"
            name="delivery"
            value="deliver"
            checked={selectedOption === "deliver"}
            onChange={() =>
              deliveryConstraints.deliveryAllowed &&
              setSelectedOption("deliver")
            }
            id="deliver-radio"
            disabled={!deliveryConstraints.deliveryAllowed}
          />
          <div className="delivery-info">
            <h4>Deliver</h4>
            <div className="delivery-details">
              <p>
                If you choose deliver please enter your delivery address in the
                next step.
              </p>
              <p>
                Delivery Fee <strong>depends</strong> on what building.
              </p>
              <p className="delivery-note">
                <em>
                  Note: Delivery area is <strong>inside</strong> the Campus
                  only.
                </em>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="delivery-footer">
        <button className="delivery-next-btn" onClick={handleNext}>
          Next
        </button>
      </div>
    </div>
  );
};

export default Delivery;
