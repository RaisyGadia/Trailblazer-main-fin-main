import React, { useEffect } from "react";
import "./OrderConfirmed.css";
import { useNavigate, useLocation } from "react-router-dom";
import checkmark from "../pages/img/checkmark.png";
import { getStepConfig } from "../../utils/stepsConfig";
import { orderManager } from "../../utils/dataManager";

export const OrderConfirmed = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    orderManager.clearOrderQueue();
  }, []);

  const stepConfig = getStepConfig(location.state?.templateData, location);

  const steps = stepConfig.map((step) => ({
    ...step,
    active: true,
  }));

  return (
    <div className="oc-container">
      <div className="oc-wrapper">
        <div className="oc-background">
          <div className="oc-progress">
            {steps.map((step, i) => (
              <React.Fragment key={i}>
                {i > 0 && <div className="oc-line"></div>}
                <div className="oc-step-circle">{step.number}</div>
              </React.Fragment>
            ))}
          </div>

          <div className="oc-step-labels">
            {steps.map((step, i) => (
              <div key={i} className="oc-step-label">
                {step.label}
              </div>
            ))}
          </div>

          <img src={checkmark} alt="Approval" className="oc-checkmark" />

          <div className="oc-confirmed-message">
            Your order has been confirmed!
          </div>

          <div className="oc-thank-you">
            Thank you for choosing <br />
            Trailblazer Printing and Layout Services
          </div>

          <button
            className="oc-dashboard-btn"
            onClick={() => navigate("/dashboard")}
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmed;
