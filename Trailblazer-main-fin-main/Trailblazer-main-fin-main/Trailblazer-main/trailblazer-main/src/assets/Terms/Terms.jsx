import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "./Terms.css";

const Terms = () => {
  const [activeTab, setActiveTab] = useState("terms");
  const location = useLocation();

  // Check the path on mount to set the active tab correctly
  useEffect(() => {
    if (location.pathname === "/privacy") {
      setActiveTab("privacy");
    } else if (location.pathname === "/terms") {
      setActiveTab("terms");
    }
  }, [location.pathname]);

  return (
    <div className="terms-container">
      {/* Tab Headers */}
      <div className="terms-privacy-tabs">
        <div
          className={`tab-header ${activeTab === "terms" ? "active" : ""}`}
          onClick={() => setActiveTab("terms")}
        >
          Terms and Conditions
        </div>
        <div
          className={`tab-header ${activeTab === "privacy" ? "active" : ""}`}
          onClick={() => setActiveTab("privacy")}
        >
          Privacy Policy
        </div>
      </div>

      {/* Terms Content */}
      {activeTab === "terms" && (
        <>
          <div className="terms-header">
            <h1 className="section-header">Terms and Conditions</h1>
            <p className="last-updated text">Last Updated: March 27, 2025</p>
          </div>

          <p className="text">
            Welcome to Trailblazers Printing and Layout Services! These Terms
            and Conditions govern your use of our website and services. By
            accessing or using our website, you agree to comply with these
            terms.
          </p>

          <h2 className="section-header">Definitions</h2>
          <p className="text">
            "We," "Us," and "Our" refer to CPE 2D Students, the operator of this
            website.
            <br />
            "You" and "Your" refer to the user of our website and services.
            <br />
            "Services" refer to our printing and layout customization offerings.
          </p>

          <h2 className="section-header">Use of Services</h2>
          <p className="text">
            You must be a USTP-CDO student.
            <br />
            You agree to provide accurate and complete information when placing
            an order.
            <br />
            Unauthorized use of our services or website may result in
            termination of access.
          </p>

          <h2 className="section-header">Orders and Payments</h2>
          <p className="text">
            All orders must be paid in full before processing.
            <br />
            Payment methods accepted include [list payment methods].
            <br />
            Prices are subject to change without prior notice.
          </p>

          <h2 className="section-header">Customization and Approval</h2>
          <p className="text">
            Customers must review and approve all design proofs before printing.
            <br />
            Once approved, we are not responsible for errors (spelling, layout,
            color, etc.).
          </p>

          <h2 className="section-header">Pick-up and Delivery</h2>
          <p className="text">
            Estimated delivery times vary based on location and service
            selection.
            <br />
            Estimated pick-up time is subject to the admin's availability, and
            the final schedule will be determined and confirmed by the admin.
          </p>

          <h2 className="section-header">Refunds and Cancellations</h2>
          <p className="text">
            Orders can only be canceled before production starts.
            <br />
            Refunds are only available for defective or incorrect products due
            to our fault.
            <br />
            Custom products are non-refundable unless there is a manufacturing
            defect.
          </p>

          <h2 className="section-header">Intellectual Property</h2>
          <p className="text">
            All designs created by us remain our property unless otherwise
            agreed.
            <br />
            Customers confirm they have the right to use any uploaded content
            and do not infringe on third-party copyrights.
          </p>

          <h2 className="section-header">Limitation of Liability</h2>
          <p className="text">
            We are not responsible for indirect, incidental, or consequential
            damages arising from the use of our services.
            <br />
            Maximum liability shall not exceed the amount paid for the specific
            order.
          </p>

          <h2 className="section-header">Privacy Policy</h2>
          <p className="text">
            Your personal information is protected under our Privacy Policy.
            <br />
            We do not share customer data with third parties without consent.
          </p>

          <h2 className="section-header">Amendments</h2>
          <p className="text">
            We reserve the right to modify these terms at any time.
            <br />
            Continued use of our services after changes implies acceptance of
            the updated terms.
          </p>

          <h2 className="section-header">Contact Information</h2>
          <p className="text">
            For any questions or concerns regarding these Terms and Conditions,
            please contact us at <strong>supporttpl@gmail.com</strong> or call
            us at <strong>+63-9483795069</strong>.
          </p>
        </>
      )}

      {/* Privacy Policy Content */}
      {activeTab === "privacy" && (
        <>
          <div className="terms-header">
            <h1 className="section-header">Privacy Policy</h1>
            <p className="last-updated text">Last Updated: March 27, 2025</p>
          </div>

          <p className="text">
            Trailblazers Printing and Layout Services respects your privacy and
            is committed to protecting your personal data. This Privacy Policy
            explains how we collect, use, and safeguard your information.
          </p>

          <h2 className="section-header">Information We Collect</h2>
          <p className="text">
            Personal Information: Name, email, phone number, delivery address,
            and payment details.
            <br />
            Order Information: Details about your orders, preferences, and
            transaction history.
            <br />
            Technical Data: IP address, browser type, and cookies for website
            functionality.
          </p>

          <h2 className="section-header">How We Use Your Information</h2>
          <p className="text">
            - To process and fulfill orders.
            <br />
            - To communicate with you about your orders and updates.
            <br />
            - To improve our services and website functionality.
            <br />- To comply with legal and security obligations.
          </p>

          <h2 className="section-header">Sharing of Information</h2>
          <p className="text">
            - We do not sell or rent your personal information.
            <br />
            - We may share data with third-party service providers (e.g.,
            payment processors, shipping companies) for order fulfillment.
            <br />- We may disclose information if required by law or to protect
            our rights.
          </p>

          <h2 className="section-header">Cookies and Tracking Technologies</h2>
          <p className="text">
            - We use cookies to enhance user experience and track website usage.
            <br />- You can disable cookies in your browser settings, but some
            features may not function properly.
          </p>

          <h2 className="section-header">Data Security</h2>
          <p className="text">
            We implement security measures to protect your data from
            unauthorized access or breaches.
            <br />
            However, no method of transmission is 100% secure, and we cannot
            guarantee absolute security.
          </p>

          <h2 className="section-header">Your Rights</h2>
          <p className="text">
            - You can request access, correction, or deletion of your personal
            data.
            <br />
            - You can opt out of marketing communications at any time.
            <br />- Contact us at <strong>supporttpl@gmail.com</strong> for any
            privacy-related concerns.
          </p>

          <h2 className="section-header">Changes to this Policy</h2>
          <p className="text">
            We may update this policy from time to time.
            <br />
            Continued use of our website after updates implies acceptance of the
            revised policy.
          </p>

          <h2 className="section-header">Contact Information</h2>
          <p className="text">
            For any questions regarding this Privacy Policy, contact us at{" "}
            <strong>supporttpl@gmail.com</strong> or call us at{" "}
            <strong>+63-9483795069</strong>.
          </p>
        </>
      )}
    </div>
  );
};

export default Terms;
