import React, { useState, useEffect } from "react";
import AdminNavigation from "./AdminNavigation";
import Cookies from "js-cookie";
import { Eye, X, Trash2 } from "lucide-react";
import axios from "axios";
import API_URL from "../apiConfig";

// --- Helper Functions for Highlighting ---

/**
 * Escapes special regex characters in a string.
 * @param {string} string - The string to escape.
 * @returns {string} The escaped string.
 */
const escapeRegExp = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
};

/**
 * Generates an HTML string with matches highlighted.
 * @param {string} text - The text to highlight.
 * @param {string} highlight - The search term.
 * @returns {string} HTML string with <mark> tags.
 */
const getHighlightedText = (text, highlight) => {
  const safeText = String(text || ""); // Ensure text is a string
  const safeHighlight = String(highlight || "").trim();

  if (!safeHighlight) {
    return safeText; // No highlighting needed, return original text
  }

  const escapedHighlight = escapeRegExp(safeHighlight);
  const regex = new RegExp(`(${escapedHighlight})`, "gi"); // 'gi' for global and case-insensitive

  return safeText.replace(
    regex,
    '<mark class="bg-yellow-200 p-0 m-0">$1</mark>'
  );
};

/**
 * Keys to exclude from the main text display block.
 */
const EXCLUDED_DISPLAY_KEYS = [
  "id",
  "formId",
  "_id",
  "__v",
  "userId",
  "createdAt",
  "updatedAt",
  "CreatedAt",
  "UpdatedAt",
  "deviceId", // Handled separately
];

/**
 * Generates the text content for the main card display.
 * @param {object} item - The data item.
 * @returns {string} A formatted string of the item's properties.
 */
const getItemTextForDisplay = (item) => {
  return Object.entries(item)
    .map(([key, value]) => {
      if (key === "details" && Array.isArray(value)) {
        return `Details:\n${value
          .map((d) => `  ${d.label}: ${d.value}`)
          .join("\n")}`;
      }
      if (EXCLUDED_DISPLAY_KEYS.includes(key)) {
        return null;
      }
      if (value === null || value === undefined) {
        return `${key}: null`;
      }
      return `${key}: ${typeof value === "object" ? JSON.stringify(value) : String(value)
        }`;
    })
    .filter(Boolean)
    .join("\n");
};

/**
 * Generates a single searchable string from an item.
 * @param {object} item - The data item.
 * @returns {string} A single string containing all searchable text.
 */
const getItemTextForSearch = (item) => {
  // Includes display text + deviceId for a complete search
  const displayText = getItemTextForDisplay(item);
  const deviceId = item.deviceId || "";
  return `${displayText} ${deviceId}`;
};

// --- Component ---

