import api from "../api/api.js";

export const updatePaymentAccount = async (userId, formData) => {
  const response = await api.put(
    `/api/update-payment-account/${userId}`,
    formData
  );
  return response;
};

export const createPaymentAccount = async (formData) => {
  const response = await api.post(`/api/create-payment-account`, formData);
  return response;
};

export const getPaymentAccounts = async () => {
  const response = await api.get("/api/get-payment-accounts");
  return response.data.data || [];
};

export const getActivePaymentAccounts = async () => {
  const response = await api.get("/api/get-active-payment-accounts");
  return response.data.data || [];
};

export const getPaymentAccountById = async (id) => {
  const response = await api.get(`/api/get-payment-account/${id}`);
  return response.data.data || [];
};

export const deletePaymentAccount = async (id) => {
  const response = await api.delete(`/api/delete-payment-account/${id}`);
  return response;
};
