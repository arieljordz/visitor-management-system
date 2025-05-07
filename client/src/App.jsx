// App.jsx
import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import { ThemeProvider } from "./context/ThemeContext";
import Spinner from "./components/common/Spinner";
import LoginPage from "./pages/Login/LoginPage";
import socket from "./utils/socket";
import AuthenticatedLayout from "./layouts/AuthenticatedLayout";
import VerifyEmail from "./pages/Login/VerifyEmail";
import ForgotPassword from "./pages/Login/ForgotPassword";
import ResetPassword from "./pages/Login/ResetPassword";
import { SpinnerProvider } from "./context/SpinnerContext";
import { SettingProvider, useSettings } from "./context/SettingsContext";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { SystemSettings } from "./utils/globalUtils";

const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

const App = () => {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");

    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);

      const joinRoom = () => {
        if (parsedUser?.userId && parsedUser?.role) {
          socket.emit("join", {
            userId: parsedUser.userId,
            role: parsedUser.role,
          });
        }
      };

      joinRoom();
      socket.on("connect", joinRoom);

      setUser(parsedUser);
    }

    setLoadingUser(false);

    socket.on("notification", (message) => {
      console.log("🔔 New notification:", message);
    });

    return () => {
      socket.off("notification");
      socket.off("connect");
    };
  }, []);

  if (loadingUser) return <Spinner />;

  return (
    <ThemeProvider>
      <SpinnerProvider>
        <SettingProvider>
          <GoogleOAuthProvider clientId={API_KEY}>
            <AppContent user={user} setUser={setUser} />
          </GoogleOAuthProvider>
        </SettingProvider>
      </SpinnerProvider>
    </ThemeProvider>
  );
};

const AppContent = ({ user, setUser }) => {
  const { settings } = useSettings();

  useEffect(() => {
    if (settings) {
      SystemSettings(settings);
    }
  }, [settings]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage user={user} setUser={setUser} />} />
        <Route path="/email-verification" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/*" element={<AuthenticatedLayout user={user} />} />
      </Routes>
      <ToastContainer position="top-right" autoClose={2000} />
    </BrowserRouter>
  );
};

export default App;
