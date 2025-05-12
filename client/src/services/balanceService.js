import api from "../api/api.js";

export const getBalance = async (userId) => {
  const response = await api.get(`/api/check-balance/${userId}`);
  //   console.log("response:", response);
  return response.data.data || [];
};

export const topUp = async (userId, formData) => {
  const response = await api.post(`/api/top-up/${userId}`, formData);
  return response;
};

export const submitSubscription = async (userId, formData) => {
  const response = await api.post(`/api/subscribe/${userId}`, formData);
  return response;
};

