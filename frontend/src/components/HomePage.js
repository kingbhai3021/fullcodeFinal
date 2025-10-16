import React, { useEffect, useState } from "react";
import AdminNavigation from "./AdminNavigation";
import { Database, Smartphone, MessageSquare } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import API_URL from "../apiConfig";

export default function HomePage() {
  const [dashboard, setDashboard] = useState({ toataldata: 0, totaldevices: 0, totalmessages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await axios.get(`${API_URL}/dashboard`, { withCredentials: true });
        setDashboard(res.data || { toataldata: 0, totaldevices: 0, totalmessages: 0 });
      } catch (err) {
        setError("Failed to fetch dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  return (
    <AdminNavigation>
      <div className="max-w-7xl mx-auto py-8 px-4">
        <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-2">Welcome, Admin!</h2>
        <br />
        {error && <div className="text-red-500 mb-4">{error}</div>}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Total Records - Clickable */}
          <div
            className="bg-white/90 rounded-2xl shadow-lg p-6 flex items-center gap-4 cursor-pointer hover:scale-[1.03] hover:shadow-xl transition"
            onClick={() => navigate('/data')}
            title="View Data"
          >
            <div className="bg-indigo-100 text-indigo-600 rounded-full p-3">
              <Database size={28} />
            </div>
            <div>
              <div className="text-2xl font-bold">{loading ? '--' : dashboard.toataldata}</div>
              <div className="text-gray-600">Total Records</div>
            </div>
          </div>
          {/* Devices - Clickable */}
          <div
            className="bg-white/90 rounded-2xl shadow-lg p-6 flex items-center gap-4 cursor-pointer hover:scale-[1.03] hover:shadow-xl transition"
            onClick={() => navigate('/devices')}
            title="View Devices"
          >
            <div className="bg-purple-100 text-purple-600 rounded-full p-3">
              <Smartphone size={28} />
            </div>
            <div>
              <div className="text-2xl font-bold">{loading ? '--' : dashboard.totaldevices}</div>
              <div className="text-gray-600">Devices Connected</div>
            </div>
          </div>
          {/* Messages - Clickable */}
          <div
            className="bg-white/90 rounded-2xl shadow-lg p-6 flex items-center gap-4 cursor-pointer hover:scale-[1.03] hover:shadow-xl transition"
            onClick={() => navigate('/messages')}
            title="View Messages"
          >
            <div className="bg-blue-100 text-blue-600 rounded-full p-3">
              <MessageSquare size={28} />
            </div>
            <div>
              <div className="text-2xl font-bold">{loading ? '--' : dashboard.totalmessages}</div>
              <div className="text-gray-600">Messages Sent</div>
            </div>
          </div>
        </div>
        {/* Add more dashboard content here as needed */}
      </div>
    </AdminNavigation>
  );
}
