import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../api";
import "../styles/Login_Signup.css";

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

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
      setErr(email,password)
      setErr(e.response?.data?.detail || "Login failed");
    }
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
            onChange={e=>setEmail(e.target.value)}
          />
        </label>

        <label>
          <span>Password</span>
          <input
            type="password"
            placeholder="Enter your password"
            required
            value={password}
            onChange={e=>setPassword(e.target.value)}
          />
        </label>

        <button type="submit">Sign in</button>
        <p>New? <Link to="/signup">Create account</Link></p>
      </form>
    </div>
  );
}
