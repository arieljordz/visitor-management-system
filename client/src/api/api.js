import axios from "axios";
import Swal from "sweetalert2";

const API_URL = import.meta.env.VITE_BASE_API_URL;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Attach token
api.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user?.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle expired token
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response &&
      error.response.status === 401 &&
      error.response.data.message === "Token expired. Please login again."
    ) {
      // Clear user data & force logout
      Swal.fire({
        icon: "warning",
        title: "Session Expired",
        text: "Please login again.",
      }).then(() => {
        localStorage.removeItem("user");
        window.location.href = "/";
      });
    }
    return Promise.reject(error);
  }
);

export default api;
