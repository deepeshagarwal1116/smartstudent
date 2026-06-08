import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./login.css";
import { API_BASE_URL } from "../config";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState('student');
  const navigate = useNavigate();

  useEffect(() => {
    document.getElementById("email-input")?.focus();
  }, []);

  const handleLogin = async () => {
    setError("");

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/login`, {
        email,
        password,
        role
      });

      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
        navigate("/dashboard");
      } else {
        setError("Login failed. Please try again.");
      }
    } catch (err) {
      const message = err.response?.data?.message || "Invalid credentials.";
      setError(message);

      if (message.toLowerCase().includes("user not found")) {
        setTimeout(() => {
          navigate("/register");
        }, 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-main">
      <div className="login-left">
        <h1>Welcome to SmartStudent</h1>
        <p>Your academic dashboard in one place.</p>
      </div>

      <div className="login-right">
        <div className="login-box">
          <h2>Login</h2>

          <input
            id="email-input"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <div className="password-field">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="toggle-btn"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          <label style={{marginBottom: '8px', marginTop: '-10px'}}>Role:</label>
          <select value={role} onChange={e => setRole(e.target.value)} disabled={loading} style={{marginBottom: '20px', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', width: '100%'}}>
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
          </select>

          {error && <p className="error">{error}</p>}

          <button className="login-btn" onClick={handleLogin} disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>

          <div className="bottom-links" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', marginTop: '20px' }}>
            <p className="link-text" onClick={() => navigate("/forgot-password")}>Forgot Password?</p>
            <span>|</span>
            <p className="link-text" onClick={() => navigate("/register")}>Register</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
