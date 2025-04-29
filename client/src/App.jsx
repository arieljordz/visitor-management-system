import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import { ThemeProvider } from "./context/ThemeContext";
import Spinner from "./components/common/Spinner";
import Login from "./pages/Login/Login";
import socket from "./utils/socket";
import AuthenticatedLayout from "./layouts/AuthenticatedLayout";
import VerifyEmail from "./pages/Login/VerifyEmail";

const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
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
          console.log(
            "✅ Joined socket room:",
            parsedUser.userId,
            parsedUser.role
          );
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
      <GoogleOAuthProvider clientId={API_KEY}>
        <BrowserRouter>
          {loading && <Spinner />}
          <Routes>
            <Route
              path="/"
              element={
                <Login user={user} setUser={setUser} setLoading={setLoading} />
              }
            />
            <Route path="/api/email-verified" element={<VerifyEmail />} />
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

export default App;
