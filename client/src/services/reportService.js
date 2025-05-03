import api from "../api/api.js";

export const getVisitorsByDateRange = async ({ dateFrom, dateTo }) => {
  const response = await api.get("/api/get-visitors-report", {
    params: { dateFrom, dateTo },
  });
  return response.data || [];
};

export const getPaymentDetailsByDateRange = async ({
  dateFrom,
  dateTo,
}) => {
  const response = await api.get("/api/get-payment-details-report", {
    params: { dateFrom, dateTo },
  });
  return response.data || [];
};

export const getAuditLogsByDateRange = async ({ dateFrom, dateTo }) => {
  const response = await api.get("/api/get-auditlogs-report", {
    params: { dateFrom, dateTo },
  });
  return response.data || [];
};
