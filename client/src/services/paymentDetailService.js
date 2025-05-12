import api from "../api/api.js";

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

export const updateVerificationStatus = async (id, verificationStatus, reason = "") => {
  const payload = { verificationStatus };

  if (verificationStatus === "declined" && reason) {
    payload.reason = reason;
  }

  const response = await api.put(`/api/update-verification/${id}`, payload);
  return response;
};

export const updateSubscriptionStatus = async (id, verificationStatus, reason = "") => {
  const payload = { verificationStatus };

  if (verificationStatus === "declined" && reason) {
    payload.reason = reason;
  }

  const response = await api.put(`/api/subscription-verification/${id}`, payload);
  return response;
};

