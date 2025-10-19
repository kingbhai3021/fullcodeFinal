import { useState } from "react";
import axios from "axios";
import AdminNavigation from "./AdminNavigation";
import { Settings as SettingsIcon, Lock } from "lucide-react";
import API_URL from "../apiConfig";

export default function Settings() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [popup, setPopup] = useState({ show: false, message: "", type: "success" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(
        `${API_URL}/chnagepassword`,
        { oldPassword, newPassword },
        { withCredentials: true }
      );
      if (res.status === 200) {
        setPopup({ show: true, message: "Password changed successfully!", type: "success" });
        setOldPassword("");
        setNewPassword("");
      } else {
        setPopup({ show: true, message: "Failed to change password", type: "error" });
      }
    } catch (err) {
      setPopup({ show: true, message: err.response?.data?.message || "Failed to change password", type: "error" });
    } finally {
      setLoading(false);
      setTimeout(() => setPopup((p) => ({ ...p, show: false })), 2000);
    }
  };

  return (
    <AdminNavigation>
      <div className="flex-col items-center justify-center min-h-[calc(100vh-5rem)] md:min-h-[calc(100vh-2rem)] px-4">
        <div className="relative bg-white/90 rounded-2xl shadow-xl p-8 max-w-md w-full mt-12 overflow-hidden">
          {/* Glow/Lighting Effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-400/30 via-purple-400/20 to-pink-400/30 blur-2xl opacity-70 animate-pulse z-0" />
          <div className="relative flex items-center gap-2 mb-6 z-10">
            <div className="bg-indigo-100 text-indigo-600 rounded-full p-2">
              <SettingsIcon size={28} />
            </div>
            <h2 className="text-2xl font-bold text-black">Settings</h2>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
            <div>
              <label className="block text-gray-700 font-medium mb-1">Old Password</label>
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:outline-none text-black bg-white shadow focus:shadow-indigo-200 transition"
                placeholder="Enter old password"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-pink-400 focus:outline-none text-black bg-white shadow focus:shadow-pink-200 transition"
                placeholder="Enter new password"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-semibold py-2 rounded-xl shadow-lg hover:opacity-90 transition flex items-center justify-center gap-2 focus:ring-2 focus:ring-pink-400 focus:outline-none disabled:opacity-60"
              disabled={loading}
            >
              <Lock size={18} className="drop-shadow" /> <span className="drop-shadow">{loading ? "Processing..." : "Change Password"}</span>
            </button>
            {/* Animated Popup */}
            {popup.show && (
              <div className={`fixed left-1/2 top-8 transform -translate-x-1/2 z-50 transition-all duration-300 ${popup.type === "success" ? "bg-green-500" : "bg-red-500"} text-white px-6 py-3 rounded-xl shadow-lg animate-fade-in-out`}
                style={{ minWidth: '220px', textAlign: 'center' }}>
                {popup.message}
              </div>
            )}
          </form>
        </div>
      </div>
    </AdminNavigation>
  );
}
