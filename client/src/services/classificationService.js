import api from "../api/api.js";

export const getClassificationsByUserId = async (userId) => {
  const response = await api.get(`/api/get-classifications/${userId}`);
  return response.data.data || [];
};

export const updateClassificationByUserId = async (userId, formData) => {
  const response = await api.put(
    `/api/update-classification/${userId}`,
    formData
  );

  return response;
};

export const createClassification = async (formData) => {
  const response = await api.post(`/api/create-classification`, formData);

  return response;
};

export const getClassificationById = async (id) => {
  const response = await api.get(`/api/get-classification/${id}`);
  return response.data.data || [];
};

export const deleteClassification = async (id) => {
  const response = await api.delete(`/api/delete-classification/${id}`);
  return response;
};
