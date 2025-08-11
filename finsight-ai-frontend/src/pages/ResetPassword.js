import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { resetPassword } from "../api"; // adjust the path if needed


export default function ResetPassword() {
  const { uid, token } = useParams();
  const navigate = useNavigate();
console.log("ResetPassword params:", { uid, token });

  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
    console.log(uid)
    console.log("hwllo")
  const handleReset = async () => {
    if (!uid || !token) {
      setMessage("Invalid password reset link.");
      return;
    }

    if (password.length < 6) {
      setMessage("Password should be at least 6 characters");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      await resetPassword({ uid, token, new_password: password });
      setMessage("Password reset successful! Redirecting to login...");
      setPassword("");
      setTimeout(function() {
  navigate("/login");
}, 3000);

    } catch (err) {
      setMessage(
        Array.isArray(err.response?.data?.error)
          ? err.response.data.error.join(", ")
          : err.response?.data?.error || "Reset failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-password-container">
      <h2>Reset Password</h2>
      {message && <p className={message.toLowerCase().includes('success') ? "success-message" : "error-message"}>{message}</p>}
      <input
        type="password"
        placeholder="Enter new password"
        value={password}
        onChange={(e) => {
          setPassword(e.target.value);
          setMessage("");
        }}
        disabled={loading}
      />
      <button onClick={handleReset} disabled={loading || !password}>
        {loading ? "Resetting..." : "Reset Password"}
      </button>
    </div>
  );
}
