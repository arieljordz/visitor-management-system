import api from "../api/api.js";

export const updateFee = async (userId, formData) => {
  const response = await api.put(`/api/update-fee/${userId}`, formData);

  return response;
};

export const createFee = async (formData) => {
  const response = await api.post(`/api/create-fee`, formData);

  return response;
};

export const getFees = async () => {
  const response = await api.get("/api/get-fees");
  return response.data.data || [];
};

export const getFeeById = async (id) => {
  const response = await api.get(`/api/get-fee/${id}`);
  return response.data.data || [];
};

export const deleteFee = async (id) => {
  const response = await api.delete(`/api/delete-fee/${id}`);
  return response;
};

export const getFeeByCodeAndStatus = async (feeCode) => {
  const response = await api.get(`/api/get-fee-code/${feeCode}`);
  return response.data.data || [];
};

