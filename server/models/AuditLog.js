import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  action: String, // e.g., "login", "update_profile", "logout"
  timestamp: { type: Date, default: Date.now },
  ipAddress: String,
  details: Object, // Optional: Add any metadata here
});

export default mongoose.model("AuditLog", auditLogSchema);
