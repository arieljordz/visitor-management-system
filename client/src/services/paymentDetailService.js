import api from "../api/api.js";

export const processPayment = async (user, visitorId) => {
  const response = await api.post(`/api/submit-payment`, {
    userId: user.userId,
    visitorId: visitorId,
  });
  return response;
};

export const deletePaymentProofs = async (selectedRows) => {
  const response = await api.delete(`/api/delete-payment-proofs`, {
    data: { selectedRows },
  });
  return response;
};

export const getPaymentDetails = async () => {
  const response = await api.get("/api/get-payment-details");
  return response.data.data || [];
};

export const getPaymentDetailsById = async (userId) => {
  const response = await api.get(`/api/get-payment-details/${userId}`);
  return response.data.data || [];
};

export const getPaymentProofs = async () => {
  const response = await api.get("/api/get-payment-proofs");
  return response.data.data || [];
};

export const updateVerificationStatus = async (id, verificationStatus) => {
  const response = await api.put(`/api/update-verification/${id}`, {
    verificationStatus,
  });
  return response;
};
