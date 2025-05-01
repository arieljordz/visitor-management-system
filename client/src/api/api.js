import axios from "axios";
import Swal from "sweetalert2";

const API_URL = import.meta.env.VITE_BASE_API_URL;

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Send cookies with requests (needed for refreshToken)
});

// Attach access token from localStorage
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

// Handle expired access token using refreshToken stored in cookies
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      error.response.data?.message === "Token expired. Please login again." &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const res = await axios.post(
          `${API_URL}/api/refresh-token`,
          {},
          { withCredentials: true } // Required to send the refresh token cookie
        );

        const { token: newToken } = res.data;

        // Update localStorage with new access token
        const user = JSON.parse(localStorage.getItem("user")) || {};
        const updatedUser = { ...user, token: newToken };
        localStorage.setItem("user", JSON.stringify(updatedUser));

        // Retry the original request with new token
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        handleSessionExpired();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Handle session expiration
function handleSessionExpired() {
  Swal.fire({
    icon: "warning",
    title: "Session Expired",
    text: "Please login again.",
  }).then(() => {
    localStorage.removeItem("user");
    window.location.href = "/";
  });
}

export default api;
