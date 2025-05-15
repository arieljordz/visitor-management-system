import axios from "axios";
import Swal from "sweetalert2";

const API_URL = import.meta.env.VITE_BASE_API_URL;

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Optional: list of endpoints that should skip auth handling
const skipAuthEndpoints = ["/api/logout-user", "/api/get-settings"];

// Attach Authorization token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    // console.log("api token:", token);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle responses, including token expiration
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isAuthError =
      error.response?.status === 401 &&
      error.response?.data?.message === "Token expired. Please login again.";

    // Skip auth handling if endpoint is in the skip list
    const shouldSkipAuthHandling = skipAuthEndpoints.some((endpoint) =>
      originalRequest?.url?.includes(endpoint)
    );

    // console.log("isAuthError:", isAuthError);
    // console.log("originalRequest:", originalRequest);
    // console.log("originalRequest._retry:", originalRequest._retry);
    // console.log("shouldSkipAuthHandling:", shouldSkipAuthHandling);

    // Handle token expiration and retry logic
    if (isAuthError && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const res = await axios.post(
          `${API_URL}/api/refresh-token`,
          {},
          { withCredentials: true }
        );

        // console.log("api user:", res);

        const { accessToken: newToken, user: updatedUser } = res.data;

        localStorage.setItem("accessToken", newToken);
        localStorage.setItem("user", JSON.stringify(updatedUser));

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        if (!shouldSkipAuthHandling) {
          console.log("Error 401 shouldSkipAuthHandling");
          return handleSessionExpired(refreshError);
        }
        return Promise.reject(refreshError);
      }
    }

    // Catch-all for other 401s
    if (error.response?.status === 401 && !shouldSkipAuthHandling) {
      console.log("Error 401");
      return handleSessionExpired(error);
    }

    return Promise.reject(error);
  }
);

// Handle session expiration
function handleSessionExpired(error) {
  Swal.fire({
    icon: "warning",
    title: "Session Expired",
    text: "Please login again.",
    confirmButtonText: "OK",
  }).then(() => {
    localStorage.removeItem("user");
    window.location.href = "/";
  });

  return Promise.reject(error);
}

export default api;
