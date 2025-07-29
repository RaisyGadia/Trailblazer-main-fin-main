import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import "./SignUp.css";
import logoImage from "../pages/logo.png";
import { db, auth } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";

export default function SignUp() {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [emailUsername, setEmailUsername] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (formError) setFormError("");
  }, [firstName, lastName, emailUsername, password, confirmPassword]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setFormError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      // Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, emailUsername, password);
      const user = userCredential.user;

      // Store user details in Firestore using UID as document ID
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        firstName,
        lastName,
        email: emailUsername,
        phoneNumber,
        role: "Customer",
        createdAt: new Date(),
      });

      alert("Account successfully created!");
      navigate("/Login");
    } catch (error) {
      console.error("Error during signup:", error);
      if (error.code === "auth/email-already-in-use") {
        setFormError("Email is already in use.");
      } else {
        setFormError("An error occurred. Please try again.");
      }
    }

    setLoading(false);
  };

  return (
    <div className="su-layout">
      <div className="su-left-panel">
        <div className="su-logo-container">
          <img src={logoImage} alt="Trailblazer Printing Logo" className="logo-img" />
          <div>
            <h1 className="su-brand-text">
              TRAILBLAZER
              <br />
              <span className="su-sub-text">PRINTING & LAYOUT SERVICES</span>
            </h1>
          </div>
        </div>
        <div className="su-welcome-content">
          <h2 className="su-welcome-heading">
            Hello, <br />
            Welcome
          </h2>
          <p className="su-welcome-text">
            Sign Up To Access Your Designs And Start Printing With Trailblazer Services.
          </p>
        </div>
      </div>

      <div className="su-right-panel">
        <div className="su-form-container">
          <h3 className="su-form-heading">SIGN UP</h3>

          <form onSubmit={handleSubmit} className="su-form">
            <div className="su-form-input-name">
              <div className="su-input-group" style={{ maxWidth: "none" }}>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First Name"
                  className="su-name-fields"
                  required
                />
              </div>
              <div className="su-input-group" style={{ maxWidth: "none" }}>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last Name"
                  className="su-name-fields"
                  required
                />
              </div>
            </div>

            <div className="su-input-group">
              <div className="su-input-icon">
                <Mail className="su-icon" />
              </div>
              <input
                type="email"
                value={emailUsername}
                onChange={(e) => setEmailUsername(e.target.value)}
                placeholder="Email"
                className="su-form-input"
                required
              />
            </div>
<div className="su-input-group">
  <div className="su-input-icon">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="su-icon"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 5a2 2 0 012-2h1.586a1 1 0 01.707.293l2.828 2.828a1 1 0 010 1.414L9.414 9.414a16.017 16.017 0 006.172 6.172l1.879-1.879a1 1 0 011.414 0l2.828 2.828a1 1 0 01.293.707V19a2 2 0 01-2 2h-1c-9.389 0-17-7.611-17-17V5z"
      />
    </svg>
  </div>
  <input
    type="tel"
    value={phoneNumber}
    onChange={(e) => setPhoneNumber(e.target.value)}
    placeholder="Phone Number"
    className="su-form-input"
    required
  />
</div>


            <div className="su-input-group">
              <div className="su-input-icon">
                <Lock className="su-icon" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                className="su-form-input"
                required
              />
              <button
                type="button"
                className="su-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <Eye className="su-icon" /> : <EyeOff className="su-icon" />}
              </button>
            </div>

            <div className="su-input-group">
              <div className="su-input-icon">
                <Lock className="su-icon" />
              </div>
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                className="su-form-input"
                required
              />
              <button
                type="button"
                className="su-password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <Eye className="su-icon" /> : <EyeOff className="su-icon" />}
              </button>
            </div>

            {formError && (
              <div style={{ color: "#ff3333", textAlign: "center", fontSize: "14px", marginTop: "-10px" }}>
                {formError}
              </div>
            )}

            <div className="su-submit-and-login-container">
              <Link to="/Login" className="su-login-link">
                Already have an account?
              </Link>
              <button type="submit" className="su-submit-btn" disabled={loading}>
                {loading ? "Submitting..." : "Submit"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
