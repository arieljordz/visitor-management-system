import React, { useState, useEffect } from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { ToastContainer } from "react-toastify";
import Home from "./pages/Home";
import Dashboard from "./components/Dashboard";
import Transactions from "./components/Transactions";
import AdminTransactions from "./components/AdminTransactions";
import Verifications from "./components/Verifications";
import FileMaintenance from "./components/FileMaintenance";
import NavbarComponent from "./components/NavbarComponent";
import "./App.css";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";

const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (userData) => {
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <ThemeProvider>
      <GoogleOAuthProvider clientId={API_KEY}>
        <BrowserRouter>
          {/* ✅ Show navbar only if user is logged in */}
          {user && <NavbarComponent user={user} onLogout={handleLogout} />}

          <ToastContainer position="top-right" autoClose={2000} />

          <Routes>
            <Route
              path="/"
              element={<Home setUser={handleLogin} user={user} />}
            />
            <Route path="/dashboard" element={<Dashboard user={user} />} />
            <Route path="/transactions" element={<Transactions user={user} />} />
            <Route path="/admin/transactions" element={<AdminTransactions user={user} />} />
            <Route path="/admin/verifications" element={<Verifications user={user} />} />
            <Route path="/admin/file-maintenance" element={<FileMaintenance user={user} />} />
          </Routes>
        </BrowserRouter>
      </GoogleOAuthProvider>
    </ThemeProvider>
  );
}

export default App;
