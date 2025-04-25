import api from "../api/api.js";

export const updateUser = async (userId, formData) => {
  const response = await api.put(`/api/update-user/${userId}`, formData);

  return response;
};

export const createUser = async (formData) => {
  const response = await api.post(`/api/create-user`, formData);

  return response;
};

export const getUsers = async () => {
  const response = await api.get("/api/get-users");
  return response.data.data || [];
};

export const getUserById = async (id) => {
  const response = await api.get(`/api/get-user/${id}`);
  return response.data.data || [];
};

export const deleteUser = async (id) => {
  const response = await api.delete(`/api/delete-user/${id}`);
  return response;
};

export const logout = async () => {
  const response = await api.put(`/api/logout-user`);
  return response;
};

