import axios from "axios";
import Swal from "sweetalert2";

const API_URL = import.meta.env.VITE_BASE_API_URL;

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

const skipAuthEndpoints = [
  "/api/logout-user",
  "/api/get-settings",
  "/api/get-feature-flags",
];

// Attach Authorization token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle token expiration and session
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const isTokenExpired =
      error.response?.status === 401 &&
      error.response?.data?.message === "Token expired. Please login again.";

    const shouldSkipAuthHandling = skipAuthEndpoints.some((endpoint) =>
      originalRequest?.url?.includes(endpoint)
    );

    console.log("isTokenExpired:", isTokenExpired);
    console.log("shouldSkipAuthHandling:", shouldSkipAuthHandling);
    console.log("originalRequest:", originalRequest._retry);

    // Attempt token refresh
    if (isTokenExpired && !originalRequest._retry && !shouldSkipAuthHandling) {
      originalRequest._retry = true;

      try {
        const res = await axios.post(
          `${API_URL}/api/refresh-token`,
          {},
          { withCredentials: true }
        );

        const { accessToken: newToken, user: updatedUser } = res.data;

        localStorage.setItem("accessToken", newToken);
        localStorage.setItem("user", JSON.stringify(updatedUser));

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        return logoutAndRedirect(refreshError);
      }
    }

    // For any other 401 error, logout unless explicitly skipped
    if (error.response?.status === 401 && !shouldSkipAuthHandling) {
      return logoutAndRedirect(error);
    }

    return Promise.reject(error);
  }
);

// Logout handler
function logoutAndRedirect(error) {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("user");

  Swal.fire({
    icon: "warning",
    title: "Session Expired",
    text: "You have been logged out. Please login again.",
    confirmButtonText: "OK",
  }).then(() => {
    window.location.href = "/";
  });

  return Promise.reject(error);
}

export default api;
