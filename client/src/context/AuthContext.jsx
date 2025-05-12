import { createContext, useContext, useState } from "react";
import axios from "axios";
import { UserRoleEnum } from "../enums/enums.js";

const API_URL = import.meta.env.VITE_BASE_API_URL;
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const storeUserData = (data) => {
    localStorage.setItem("accessToken", data?.token);
    localStorage.setItem("user", JSON.stringify(data));
    setUser(data);
  };

  const handleNavigation = (user, navigate, mode) => {
    if (mode === "google") {
      if (!user.verified) {
        return { success: false, message: "Account not yet verified." };
      }
    }

    switch (user.role) {
      case UserRoleEnum.ADMIN:
      case UserRoleEnum.SUBSCRIBER:
        navigate("/dashboard");
        break;
      case UserRoleEnum.STAFF:
        navigate("/scan-qr");
        break;
      default:
        navigate("/");
    }

    return { success: true, message: "Login successful" };
  };

  const login = async (email, password, navigate) => {
    try {
      const { data } = await axios.post(
        `${API_URL}/api/auth/login`,
        { email, password },
        { withCredentials: true }
      );

      storeUserData(data);
      return handleNavigation(data, navigate, "manual");
    } catch (err) {
      return { success: false, message: "Login failed" };
    }
  };

  const googleLogin = async (userPayload, navigate) => {
    try {
      const { data } = await axios.post(
        `${API_URL}/api/auth/google-login`,
        userPayload,
        { withCredentials: true }
      );

      storeUserData(data);
      return handleNavigation(data, navigate, "google");
    } catch (err) {
      console.error("Google login error:", err);
      return { success: false, message: "Google login failed" };
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, googleLogin, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
