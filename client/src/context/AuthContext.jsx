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

  const login = async (email, password, navigate) => {
    try {
      const res = await axios.post(
        `${API_URL}/api/auth/login`,
        { email, password },
        { withCredentials: true }
      );

      //   console.log("res:", res);
      const loggedInUser = res.data;
      localStorage.setItem("accessToken", res.data?.token);
      localStorage.setItem("user", JSON.stringify(loggedInUser));
      setUser(loggedInUser);

      if (loggedInUser.verified) {
        switch (loggedInUser.role) {
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
      } else {
        navigate("/");
      }

      return { success: true, message: "Login successful" };
    } catch (err) {
      return { success: false, message: "Login failed" };
    }
  };

  const googleLogin = async (userPayload, navigate) => {
    try {
      const res = await axios.post(
        `${API_URL}/api/auth/google-login`,
        userPayload,
        { withCredentials: true }
      );

      const loggedInUser = res.data;
      localStorage.setItem("accessToken", res.data?.token);
      localStorage.setItem("user", JSON.stringify(loggedInUser));
      setUser(loggedInUser);

      if (loggedInUser.verified) {
        switch (loggedInUser.role) {
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
      } else {
        navigate("/");
      }

      return { success: true, message: "Google login successful" };
    } catch (err) {
      console.error("googleLogin error:", err);
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
