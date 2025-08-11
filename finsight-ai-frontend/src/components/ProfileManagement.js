import { useEffect, useState } from "react";
import { changePassword, getProfile, updateProfile } from "../api";
import "../styles/components.css";

export default function ProfileManagement() {
  const [profile, setProfile] = useState({
    username: "",
    first_name: "",
    last_name: "",
    email: ""
  });
  const [passwords, setPasswords] = useState({
    old_password: "",
    new_password: ""
  });
  const [message, setMessage] = useState("");

  useEffect(() => {
    getProfile()
      .then(res =>
        setProfile({
          username: res.data.username || "",
          first_name: res.data.first_name || "",
          last_name: res.data.last_name || "",
          email: res.data.email || ""
        })
      )
      .catch(err => console.error("Error fetching profile:", err));
  }, []);

  const handleProfileUpdate = () => {
    updateProfile({
      first_name: profile.first_name,
      last_name: profile.last_name
    })
      .then(res => setMessage(res.data?.message || "Profile updated successfully"))

      .catch(err =>
        setMessage(err.response?.data?.error || "Update failed")
      );
  };

  const handleChangePassword = () => {
  changePassword(passwords)
    .then(res => setMessage(res.data?.message || "Password changed successfully"))

    .catch(err => {
      const backendError = err.response?.data?.error;
      if (backendError) {
        setMessage(backendError); // Shows "Old password is incorrect"
      } else {
        setMessage("Password change failed");
      }
    });
};

  return (
    <div className="profile-container">
      <h2 className="analytics-title">Profile Management</h2>

      {message && <p className="info-message">{message}</p>}

      {/* Profile Info */}
      <div className="profile-section">
        <h3>Update Profile</h3>
        <input
          type="text"
          value={profile.username}
          readOnly
          placeholder="Username"
        />
        <input
          type="text"
          value={profile.first_name}
          onChange={(e) =>
            setProfile({ ...profile, first_name: e.target.value })
          }
          placeholder="First Name"
        />
        <input
          type="text"
          value={profile.last_name}
          onChange={(e) =>
            setProfile({ ...profile, last_name: e.target.value })
          }
          placeholder="Last Name"
        />
        <input
          type="email"
          value={profile.email}
          readOnly
          placeholder="Email"
        />
        <button onClick={handleProfileUpdate}>Save Changes</button>
      </div>

      {/* Change Password */}
      <div className="profile-section">
        <h3>Change Password</h3>
        <input
          type="password"
          placeholder="Old Password"
          value={passwords.old_password}
          onChange={(e) =>
            setPasswords({ ...passwords, old_password: e.target.value })
          }
        />
        <input
          type="password"
          placeholder="New Password"
          value={passwords.new_password}
          onChange={(e) =>
            setPasswords({ ...passwords, new_password: e.target.value })
          }
        />
        <button onClick={handleChangePassword}>Change Password</button>
      </div>
    </div>
  );
}
