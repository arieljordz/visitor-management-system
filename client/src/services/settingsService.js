import api from "../api/api.js";

export const getSettings = async () => {
  const response = await api.get("/api/get-settings");
  return response.data;
};

export const upsertSettings = async (formData) => {
  const response = await api.post("/api/upsert-settings", formData);
  return response.data;
};
