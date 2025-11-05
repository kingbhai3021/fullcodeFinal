import { useState, useEffect } from "react";
import AdminNavigation from "./AdminNavigation";
import { Phone } from "lucide-react";
import axios from "axios";
import API_URL from "../apiConfig";


export default function ChangeNumber() {
  const [phone, setPhone] = useState("");
  const [currentPhone, setCurrentPhone] = useState("");
  const [popup, setPopup] = useState({ show: false, message: "", type: "success" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch current phone number
    const fetchPhone = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/getPhoneNumber`, { withCredentials: true });
        setCurrentPhone(res.data || "");
      } catch (err) {
        setPopup({ show: true, message: "Failed to fetch phone number", type: "error" });
      } finally {
        setLoading(false);
      }
    };
    fetchPhone();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await axios.post(
        `${API_URL}/updatePhoneNumber`,
        { phonenumber: phone },
        { withCredentials: true }
      );
      if (res.status === 200) {
        setPopup({ show: true, message: "Phone number changed successfully!", type: "success" });
        setCurrentPhone(phone);
        setPhone("");
      } else {
        setPopup({ show: true, message: "Failed to change phone number", type: "error" });
      }
    } catch (err) {
      setPopup({ show: true, message: err.response?.data?.message || "Failed to change phone number", type: "error" });
    } finally {
      setLoading(false);
      setTimeout(() => setPopup({ ...popup, show: false }), 2000);
    }
  };

  return (
    <AdminNavigation>
      <div className="flex-col items-center justify-center min-h-[calc(100vh-5rem)] md:min-h-[calc(100vh-2rem)]">
        <div className="relative max-w-md w-full mt-12 overflow-hidden">
          {/* Card Glow/Lighting Effect */}
          <div className="absolute -inset-1 bg-gradient-to-br from-pink-400/40 via-purple-400/30 to-indigo-400/40 blur-2xl opacity-80 animate-pulse z-0" />
          <div className="relative z-10 rounded-3xl shadow-2xl border border-white/30 bg-white/90 backdrop-blur-xl p-8">
            {/* Card Header */}
            <div className="flex flex-col items-center mb-6">
              <div className="flex items-center gap-2">
                <div className="bg-pink-100 text-pink-600 rounded-full p-2 shadow-md">
                  <Phone size={28} />
                </div>
                <h2 className="text-2xl font-bold text-black font-poppins">Change Phone Number</h2>
              </div>
            </div>
            {/* Current Phone Number Display */}
            <div className="flex flex-col items-center mb-6">
              <div className="w-full flex justify-center">
                <div className="px-6 py-2 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-semibold text-lg shadow-xl animate-pulse mb-2 text-center border-2 border-white/30 drop-shadow-lg"
                  style={{ minWidth: '180px' }}>
                  {loading ? (
                    <span className="opacity-70">Loading...</span>
                  ) : (
                    <span className="drop-shadow">{currentPhone ? `Current: ${currentPhone}` : "No phone number set"}</span>
                  )}
                </div>
              </div>
            </div>
            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-gray-700 font-medium mb-1 font-poppins">New Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-gray-300 focus:ring-2 focus:ring-pink-400 focus:outline-none text-black bg-white shadow focus:shadow-pink-200 transition font-poppins"
                  placeholder="Enter new phone number"
                  disabled={loading}
                />
              </div>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-semibold py-3 rounded-2xl shadow-lg hover:opacity-90 transition font-poppins focus:ring-2 focus:ring-pink-400 focus:outline-none disabled:opacity-60"
                disabled={loading}
              >
                <span className="drop-shadow">{loading ? "Processing..." : "Change Number"}</span>
              </button>
            </form>
            {/* Animated Popup */}
            {popup.show && (
              <div className={`fixed left-1/2 top-8 transform -translate-x-1/2 z-50 transition-all duration-300 ${popup.type === "success" ? "bg-green-500" : "bg-red-500"} text-white px-6 py-3 rounded-xl shadow-lg animate-fade-in-out`}
                style={{ minWidth: '220px', textAlign: 'center' }}>
                {popup.message}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminNavigation>
  );
}
