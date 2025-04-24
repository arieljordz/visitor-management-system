import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  action: { type: String, default: null },  
  timestamp: { type: Date, default: Date.now },
  ipAddress: { type: String, default: null },  
  details: { type: Object, default: null }, 
});

export default mongoose.model("AuditLog", auditLogSchema);
