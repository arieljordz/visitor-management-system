import api from "../api/api.js";

export const getVisitorByUserId = async (userId) => {
  const response = await api.get(`/api/get-visitor-by-user/${userId}`);
  return response.data.data || [];
};

export const createVisitor = async (dataToSubmit) => {
  const response = await api.post("/api/create-visitor", dataToSubmit);
  return response.data.data || [];
};
