import api from "../api/api.js";

export const checkActiveQRCodeForVisit = async (user, visitorId, visitDetailsId) => {
  try {
    await api.get(`/api/check-active-qr/${user.userId}/${visitorId}/${visitDetailsId}`);
    return null; 
  } catch (error) {
    if (error.response && error.response.status === 409) {
      const { message, status } = error.response.data;
      return { message, status };
    }
    console.error("Error checking active QR:", error);
    throw error;
  }
};

export const generateQRCodeWithPayment = async ({ userId, visitorId, visitDetailsId }) => {
  const response = await api.post("/api/generate-qr", {
    userId,
    visitorId,
    visitDetailsId,
  });
  return response.data.data || [];
};

export const generateQRCodeSubscription = async ({ userId, visitorId, visitDetailsId }) => {
  const response = await api.post("/api/generate-qr-subscription", {
    userId,
    visitorId,
    visitDetailsId,
  });
  return response.data.data || [];
};

export const getGeneratedQRCodes = async () => {
  const response = await api.get("/api/get-generated-qr");
  return response.data.data || [];
};

export const getGeneratedQRCodesById = async (userId) => {
  const response = await api.get(`/api/get-generated-qr/${userId}`);
  return response.data.data || [];
};

export const scanQRCode = async (qrData, userId) => {
  const response = await api.get(`/api/scan-qr/${qrData}/${userId}`);
  return response.data;
};