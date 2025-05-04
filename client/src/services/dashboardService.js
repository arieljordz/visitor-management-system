import api from "../api/api.js";

export const getVisitorByUserId = async (userId) => {
  const response = await api.get(`/api/get-visitor-by-user/${userId}`);
  return response.data.data || [];
};

export const generateQRCode = async (user, visitorId) => {
  const response = await api.post(
    `/api/generate-qr/${user.userId}/${visitorId}`
  );
  return response.data.data || [];
};

export const getBalance = async (userId) => {
  const response = await api.get(`/api/check-balance/${userId}`);
  return response.data.data || [];
};

export const getDashboardStats = async () => {
  const response = await api.get("/api/get-dashboard-stats");
  return response.data;
};