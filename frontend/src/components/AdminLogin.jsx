
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import API_URL from "../apiConfig";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await axios.post(`${API_URL}/adminlogin`, { username, password }, { withCredentials: true });
      if (res.status === 200) {
        navigate("/admin/dashboard");
      } else {
        setError(res.data?.message || "Invalid credentials");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-300 via-white to-pink-200">
      <form onSubmit={handleLogin} className="bg-white/90 p-10 rounded-3xl shadow-2xl w-full max-w-md flex flex-col gap-6 border border-indigo-100 animate-fade-in">
        <h2 className="text-3xl font-extrabold text-indigo-700 mb-2 text-center tracking-tight drop-shadow">Admin Login</h2>
        {error && <div className="text-red-500 text-center font-semibold animate-shake">{error}</div>}
        <input
          type="text"
          placeholder="Username"
          className="px-5 py-3 rounded-xl border border-indigo-200 focus:ring-2 focus:ring-indigo-400 focus:outline-none text-lg shadow"
          value={username}
          onChange={e => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="px-5 py-3 rounded-xl border border-indigo-200 focus:ring-2 focus:ring-indigo-400 focus:outline-none text-lg shadow"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <button type="submit" className="bg-gradient-to-r from-indigo-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 text-white font-bold py-3 rounded-xl transition text-lg shadow-lg">Login</button>
      </form>
    </div>
  );
}
