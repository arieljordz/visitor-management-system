import api from "../api/api.js";

export const updatePaymentMethod = async (userId, formData) => {
  const response = await api.put(
    `/api/update-payment-method/${userId}`,
    formData
  );
  return response;
};

export const createPaymentMethod = async (formData) => {
  const response = await api.post(`/api/create-payment-method`, formData);
  return response;
};

export const getPaymentMethods = async () => {
  const response = await api.get("/api/get-payment-methods");
  return response.data.data || [];
};

export const getActivePaymentMethods = async () => {
  const response = await api.get("/api/get-active-payment-methods");
  return response.data.data || [];
};

export const getPaymentMethodById = async (id) => {
  const response = await api.get(`/api/get-payment-method/${id}`);
  return response.data.data || [];
};

export const deletePaymentMethod = async (id) => {
  const response = await api.delete(`/api/delete-payment-method/${id}`);
  return response;
};
