import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login, requestPasswordReset } from "../api"; // you will add requestPasswordReset
import "../styles/Login_Signup.css";

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [forgotMode, setForgotMode] = useState(false);
  const [resetMessage, setResetMessage] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setErr("");
    try {
      const data = await login(email, password);
      localStorage.setItem("token", data.access);
      localStorage.setItem("refreshToken", data.refresh);
      localStorage.setItem("userEmail", email);
      nav("/");
    } catch (e) {
      setErr(e.response?.data?.detail || "Login failed");
    }
  }

 async function handleForgotSubmit(e) {
    e.preventDefault();
    setErr("");
    setResetMessage("");
    try {
      await requestPasswordReset({ email });  // pass as object with email key
      setResetMessage("Password reset email sent! Check your inbox.");
    } catch (e) {
      setErr(e.response?.data?.error || "Failed to send reset email");
    }
  }

  if (forgotMode) {
    return (
      <div className="auth-page">
        <form onSubmit={handleForgotSubmit} className="auth-card">
          <h2>Forgot Password</h2>
          {err && <div className="auth-error">{err}</div>}
          {resetMessage && <div className="auth-success">{resetMessage}</div>}

          <label>
            <span>Email</span>
            <input
              type="email"
              placeholder="Enter your registered email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </label>

          <button type="submit">Send Reset Email</button>
          <p>
            Remembered? <button type="button" onClick={() => setForgotMode(false)}>Back to login</button>
          </p>
        </form>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <form onSubmit={handleSubmit} className="auth-card">
        <h2>Smart Expense — Sign in</h2>
        {err && <div className="auth-error">{err}</div>}

        <label>
          <span>Email</span>
          <input
            type="email"
            placeholder="Enter your email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
        </label>

        <label>
          <span>Password</span>
          <input
            type="password"
            placeholder="Enter your password"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </label>

        <button type="submit">Sign in</button>
        <p>
          New? <Link to="/signup">Create account</Link> |{" "}
          <button type="button" className="forgot-link" onClick={() => setForgotMode(true)}>Forgot Password?</button>
        </p>
      </form>
    </div>
  );
}