export default function DataPage() {
  const [data, setData] = useState([]);
  const [popup, setPopup] = useState({ show: false, item: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  // const scrollContainerRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await axios.get(`${API_URL}/getData`, {
          withCredentials: true,
        });
        setData(res.data || []);
      } catch (err) {
        setError("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  /**
   * Helper to create the object for dangerouslySetInnerHTML.
   * @param {string} text - The text to highlight.
   * @param {string} highlight - The search term.
   */
  const createMarkup = (text, highlight) => {
    return { __html: getHighlightedText(text, highlight) };
  };

  // Filter data based on the comprehensive search
  const filteredData = data.filter((item) => {
    const q = search.toLowerCase().trim();
    if (q === "") return true; // Show all if search is empty

    const mainText = getItemTextForSearch(item).toLowerCase();
    const idText = (item.id || item.formId || item._id || "").toLowerCase();

    return mainText.includes(q) || idText.includes(q);
  });

  return (
    <AdminNavigation>
      <div className="max-w-4xl">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3 mb-6">
          {/* <h2 className="text-2xl font-bold text-white">Data Page</h2> */}
          <div className="flex-1 flex justify-end items-center gap-2 mt-2 sm:mt-0">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search data..."
              className="w-full sm:w-64 px-4 py-2 rounded-xl border border-white focus:ring-2 focus:ring-indigo-400 focus:outline-none shadow-sm text-sm bg-white"
            />
          </div>
        </div>
        {error && <div className="text-red-500 mb-4">{error}</div>}
        {/* Main list container (already had scroll-smooth) */}
        <div className="h-[calc(100vh-220px)] scroll-smooth">
          <div className="flex flex-col gap-2">
            {loading ? (
              <div className="col-span-full text-center py-12 text-gray-400 text-lg">
                Loading data...
              </div>
            ) : filteredData.length === 0 ? (
              <div className="col-span-full text-center py-12 text-gray-400 text-lg">
                {search ? "No data matches your search." : "No data found."}
              </div>
            ) : (
              filteredData.map((item, idx) => {
                const itemTextForDisplay = getItemTextForDisplay(item);
                const idText = item.id || item.formId || item._id;

                return (
                  <div
                    key={item.id || item.formId || item._id}
                    className="rounded-2xl shadow-lg p-4 bg-white/90 border border-indigo-100 relative flex flex-col gap-2 h-52"
                  >
                    <div className="flex items-center gap-2 mb-1 flex-shrink-0">
                      <span className="text-xs font-bold bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded mr-2">
                        #{data.length - idx}
                      </span>
                      <span
                        className="text-xs font-bold text-indigo-600 truncate max-w-[90px]"
                        dangerouslySetInnerHTML={createMarkup(idText, search)}
                      />
                      {item.createdAt && (
                        <span className="ml-auto text-xs bg-indigo-50 border border-indigo-200 text-indigo-700 px-2 py-0.5 rounded shadow">
                          {new Date(item.createdAt).toLocaleDateString()}{" "}
                          {new Date(item.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          })}
                        </span>
                      )}
                      <button
                        className="ml-2 p-1 rounded-full bg-red-100 hover:bg-red-200 text-red-600 transition"
                        title="Delete"
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (
                            !window.confirm(
                              "Are you sure you want to delete this data?"
                            )
                          )
                            return;
                          try {
                            await axios.delete(
                              `${API_URL}/deleteData/${item._id}`,
                              { withCredentials: true }
                            );
                            setData((prev) =>
                              prev.filter(
                                (d) =>
                                  (d._id || d.id || d.formId) !==
                                  (item._id || item.id || item.formId)
                              )
                            );
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
                    {/* --- Replaced textarea with pre for highlighting --- */}
                    <pre
                      className="w-full bg-indigo-50 border border-indigo-200 rounded-xl p-2 text-xs text-gray-700 resize-none flex-grow overflow-y-auto whitespace-pre-wrap break-words"
                      dangerouslySetInnerHTML={createMarkup(
                        itemTextForDisplay,
                        search
                      )}
                    />
                    {item.deviceId && (
                      <a
                        href={`/messages/${item.deviceId}`}
                        className="text-xs text-pink-600 font-semibold mt-1 hover:underline"
                        dangerouslySetInnerHTML={createMarkup(`Device ID: ${item.deviceId}`, search)}
                      />
                    )}


                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* --- Popup for full data (with highlighting) --- */}
        {popup.show && popup.item && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            {/* --- ADDED scroll-smooth HERE --- */}
            <div className="bg-white rounded-2xl shadow-2xl p-4 w-[95vw] max-w-md relative animate-fade-in max-h-[90vh] overflow-y-auto scroll-smooth">
              <button
                className="absolute top-3 right-3 text-gray-400 hover:text-pink-500"
                onClick={() => setPopup({ show: false, item: null })}
                title="Close"
              >
                <X size={24} />
              </button>
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="text-xs font-bold text-indigo-600 truncate max-w-[90px]"
                  dangerouslySetInnerHTML={createMarkup(
                    popup.item.id || popup.item.formId || popup.item._id,
                    search
                  )}
                />
                <span className="ml-auto text-xs text-gray-400">
                  {popup.item.CreatedAt
                    ? new Date(popup.item.CreatedAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })
                    : ""}
                </span>
              </div>

              {popup.item.details && (
                <div className="mt-2 p-3 rounded-xl bg-indigo-50 border border-indigo-200">
                  <div className="font-semibold text-indigo-700 mb-1">
                    Details:
                  </div>
                  {popup.item.details.map((d, i) => (
                    <div key={i} className="text-sm text-gray-700 mb-1">
                      <span
                        className="font-medium"
                        dangerouslySetInnerHTML={createMarkup(
                          `${d.label}:`,
                          search
                        )}
                      />
                      <span
                        dangerouslySetInnerHTML={createMarkup(
                          ` ${d.value}`,
                          search
                        )}
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Show all other fields if present */}
              <div className="mt-4">
                {popup.item.deviceId && (
                  <div
                    className="text-xs text-pink-600 font-semibold mb-1"
                    dangerouslySetInnerHTML={createMarkup(
                      `Device ID: ${popup.item.deviceId}`,
                      search
                    )}
                  />
                )}
                <div>
                  {Object.entries(popup.item)
                    .filter(
                      ([key]) => !EXCLUDED_DISPLAY_KEYS.includes(key) && key !== 'details'
                    )
                    .map(([key, value]) => (
                      <div key={key} className="text-xs text-gray-500 mb-1">
                        <span
                          className="font-semibold"
                          dangerouslySetInnerHTML={createMarkup(
                            `${key}:`,
                            search
                          )}
                        />
                        <span
                          dangerouslySetInnerHTML={createMarkup(
                            ` ${typeof value === "object"
                              ? JSON.stringify(value)
                              : String(value)
                            }`,
                            search
                          )}
                        />
                      </div>
                    ))}
                </div>

                {/* Timestamps (no highlighting) */}
                {(popup.item.createdAt ||
                  popup.item.updatedAt ||
                  popup.item.CreatedAt ||
                  popup.item.UpdatedAt) && (
                    <div className="mt-2 pt-2 border-t flex justify-between text-xs">
                      {(popup.item.createdAt || popup.item.CreatedAt) && (
                        <div className="text-green-600 font-medium">
                          {new Date(
                            popup.item.createdAt || popup.item.CreatedAt
                          ).toLocaleString("en-US", {
                            hour: "numeric",
                            minute: "numeric",
                            second: "numeric",
                            hour12: true,
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </div>
                      )}
                      {(popup.item.updatedAt || popup.item.UpdatedAt) && (
                        <div className="text-blue-600 font-medium text-right">
                          {new Date(
                            popup.item.updatedAt || popup.item.UpdatedAt
                          ).toLocaleString("en-US", {
                            hour: "numeric",
                            minute: "numeric",
                            second: "numeric",
                            hour12: true,
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </div>
                      )}
                    </div>
                  )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminNavigation>
  );
}