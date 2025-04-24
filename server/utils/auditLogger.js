import AuditLog from "../models/AuditLog.js";

export const logAudit = async ({ userId, action, ipAddress, details = {} }) => {
  try {
    await AuditLog.create({
      userId,
      action,
      ipAddress,
      details,
    });
  } catch (error) {
    console.error("Audit logging failed:", error);
  }
};
