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

  const getRedirectPathByRole = (role) => {
    switch (role) {
      case UserRoleEnum.ADMIN:
      case UserRoleEnum.SUBSCRIBER:
        return "/dashboard";
      case UserRoleEnum.STAFF:
        return "/scan-qr";
      default:
        return "/";
    }
  };

  const login = async (email, password) => {
    try {
      const { data } = await axios.post(
        `${API_URL}/api/auth/login`,
        { email, password },
        { withCredentials: true }
      );

      if (!data.verified) {
        return { success: false, message: "Account not yet verified." };
      }

      storeUserData(data);
      return {
        success: true,
        message: "Login successful",
        redirectPath: getRedirectPathByRole(data.role),
      };
    } catch (err) {
      return { success: false, message: "Login failed" };
    }
  };

  const googleLogin = async (userPayload) => {
    try {
      const { data } = await axios.post(
        `${API_URL}/api/auth/google-login`,
        userPayload,
        { withCredentials: true }
      );
      console.log("data:", data);

      if (!data.verified) {
        return { success: false, message: "Account not yet verified. Please verify to your email." };
      }

      storeUserData(data);
      return {
        success: true,
        message: "Google login successful",
        redirectPath: getRedirectPathByRole(data.role),
      };
    } catch (err) {
      console.error("Google login error:", err);
      return { success: false, message: "Google login failed" };
    }
  };

  const updateUser = (newUserData) => {
    const updatedUser = { ...user, ...newUserData };
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{ user, login, googleLogin, setUser, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
