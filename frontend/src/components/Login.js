
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import "./globals.css"; // make sure fonts + animations are imported
import API_URL from "../apiConfig";


export default function Login() {

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [popup, setPopup] = useState({ show: false, type: '', message: '' });
  const navigate = useNavigate();

  // Redirect to /home if token exists
  useEffect(() => {
    console.log("API URL:", API_URL);
    const token = Cookies.get('token');
    console.log("Token on Login Page:", token);
    if (token) {
      navigate('/home', { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPopup({ show: false, type: '', message: '' });
    try {
      const res = await axios.post(`${API_URL}/login`, { username, password }, { withCredentials: true });
      if (res.status === 200) {
        // Save token from response (assume res.data.token)
        if (res.data && res.data.token) {
          Cookies.set('token', res.data.token, { expires: 7, path: '/', sameSite: 'lax' });
        }
        setPopup({ show: true, type: 'success', message: 'Login successful!' });
        setTimeout(() => navigate('/home', { replace: true }), 800);
      }
    } catch (err) {
      if (err.response) {
        if (err.response.status === 401) {
          setPopup({ show: true, type: 'error', message: 'Invalid username or password.' });
        } else if (
          err.response.data &&
          err.response.data.message &&
          err.response.data.message.toLowerCase().includes('validity')
        ) {
          setPopup({ show: true, type: 'error', message: 'Your validity has expired.' });
        } else {
          setPopup({ show: true, type: 'error', message: 'Login failed. Please try again.' });
        }
      } else {
        setPopup({ show: true, type: 'error', message: 'Network error. Please try again.' });
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 animate-gradient-x px-4 relative">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/30"
      >
        <h2 className="text-4xl font-bold text-center text-black mb-8 font-poppins">
          Welcome Back 👋
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username */}
          <div>
            <label className="block text-gray-700 font-medium mb-2 font-poppins">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:outline-none shadow-sm transition duration-200 hover:shadow-md"
              placeholder="Enter your username"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-gray-700 font-medium mb-2 font-poppins">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:outline-none shadow-sm transition duration-200 hover:shadow-md"
              placeholder="Enter your password"
              required
            />
          </div>

          {/* Login Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.02 }}
            type="submit"
            className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-semibold py-3 rounded-2xl shadow-lg hover:opacity-90 transition font-poppins"
          >
            Login
          </motion.button>
        </form>
        {/* Animated Popup */}
        <AnimatePresence>
          {popup.show && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              transition={{ duration: 0.4 }}
              className={`fixed left-1/2 -translate-x-1/2 top-8 z-50 px-6 py-3 rounded-xl shadow-xl font-semibold text-center text-base
                ${popup.type === 'success' ? 'bg-green-500/90 text-white' : 'bg-red-500/90 text-white'}`}
            >
              {popup.message}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
