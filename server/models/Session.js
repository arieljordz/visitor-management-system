import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  sessionToken: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
  ipAddress: { type: String, default: null },
  userAgent: { type: String, default: null },
  isActive: { type: Boolean, default: true },
});

export default mongoose.model("Session", sessionSchema);
