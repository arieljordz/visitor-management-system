import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    action: { type: String, default: null },
    ipAddress: { type: String, default: null },
    details: { type: Object, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("AuditLog", auditLogSchema);
