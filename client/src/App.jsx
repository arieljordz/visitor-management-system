import React, { useState, useEffect } from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { ToastContainer } from "react-toastify";
import Dashboard from "./components/Dashboard/Dashboard";
import Transactions from "./components/Transactions/Transactions";
import AdminTransactions from "./components/Transactions/AdminTransactions";
import Verifications from "./components/Verifications/Verifications";
import FileMaintenance from "./components/FileMaintenance/FileMaintenance";
import FormNavigation from "./commons/FormNavigation";
import LoginForm from "./components/Login/LoginForm";
import "./App.css";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";
import FullScreenSpinner from "./commons/FullScreenSpinner";
import AdminDashboard from "./components/Dashboard/AdminDashboard";
import MyWallet from "./components/MyWallet/MyWallet";

const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false); // ✅ Loading state

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <ThemeProvider>
      <GoogleOAuthProvider clientId={API_KEY}>
        <BrowserRouter>
          {user && !loading && (
            <FormNavigation user={user} onLogout={handleLogout} />
          )}
          {loading && <FullScreenSpinner />} {/* ✅ Show spinner */}
          <ToastContainer position="top-right" autoClose={2000} />
          <Routes>
            <Route
              path="/"
              element={
                <LoginForm
                  setUser={setUser}
                  setLoading={setLoading}
                  user={user}
                />
              }
            />
            <Route path="/dashboard" element={<Dashboard user={user} />} />
            <Route
              path="/transactions"
              element={<Transactions user={user} />}
            />
            <Route path="/my-wallet" element={<MyWallet user={user} />} />
            <Route
              path="/admin/dashboard"
              element={<AdminDashboard user={user} />}
            />
            <Route
              path="/admin/transactions"
              element={<AdminTransactions user={user} />}
            />
            <Route
              path="/admin/verifications"
              element={<Verifications user={user} />}
            />
            <Route
              path="/admin/file-maintenance"
              element={<FileMaintenance user={user} />}
            />
          </Routes>
        </BrowserRouter>
      </GoogleOAuthProvider>
    </ThemeProvider>
  );
}

export default App;
