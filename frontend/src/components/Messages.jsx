import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import AdminNavigation from "./AdminNavigation";
import axios from "axios";
import { MessageSquare, Trash2, Send, User2, Eye} from "lucide-react";
import API_URL from "../apiConfig";

export default function Messages() {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [toNumber, setToNumber] = useState("");
    const [search, setSearch] = useState("");
    const [popup, setPopup] = useState({ show: false, message: "", type: "success" });
    const intervalRef = useRef();
    const { deviceId } = useParams();

    const [device, setDevice] = useState(null);
    const [fromNumber, setFromNumber] = useState(""); // This state doesn't seem to be used, but we'll leave it
    const [simSlot, setSimSlot] = useState("");
    const [smsMessage, setSmsMessage] = useState("");
    const [sending, setSending] = useState(false);

    // Delete all messages
    const handleDeleteAll = async () => {
        if (!window.confirm("Are you sure you want to delete all messages?")) return;
        try {
            setLoading(true);
            setError("");
            const url = deviceId
                ? `${API_URL}/deleteAllMessages/${deviceId}`
                : `${API_URL}/deleteAllMessages`;
            await axios.delete(url, { withCredentials: true });
            setMessages([]);
            showPopup("All messages deleted!", "success");
        } catch (err) {
            showPopup("Failed to delete messages", "error");
            setError("Failed to delete messages");
        } finally {
            setLoading(false);
        }
    };

    // Fetch messages periodically
    useEffect(() => {
        const fetchMessages = async () => {
            try {
                setError("");
                let url = deviceId
                    ? `${API_URL}/getMessages/${deviceId}`
                    : `${API_URL}/getMessages`;
                const res = await axios.get(url, { withCredentials: true });
                setMessages(res.data?.allMessages || []);
            } catch (err) {
                setError("Failed to fetch messages");
            } finally {
                setLoading(false);
            }
        };
        fetchMessages();
        intervalRef.current = setInterval(fetchMessages, 2500);
        return () => clearInterval(intervalRef.current);
    }, [deviceId]);

    // Fetch device info
    useEffect(() => {
        if (!deviceId) return;
        axios.get(`${API_URL}/getDevice/${deviceId}`, { withCredentials: true })
            .then(res => {
                const d = res.data || {};
                // ensure simSlotCount at least 1 for safety
                setDevice({
                    slot1Number: d.slot1Number || "",
                    slot2Number: d.slot2Number || "",
                    simSlotCount: d.simSlotCount || 1,
                });
            })
            .catch(() => setDevice({ slot1Number: "", slot2Number: "", simSlotCount: 1 }));
    }, [deviceId]);

    // Send SMS
    const handleSendSMS = async (e) => {
        e.preventDefault();
        if (!toNumber || !simSlot || !smsMessage) {
            showPopup("Please fill all fields", "error");
            return;
        }
        setSending(true);
        try {
            await axios.post(`${API_URL}/sendsms`, {
                deviceId,
                toNumber,
                message: smsMessage,
                simSlot
            }, { withCredentials: true });
            setSmsMessage("");
            setToNumber("");
            showPopup("SMS sent!", "success");
        } catch {
            showPopup("Failed to send SMS", "error");
        }
        setSending(false);
    };

    const showPopup = (message, type) => {
        setPopup({ show: true, message, type });
        setTimeout(() => setPopup((p) => ({ ...p, show: false })), 2000);
    };

    // Search filter
    const filteredMessages = messages.filter(msg => {
        const q = search.toLowerCase();
        return (
            msg.message?.toLowerCase().includes(q) ||
            msg.sender?.toLowerCase().includes(q) ||
            msg.deviceId?.toLowerCase().includes(q) ||
            msg.sim_number?.toLowerCase().includes(q)
        );
    });

    // --- HELPER FUNCTION TO HIGHLIGHT SEARCH TERM ---
    const highlightText = (text, highlight) => {
        // If no highlight, or text isn't a string, return original text
        if (!highlight.trim() || typeof text !== 'string') {
            return text;
        }

        // Escape regex special characters in the highlight string
        const escapedHighlight = highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        // Create regex with capturing group and case-insensitive flag
        const regex = new RegExp(`(${escapedHighlight})`, 'gi');

        // Split the text by the regex. The capturing group ensures matches are kept in the array.
        const parts = text.split(regex);

        return (
            <> {/* Use React Fragment to avoid unnecessary wrapper elements */}
                {parts.map((part, index) =>
                    // Check if the part matches the highlight (case-insensitive)
                    part.toLowerCase() === highlight.toLowerCase() ? (
                        <mark key={index} className="bg-yellow-300 text-black px-0.5 rounded-sm">
                            {part}
                        </mark>
                    ) : (
                        // Otherwise, return the part as plain text
                        part
                    )
                )}
            </>
        );
    };
    // --- END HELPER FUNCTION ---

    return (
        <AdminNavigation>
            <div className="relative h-[calc(100vh-5rem)] md:h-[calc(100vh-2rem)] max-w-6xl mx-auto flex flex-col">

                {/* SMS Sending Form */}
                {deviceId && (
                    <form
                        onSubmit={handleSendSMS}
                        className="p-4 rounded-2xl shadow-lg bg-gradient-to-br from-white/90 via-indigo-50 to-pink-50 border border-indigo-100 flex flex-col gap-4 mb-4"
                        style={{ maxWidth: 480 }}
                    >
                        {/* To Number */}
                        <div className="flex flex-col">
                            <label className="text-xs font-bold text-pink-700 mb-1 flex items-center gap-1">
                                <User2 size={15} className="text-pink-500" />
                                To Number
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={toNumber}
                                    onChange={e => setToNumber(e.target.value)}
                                    placeholder="Recipient number"
                                    className="border border-pink-200 rounded-md px-8 py-2 text-sm focus:ring-2 focus:ring-pink-200 focus:outline-none w-full bg-white"
                                    required
                                />
                                <User2 size={16} className="absolute left-2 top-1/2 -translate-y-1/2 text-pink-400" />
                            </div>
                        </div>

                        {/* Message */}
                        <div className="flex flex-col">
                            <label className="text-xs font-bold text-indigo-700 mb-1 flex items-center gap-1">
                                <MessageSquare size={15} className="text-indigo-400" />
                                Message
                            </label>
                            <textarea
                                value={smsMessage}
                                onChange={e => setSmsMessage(e.target.value)}
                                rows={4}
                                placeholder="Type your message..."
                                className="border border-indigo-200 rounded-md px-2 py-2 text-sm focus:ring-2 focus:ring-indigo-200 focus:outline-none resize-none bg-white"
                                required
                            />
                        </div>

                        {/* SIM & Send in one row */}
                        <div className="flex items-end gap-3">
                            {/* SIM Slot */}
                            <div className="flex flex-col flex-1">
                                <label className="text-xs font-bold text-indigo-700 mb-1 flex items-center gap-1">
                                    <MessageSquare size={16} className="text-indigo-500" />
                                    SIM Slot
                                </label>
                                <select
                                    value={simSlot}
                                    onChange={e => setSimSlot(e.target.value)}
                                    className="border border-indigo-200 rounded-md px-2 py-2 text-sm focus:ring-2 focus:ring-indigo-300 focus:outline-none bg-white"
                                    required
                                >
                                    <option value="">Select</option>

                                    <option value="1">
                                        SIM 1{device?.slot1Number ? ` (${device.slot1Number})` : ""}
                                    </option>

                                    <option value="2">
                                        SIM 2{device?.slot2Number ? ` (${device.slot2Number})` : ""}
                                    </option>
                                </select>

                            </div>

                            {/* Send Button */}
                            <button
                                type="submit"
                                className="flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 via-pink-400 to-pink-500 hover:from-indigo-600 hover:to-pink-600 text-white text-sm font-bold px-5 py-2 rounded-xl shadow transition disabled:opacity-50"
                                disabled={sending}
                            >
                                <Send size={17} className="mb-0.5" />
                                {sending ? "Sending..." : "Send"}
                            </button>
                        </div>
                    </form>
                )}

                {/* Header + Search */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3 mb-6">
                    {/* <div className="flex items-center gap-3">
                        <div className="bg-blue-100 text-blue-600 rounded-full p-2">
                            <MessageSquare size={28} />
                        </div>
                        <h2 className="text-2xl font-bold text-white">Messages</h2>
                    </div> */}
                    <div className="flex-1 flex justify-end items-center gap-2 mt-2 sm:mt-0">
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search messages..."
                            className="w-full sm:w-64 px-4 py-2 rounded-xl border border-white focus:ring-2 focus:ring-blue-400 focus:outline-none shadow-sm text-sm bg-white"
                        />
                        <button
                            title="Delete all messages"
                            onClick={handleDeleteAll}
                            className="ml-2 p-2 rounded-full bg-red-100 hover:bg-red-200 text-red-600 shadow transition disabled:opacity-50"
                            disabled={loading || messages.length === 0}
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                </div>

                {/* Messages List */}
                <div className="overflow-y-auto flex-grow pb-4 pr-1 scroll-smooth">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                        {loading ? (
                            <div className="col-span-full text-center py-12 text-gray-400 text-lg">Loading messages...</div>
                        ) : error ? (
                            <div className="col-span-full text-center py-12 text-red-400 text-lg">{error}</div>
                        ) : filteredMessages.length === 0 ? (
                            <div className="col-span-full text-center py-12 text-gray-400 text-lg">No messages found.</div>
                        ) : (
                            filteredMessages.map((msg, idx) => (
                                <div
                                    key={msg._id || idx}
                                    className="rounded-2xl shadow-lg p-4 bg-gradient-to-br from-white/90 via-indigo-50 to-pink-50 border border-indigo-100"
                                >
                                    <div className="flex items-center gap-1 mb-2">
                                        <span className="text-xs font-bold text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded mr-2">#{msg.msgcount}</span>
                                        {/* --- MODIFIED --- */}
                                        <a
                                            href={`/messages/${msg.deviceId}`}
                                        >
                                            <span className="flex items-center gap-1 text-xs font-bold text-indigo-600 m-auto">
                                                {/* <User2 size={15} className="text-pink-500" /> */}
                                                <Eye size={15} className="text-gray-500 cursor-pointer hover:text-indigo-600" />
                                                <span>{highlightText(msg.deviceId, search)}</span>
                                            </span>
                                        </a>

                                        <span className="ml-auto text-xs text-gray-400 text-right">
                                            {msg.CreateAt ? `${new Date(msg.CreateAt).toLocaleDateString()} ${new Date(msg.CreateAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}` : ""}
                                        </span>
                                    </div>
                                    {/* --- MODIFIED --- */}
                                    <div className="text-sm text-gray-700 mb-1 break-words">
                                        <span className="font-semibold text-pink-600">From:</span> {highlightText(msg.sender, search)}
                                    </div>
                                    {/* --- MODIFIED --- */}
                                    <div className="text-xs text-black mb-2 break-words">
                                        {highlightText(msg.message, search)}
                                    </div>
                                    <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                                        {/* --- MODIFIED --- */}
                                        <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded">
                                            SIM: {highlightText(msg.sim_number, search)}
                                        </span>
                                        <span className="bg-pink-100 text-pink-700 px-2 py-0.5 rounded">
                                            Slot: {msg.sim_slot}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Popup */}
                {popup.show && (
                    <div className={`fixed left-1/2 top-8 transform -translate-x-1/2 z-50 transition-all duration-300 ${popup.type === "success" ? "bg-green-500" : "bg-red-500"} text-white px-6 py-3 rounded-xl shadow-lg animate-fade-in-out`}
                        style={{ minWidth: '220px', textAlign: 'center' }}>
                        {popup.message}
                    </div>
                )}
            </div>
        </AdminNavigation>
    );
}
