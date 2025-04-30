import api from "../api/api.js";

export const checkActiveQRCodeById = async (user, visitorId) => {
  const response = await api.get(
    `/api/check-active-qr/${user.userId}/${visitorId}`
  );
  return response.data.data || [];
};

export const generateQRCodeWithPayment = async ({ userId, visitorId }) => {
  const response = await api.post("/api/generate-qr", {
    userId,
    visitorId,
  });
  return response.data.data || [];
};

export const generateQRCode = async (user, visitorId) => {
  const response = await api.post(
    `/api/generate-qr/${user.userId}/${visitorId}`
  );
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

export const scanQRCode = async (qrData) => {
  const response = await api.get(`/api/scan-qr/${qrData}`);
  return response.data;
};