import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ThemeProvider } from "./context/ThemeContext";
import Navbar from "./components/common/Navbar";
import Sidebar from "./components/common/Sidebar";
import Footer from "./components/common/Footer";
import Spinner from "./components/common/Spinner";
import socket from "./utils/socket";
import Login from "./pages/Login/Login";
import Dashboard from "./pages/Dashboard/Dashboard";
import PaymentHistory from "./pages/Transactions/PaymentHistory";
import GeneratedQRCodes from "./pages/Transactions/GeneratedQRCodes";
import MyWallet from "./pages/MyWallet/MyWallet";
import AdminDashboard from "./pages/AdminDashboard/AdminDashboard";
import Verifications from "./pages/Verifications/Verifications";
import AdminPaymentHistory from "./pages/AdminTransactions/AdminPaymentHistory";
import AdminGeneratedQRCodes from "./pages/AdminTransactions/AdminGeneratedQRCodes";
import FMProofs from "./pages/FileMaintenance/FMProofs";
import FMPaymentMethod from "./pages/FileMaintenance/FMPaymentMethod";
import FMClassification from "./pages/FileMaintenance/FMClassification";
import FMFees from "./pages/FileMaintenance/FMFees";
import FMAccounts from "./pages/FileMaintenance/FMAccounts";
import "./App.css";

const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);

  // console.log("App user:", user);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");

    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);

      if (parsedUser?.userId && parsedUser?.role) {
        // Emit 'join' event with userId and role
        socket.emit("join", {
          userId: parsedUser.userId,
          role: parsedUser.role,
        });

        console.log(
          "✅ Joined socket room:",
          parsedUser.userId,
          parsedUser.role
        );
      }

      setUser(parsedUser);
    }
    setLoadingUser(false);

    // Listen for real-time notifications
    socket.on("notification", (message) => {
      console.log("🔔 New notification:", message);
      // Handle the message, e.g., show a toast or update state
    });

    return () => {
      socket.off("notification"); // Clean up the listener when the component unmounts
    };
  }, []);

  if (loadingUser) {
    return <Spinner />;
  }

  return (
    <ThemeProvider>
      <GoogleOAuthProvider clientId={API_KEY}>
        <BrowserRouter>
          <Routes>
            <Route
              path="/"
              element={
                <Login user={user} setUser={setUser} setLoading={setLoading} />
              }
            />
            <Route
              path="/*"
              element={
                <AuthenticatedLayout
                  user={user}
                  setUser={setUser}
                  loading={loading}
                />
              }
            />
          </Routes>
          <ToastContainer position="top-right" autoClose={2000} />
        </BrowserRouter>
      </GoogleOAuthProvider>
    </ThemeProvider>
  );
};

const AuthenticatedLayout = ({ user, setUser, loading }) => {
  const navigate = useNavigate();

  if (loading) {
    return <Spinner />;
  }

  const authenticatedRoutes = (
    <Routes>
      <Route
        path="/dashboard"
        element={<Dashboard user={user} setUser={setUser} />}
      />
      <Route
        path="/transactions/payment-history"
        element={<PaymentHistory user={user} setUser={setUser} />}
      />
      <Route
        path="/transactions/generated-qr-codes"
        element={<GeneratedQRCodes user={user} setUser={setUser} />}
      />
      <Route
        path="/my-wallet"
        element={<MyWallet user={user} setUser={setUser} />}
      />
      <Route
        path="/admin/dashboard"
        element={<AdminDashboard user={user} setUser={setUser} />}
      />
      <Route
        path="/admin/transactions/payment-history"
        element={<AdminPaymentHistory user={user} setUser={setUser} />}
      />
      <Route
        path="/admin/transactions/generated-qr-codes"
        element={<AdminGeneratedQRCodes user={user} setUser={setUser} />}
      />
      <Route
        path="/admin/verifications"
        element={<Verifications user={user} setUser={setUser} />}
      />
      <Route
        path="/admin/file-maintenance/proofs"
        element={<FMProofs user={user} setUser={setUser} />}
      />
      <Route
        path="/admin/file-maintenance/payment-methods"
        element={<FMPaymentMethod user={user} setUser={setUser} />}
      />
      <Route
        path="/admin/file-maintenance/classifications"
        element={<FMClassification user={user} setUser={setUser} />}
      />
      <Route
        path="/admin/file-maintenance/fees"
        element={<FMFees user={user} setUser={setUser} />}
      />
      <Route
        path="/admin/file-maintenance/accounts"
        element={<FMAccounts user={user} setUser={setUser} />}
      />
    </Routes>
  );

  return (
    <div className="wrapper">
      <Navbar user={user} setUser={setUser} />
      <Sidebar user={user} setUser={setUser} />
      {authenticatedRoutes}
      <Footer />
    </div>
  );
};

export default App;
