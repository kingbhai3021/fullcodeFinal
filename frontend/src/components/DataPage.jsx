import React, { useState, useEffect } from "react";
import AdminNavigation from "./AdminNavigation";
import Cookies from "js-cookie";
import { Eye, X, Trash2 } from "lucide-react";
import axios from "axios";
import API_URL from "../apiConfig";


export default function DataPage() {
  const [data, setData] = useState([]);
  const [popup, setPopup] = useState({ show: false, item: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await axios.get(`${API_URL}/getData`, { withCredentials: true });
        setData(res.data || []);
      } catch (err) {
        setError("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <AdminNavigation>
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3 mb-6">
          {/* <h2 className="text-2xl font-bold text-white">Data Page</h2> */}
          <div className="flex-1 flex justify-end items-center gap-2 mt-2 sm:mt-0">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search data..."
              className="w-full sm:w-64 px-4 py-2 rounded-xl border border-white focus:ring-2 focus:ring-indigo-400 focus:outline-none shadow-sm text-sm bg-white"
            />
          </div>
        </div>
        {error && <div className="text-red-500 mb-4">{error}</div>}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full text-center py-12 text-gray-400 text-lg">Loading data...</div>
          ) : data.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-400 text-lg">No data found.</div>
          ) : (
            data
              .filter(item => {
                const q = search.toLowerCase();
                // If "data" is in the search, always show all
                if (q.includes('data')) return true;
                return (
                  (item.id || item.formId || item._id || '').toLowerCase().includes(q) ||
                  (item.name || '').toLowerCase().includes(q) ||
                  (item.value || '').toLowerCase().includes(q)
                );
              })
              .map((item, idx) => (
                <div
                  key={item.id || item.formId || item._id}
                  className="rounded-2xl shadow-lg p-4 bg-white/90 border border-indigo-100 hover:scale-[1.02] transition-transform relative flex flex-col gap-2"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded mr-2">#{data.length - idx}</span>
                    <span className="text-xs font-bold text-indigo-600 truncate max-w-[90px]">{item.id || item.formId || item._id}</span>
                    {item.createdAt && (
                      <span className="ml-auto text-xs bg-indigo-50 border border-indigo-200 text-indigo-700 px-2 py-0.5 rounded shadow">
                        {new Date(item.createdAt).toLocaleDateString()} {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                      </span>
                    )}
                    <button
                      className="ml-2 p-1 rounded-full bg-red-100 hover:bg-red-200 text-red-600 transition"
                      title="Delete"
                      onClick={async (e) => {
                        e.stopPropagation();
                        if (!window.confirm("Are you sure you want to delete this data?")) return;
                        try {
                          await axios.delete(`${API_URL}/deleteData/${item._id}`, { withCredentials: true });
                          setData((prev) => prev.filter((d) => (d._id || d.id || d.formId) !== (item._id || item.id || item.formId)));
                        } catch (err) {
                          alert("Failed to delete data.");
                        }
                      }}
                    >
                      <Trash2 size={18} />
                    </button>
                    <button
                      className="ml-2 text-indigo-500 hover:text-pink-500 transition"
                      onClick={() => setPopup({ show: true, item })}
                      title="View Details"
                    >
                      <Eye size={22} />
                    </button>
                  </div>
                  <div className="text-sm text-gray-700 mb-1 break-words">
                    <span className="font-semibold text-pink-600">Name:</span> {item.name}
                  </div>
                  <div className="text-xs text-black mb-2 break-words max-h-20 overflow-y-auto">
                    <span className="font-semibold text-indigo-600">Value:</span> {item.value}
                  </div>
                </div>
              ))
          )}
        </div>

        {/* Popup for full data */}
        {popup.show && popup.item && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-2xl shadow-2xl p-4 w-[95vw] max-w-md relative animate-fade-in">
              <button
                className="absolute top-3 right-3 text-gray-400 hover:text-pink-500"
                onClick={() => setPopup({ show: false, item: null })}
                title="Close"
              >
                <X size={24} />
              </button>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold text-indigo-600 truncate max-w-[90px]">{popup.item.id || popup.item.formId || popup.item._id}</span>
                <span className="ml-auto text-xs text-gray-400">
                  {popup.item.CreatedAt ? new Date(popup.item.CreatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) : ''}
                </span>
              </div>
              <div className="text-gray-700 mb-1"><span className="font-semibold text-pink-600">Name:</span> {popup.item.name}</div>
              <div className="text-gray-500 mb-2"><span className="font-semibold text-indigo-600">Value:</span> {popup.item.value}</div>
              {popup.item.details && (
                <div className="mt-2 p-3 rounded-xl bg-indigo-50 border border-indigo-200">
                  <div className="font-semibold text-indigo-700 mb-1">Details:</div>
                  {popup.item.details.map((d, i) => (
                    <div key={i} className="text-sm text-gray-700 mb-1">
                      <span className="font-medium">{d.label}:</span> {d.value}
                    </div>
                  ))}
                </div>
              )}
              {/* Show all other fields if present */}
              <div className="mt-4">
                {Object.entries(popup.item).map(([key, value]) => (
                  ["id", "formId", "_id", "name", "value", "details"].includes(key) ? null : (
                    <div key={key} className="text-xs text-gray-500 mb-1">
                      <span className="font-semibold">{key}:</span> {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                    </div>
                  )
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminNavigation>
  );
}
