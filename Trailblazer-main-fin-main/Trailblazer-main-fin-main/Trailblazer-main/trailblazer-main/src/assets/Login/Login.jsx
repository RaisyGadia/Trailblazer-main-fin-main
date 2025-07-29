import { useState, useEffect } from "react";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import "./Login.css";
import logoImage from "../pages/logo.png";

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (message) setMessage("");
  }, [email, password]);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Save user info to localStorage
      localStorage.setItem("loggedIn", "true");
      localStorage.setItem("user", JSON.stringify({ uid: user.uid, email: user.email }));

      window.dispatchEvent(new Event("storageUpdated"));
      navigate("/");
    } catch (error) {
      console.error("Login error:", error);
      setMessage("Invalid email or password");
    }
  };

  return (
    <div className="login-container">
      <div className="login-layout">
        <div className="login-left-panel">
          <div className="login-logo-container">
            <img src={logoImage} alt="Trailblazer Printing Logo" className="login-logo-img" />
            <div>
              <h1 className="login-brand-text">
                TRAILBLAZER
                <br />
                <span className="login-sub-text">PRINTING & LAYOUT SERVICES</span>
              </h1>
            </div>
          </div>

          <div className="welcome-content">
            <h2 className="welcome-heading">Hello,<br />Welcome</h2>
            <p className="welcome-text">
              Log In To Access Your Designs And Start Printing With Trailblazer Services.
            </p>
          </div>
        </div>

        <div className="login-right-panel">
          <div className="login-form-container">
            <h2 className="login-form-heading">LOGIN</h2>

            <form onSubmit={handleSubmit} className="login-form">
              <div className="input-group">
                <div className="input-icon"><Mail className="icon" /></div>
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input"
                  required
                />
              </div>

              <div className="input-group">
                <div className="input-icon"><Lock className="icon" /></div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? <Eye className="icon" /> : <EyeOff className="icon" />}
                </button>
              </div>

              <div className="login-forgot-password-and-button-container">
                <Link to="/forgot-password" className="login-forgot-password-link">
                  Forgot your password?
                </Link>
                <button type="submit" className="login-button">Login</button>
              </div>

              {message && <div className="login-message">{message}</div>}

              <div className="login-signup-link">
                Don't have an account?{" "}
                <Link to="/Signup" className="auth-link">Signup</Link>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="admin-link-container">
        <Link className="admin-link" to="/AdminLogin">Admin</Link>
      </div>
    </div>
  );
}

export default Login;
