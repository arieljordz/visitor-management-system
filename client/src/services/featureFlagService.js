import api from "../api/api.js";

export const getFeatureFlags = async () => {
  const response = await api.get(`/api/get-feature-flags`);
  return response.data; 
};

export const updateFeatureFlag = async (key, enabled) => {
  const response = await api.put(`/api/update-feature-flags/${key}`, { enabled });
  return response.data;
};
