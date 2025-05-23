import api from "../api/api.js";

export const getDepartmentsByUserId = async (userId) => {
  const response = await api.get(`/api/get-departments/${userId}`);
  return response.data.data || [];
};

export const updateDepartmentByUserId = async (userId, formData) => {
  const response = await api.put(`/api/update-department/${userId}`, formData);

  return response;
};

export const createDepartment = async (formData) => {
  const response = await api.post(`/api/create-department`, formData);

  return response;
};

export const getDepartmentById = async (id) => {
  const response = await api.get(`/api/get-department/${id}`);
  return response.data.data || [];
};

export const deleteDepartment = async (id) => {
  const response = await api.delete(`/api/delete-department/${id}`);
  return response;
};
