import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { motion, AnimatePresence } from "framer-motion";
import {
    Database,
    Phone,
    MessageSquare,
    Smartphone,
    Settings,
    Menu,
    X,
    User,
    LogOut,
} from "lucide-react";

const menuItems = [
    { name: "Dashboard", link: "/home", icon: User },
    { name: "Change Number", link: "/change-number", icon: Phone },
    { name: "Data", link: "/data", icon: Database },
    { name: "Messages", link: "/messages", icon: MessageSquare },
    { name: "Devices", link: "/devices", icon: Smartphone },
    { name: "Settings", link: "/settings", icon: Settings },
];

export default function AdminNavigation({ children }) {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    // Redirect to login if no token
    useEffect(() => {
        const token = Cookies.get("token");
        console.log("Token:", token);
        if (!token) {
            navigate("/", { replace: true });
        }
    }, [navigate]);

    return (
        <div className="flex min-h-screen bg-gradient-to-r from-indigo-800 via-purple-800 to-pink-700">
            {/* Sidebar for Desktop */}
            <aside className="hidden md:flex flex-col w-72 bg-white/95 backdrop-blur-2xl shadow-2xl border-r border-gray-200">
                {/* Profile Section */}
                <div className="mt-2 flex flex-col items-center py-8 border-b border-gray-200">
                    <div className="font-semibold text-lg text-white">Admin User</div>
                    <div className="text-xs text-gray-500">admin@example.com</div>
                </div>
                {/* Navigation Section */}
                <nav className="flex flex-col p-6 space-y-2 flex-1">
                    <div className="text-xs font-bold text-gray-400 uppercase mb-2 tracking-widest">Main</div>
                    {menuItems.slice(0, 4).map((item) => (
                        <Link
                            key={item.link}
                            to={item.link}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                                location.pathname === item.link
                                    ? "bg-gradient-to-r from-indigo-500 to-pink-500 text-white shadow-lg"
                                    : "text-gray-700 hover:bg-gradient-to-r hover:from-indigo-500 hover:to-pink-500 hover:text-white"
                            }`}
                        >
                            <item.icon size={20} />
                            {item.name}
                        </Link>
                    ))}
                    <div className="border-t border-gray-200 my-4" />
                    <div className="text-xs font-bold text-gray-400 uppercase mb-2 tracking-widest">Settings</div>
                    {menuItems.slice(4).map((item) => (
                        <Link
                            key={item.link}
                            to={item.link}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                                location.pathname === item.link
                                    ? "bg-gradient-to-r from-indigo-500 to-pink-500 text-white shadow-lg"
                                    : "text-gray-700 hover:bg-gradient-to-r hover:from-indigo-500 hover:to-pink-500 hover:text-white"
                            }`}
                        >
                            <item.icon size={20} />
                            {item.name}
                        </Link>
                    ))}
                    <div className="flex-1" />
                    <button
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-500 hover:text-red-600 hover:bg-red-100 transition mt-8"
                        onClick={() => {
                            Cookies.remove("token");
                            navigate("/", { replace: true });
                        }}
                    >
                        <LogOut size={20} /> Logout
                    </button>
                </nav>
            </aside>

            {/* Mobile Top Navbar */}
            <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-2xl shadow-md flex flex-col items-center px-0 py-0 border-b border-gray-200">
                <div className="flex w-full justify-between items-center px-6 py-3">
                    <button onClick={() => setIsOpen(!isOpen)} className="p-2">
                        {isOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                    <div className="flex items-center gap-3">
                        <span className="font-semibold text-indigo-700">David Panel</span>
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-pink-500 flex items-center justify-center text-white text-xl font-bold shadow">
                            <User size={22} />
                        </div>
                    </div>
                    
                </div>
            </div>

            {/* ✅ Mobile Bottom Navigation */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-lg rounded-t-2xl flex justify-around items-center py-2 px-2">
                {menuItems.slice(0, 5).map((item) => (
                    <Link
                        key={item.link}
                        to={item.link}
                        className={`flex flex-col items-center justify-center px-2 py-1 rounded-xl transition-all duration-200 ${
                            location.pathname === item.link
                                ? "bg-white/90 text-indigo-700 shadow-lg scale-110"
                                : "text-white hover:bg-white/30 hover:text-indigo-900"
                        }`}
                        style={{ minWidth: 60 }}
                    >
                        <item.icon size={24} />
                        <span className="text-xs font-semibold mt-1">{item.name.split(" ")[0]}</span>
                    </Link>
                ))}
            </div>

            {/* Mobile Menu Drawer */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ x: "-100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "-100%" }}
                        transition={{ type: "spring", stiffness: 80 }}
                        className="fixed top-0 left-0 bottom-0 w-72 bg-white/95 backdrop-blur-2xl shadow-2xl z-40 p-6"
                    >
                        <div className="flex flex-col items-center mb-6">
                            <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-indigo-500 to-pink-500 flex items-center justify-center text-white text-2xl font-bold shadow mb-1">
                                <User size={28} />
                            </div>
                            <div className="font-semibold text-base text-white">Admin User</div>
                            <div className="text-xs text-gray-500">admin@example.com</div>
                        </div>
                        <nav className="flex flex-col space-y-2">
                            <div className="text-xs font-bold text-gray-400 uppercase mb-2 tracking-widest">Main</div>
                            {menuItems.slice(0, 5).map((item) => (
                                <Link
                                    key={item.link}
                                    to={item.link}
                                    onClick={() => setIsOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                                        location.pathname === item.link
                                            ? "bg-gradient-to-r from-indigo-500 to-pink-500 text-white shadow-lg"
                                            : "text-gray-700 hover:bg-gradient-to-r hover:from-indigo-500 hover:to-pink-500 hover:text-white"
                                    }`}
                                >
                                    <item.icon size={20} />
                                    {item.name}
                                </Link>
                            ))}
                            <div className="border-t border-gray-200 my-4" />
                            <div className="text-xs font-bold text-gray-400 uppercase mb-2 tracking-widest">Settings</div>
                            {menuItems.slice(5).map((item) => (
                                <Link
                                    key={item.link}
                                    to={item.link}
                                    onClick={() => setIsOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                                        location.pathname === item.link
                                            ? "bg-gradient-to-r from-indigo-500 to-pink-500 text-white shadow-lg"
                                            : "text-gray-700 hover:bg-gradient-to-r hover:from-indigo-500 hover:to-pink-500 hover:text-white"
                                    }`}
                                >
                                    <item.icon size={20} />
                                    {item.name}
                                </Link>
                            ))}
                            <button
                                className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-500 hover:text-red-600 hover:bg-red-100 transition mt-8"
                                onClick={() => {
                                    Cookies.remove("token");
                                    navigate("/", { replace: true });
                                }}
                            >
                                <LogOut size={20} /> Logout
                            </button>
                        </nav>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <main className="flex-1 p-6 mt-10 md:mt-0 mb-16 overflow-x-auto w-full bg-transparent">
                {children}
            </main>
        </div>
    );
}
