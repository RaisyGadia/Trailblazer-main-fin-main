import { useState } from "react";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import "./AdminLogin.css";
import logoImage from "../pages/logo.png";

function AdminLogin() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const checkAdminExists = (email) => {
    const adminRegistry =
      JSON.parse(localStorage.getItem("adminRegistry")) || [];
    return adminRegistry.find((admin) => admin.email === email);
  };

  const loadAdminProfile = (email) => {
    const adminRegistry =
      JSON.parse(localStorage.getItem("adminRegistry")) || [];
    const adminProfile = adminRegistry.find((admin) => admin.email === email);

    if (adminProfile) {
      localStorage.setItem("admin", JSON.stringify(adminProfile));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Admin login attempt with:", { email, password });

    const validEmail = "trailblazers_prntlyt@gmail.com";
    const validPassword = "Password123";

    if (email !== validEmail || password !== validPassword) {
      alert("Access denied. Invalid admin credentials.");
      return;
    }

    localStorage.setItem("adminLoggedIn", "true");
    localStorage.setItem("currentAdminEmail", email);

    const existingAdmin = checkAdminExists(email);

    if (existingAdmin) {
      loadAdminProfile(email);
      navigate("/admindashboard");
    } else {
      navigate("/admin-profile");
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-layout">
        <div className="admin-login-left-panel">
          <div className="admin-logo-container">
            <img
              src={logoImage || "/placeholder.svg"}
              alt="Trailblazer Printing Logo"
              className="admin-logo-img"
            />
            <div>
              <h1 className="admin-brand-text">
                TRAILBLAZER
                <br />
                <span className="admin-sub-text">
                  PRINTING & LAYOUT SERVICES
                </span>
              </h1>
            </div>
          </div>

          <div className="welcome-content">
            <h2 className="welcome-heading">
              Hello,
              <br /> Welcome <br /> Admins!
            </h2>
          </div>
        </div>

        <div className="admin-login-right-panel">
          <div className="admin-login-form-container">
            <h2 className="admin-login-form-heading">ADMIN LOGIN</h2>

            <form onSubmit={handleSubmit} className="admin-login-form">
              <div className="input-group">
                <div className="input-icon">
                  <Mail className="icon" />
                </div>
                <input
                  type="text"
                  placeholder="Admin Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="input-group">
                <div className="input-icon">
                  <Lock className="icon" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? (
                    <Eye className="icon" />
                  ) : (
                    <EyeOff className="icon" />
                  )}
                </button>
              </div>

              <div className="admin-forgot-password-and-button-container">
                <Link
                  to="/forgot-password"
                  className="admin-forgot-password-link"
                >
                  Forgot your password?
                </Link>
                <button type="submit" className="admin-login-button">
                  LOGIN
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
