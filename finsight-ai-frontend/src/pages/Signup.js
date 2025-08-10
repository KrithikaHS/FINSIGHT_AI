import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signup } from "../api";
import "../styles/Login_Signup.css";

export default function Signup() {
  const nav = useNavigate();
  const [form, setForm] = useState({ email: "", password: "", name: "" });
  const [err, setErr] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setErr("");
    try {
      await signup(form);
      nav("/login");
    } catch (e) {
      setErr(
        e.response?.data?.email?.[0] ||
        e.response?.data?.password?.[0] ||
        e.response?.data?.detail ||
        "Signup failed"
        
      );
      setErr(e.response?.data?.email?.[0] || e.response?.data?.password?.[0] || e.response?.data?.detail || JSON.stringify(e.response?.data) || "Signup failed");

    }
  }

  return (
    <div className="auth-page">
      <form onSubmit={handleSubmit} className="auth-card">
        <h2>Create account</h2>
        {err && <div className="auth-error">{err}</div>}

        <label>
          <span>Full name</span>
          <input
            type="text"
            placeholder="Enter your name"
            value={form.name}
            onChange={e => setForm({...form, name: e.target.value})}
          />
        </label>

        <label>
          <span>Email</span>
          <input
            type="email"
            placeholder="Enter your email"
            value={form.email}
            onChange={e => setForm({...form, email: e.target.value})}
          />
        </label>

        <label>
          <span>Password</span>
          <input
            type="password"
            placeholder="Enter your password"
            value={form.password}
            onChange={e => setForm({...form, password: e.target.value})}
          />
        </label>

        <button type="submit" className="green">Sign up</button>
        <p>Already have an account? <Link to="/login">Sign in</Link></p>
      </form>
    </div>
  );
}
