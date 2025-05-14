// App.jsx
import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import { ThemeProvider } from "./context/ThemeContext";
import LoginPage from "./pages/Login/LoginPage";
import AuthenticatedLayout from "./layouts/AuthenticatedLayout";
import VerifyEmail from "./pages/Login/VerifyEmail";
import ForgotPassword from "./pages/Login/ForgotPassword";
import ResetPassword from "./pages/Login/ResetPassword";
import { SpinnerProvider } from "./context/SpinnerContext";
import { SettingProvider, useSettings } from "./context/SettingsContext";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { SystemSettings } from "./utils/globalUtils";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";

const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

const App = () => {
  return (
    <ThemeProvider>
      <SpinnerProvider>
        <AuthProvider>
          <SettingProvider>
            <SocketProvider>
              <GoogleOAuthProvider clientId={API_KEY}>
                <AppContent />
              </GoogleOAuthProvider>
            </SocketProvider>
          </SettingProvider>
        </AuthProvider>
      </SpinnerProvider>
    </ThemeProvider>
  );
};

const AppContent = () => {
  const { settings } = useSettings();
  useEffect(() => {
    if (settings) {
      SystemSettings(settings);
    }
  }, [settings]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/email-verification" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/*" element={<AuthenticatedLayout />} />
      </Routes>
      <ToastContainer position="top-right" autoClose={2000} />
    </BrowserRouter>
  );
};

export default App;
