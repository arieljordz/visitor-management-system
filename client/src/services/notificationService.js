import api from "../api/api.js";

export const getNotifications = async () => {
  const response = await api.get("/api/get-notifications");
//   console.log("response admin notifs:", response);
  return response.data || [];
};

export const getNotificationsById = async (userId) => {
  const response = await api.get(`/api/get-notifications/${userId}`);
//   console.log("response admin notifs:", response);
  return response.data || [];
};

export const markAsRead = async () => {
  await api.put("/api/mark-as-read");
};

export const markAsReadById = async (userId) => {
  await api.put(`/api/mark-as-read/${userId}`);
};
