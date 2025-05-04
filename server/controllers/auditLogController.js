import AuditLog from "../models/AuditLog.js";

// Create a new audit log entry
export const createAuditLog = async (req, res) => {
  try {
    const { userId, action, ipAddress, details } = req.body;

    const log = new AuditLog({
      userId,
      action,
      ipAddress,
      details,
    });

    await log.save();
    res.status(201).json({ message: "Audit log created", log });
  } catch (error) {
    res.status(500).json({ message: "Failed to create audit log", error });
  }
};

// Get all audit logs (optionally filter by user or action)
export const getAuditLogs = async (req, res) => {
  try {
    const { userId, action } = req.query;
    const filter = {};

    if (userId) filter.userId = userId;
    if (action) filter.action = action;

    const logs = await AuditLog.find(filter).populate("userId", "name email"); // adjust populated fields as needed
    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch audit logs", error });
  }
};

// Get a single audit log by ID
export const getAuditLogById = async (req, res) => {
  try {
    const { id } = req.params;
    const log = await AuditLog.findById(id).populate("userId", "name email");

    if (!log) return res.status(404).json({ message: "Audit log not found" });

    res.status(200).json(log);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch audit log", error });
  }
};
