// src/components/Navbar.js
import { useNavigate } from "react-router-dom";
import "../styles/components.css";


export default function Navbar() {
  const nav = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    nav("/login");
  }

  return (
    <nav className="navbar">
  <div className="navbar-container">
    {/* Left: Logo */}
    <div className="navbar-logo">
      <img src="/logo192.png" alt="Logo" className="logo-image" />
    </div>

    {/* Center: Title */}
    <div className="navbar-title">
      <div className="main-title">SmartExpense</div>
      <div className="subtitle">AI-driven budget & insights</div>
    </div>

    {/* Right: User Info & Logout */}
    <div className="navbar-user">
      <div className="user-name">{user.name || user.email}</div>
      <button onClick={logout} className="logout-btn">
        Logout
      </button>
    </div>
  </div>
</nav>

  );
}
