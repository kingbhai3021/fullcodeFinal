import Settings from './components/Settings.jsx';
import React from 'react';
import Login from './components/Login.js';
import './index.css'


import HomePage from './components/HomePage.js';
import Messages from './components/Messages.jsx';

import Devices from './components/Devices.jsx';
import ChangeNumber from './components/ChangeNumber.jsx';
import DataPage from './components/DataPage.jsx';

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import AdminLogin from './components/AdminLogin.jsx';
import AdminDashboard from './components/AdminDashboard.jsx';


function App() {
  return (
    <>
      <Router>
        <Routes>
          {/* Default page */}
          <Route path="/" element={<Login />} />

          {/* Other pages */}
          {/* <Route path="/signup" element={<Signup />} /> */}
          <Route path="/home" element={<HomePage />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/messages/:deviceId" element={<Messages />} />
          <Route path="/devices" element={<Devices />} />
          <Route path="/change-number" element={<ChangeNumber />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/data" element={<DataPage />} />

          {/* Admin panel routes */}
          <Route path="/baba" element={<AdminLogin />} />
          {/* <Route path="/admin/dashboard" element={
            localStorage.getItem("admin_token") ? <AdminDashboard /> : <Navigate to="/admin" />
          } /> */}
          <Route path="/admin/dashboard" element={
            <AdminDashboard />
          } />
        </Routes>
      </Router>
    </>
  );
}

export default App;
