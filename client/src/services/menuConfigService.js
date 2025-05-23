import api from "../api/api.js";

export const createMenuConfig = async (formData) => {
  const response = await api.post(`/api/create-menu-config`, formData);
  return response;
};

export const getMenuByRole = async (role, subscription) => {
  const response = await api.get(`/api/get-menu-config/${role}`, {
    params: { subscription },
  });
  return response;
};

export const upsertMenuConfig = async (formData) => {
  const response = await api.post(`/api/upsert-menu-config`, formData);
  return response;
};
