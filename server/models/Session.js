import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    sessionToken: { type: String, default: null },
    refreshToken: { type: String, default: null },
    expiresAt: { type: Date, default: null },
    resetToken: { type: String, default: null },
    resetTokenExpires: { type: Date, default: null },
    ipAddress: { type: String, default: null },
    userAgent: { type: String, default: null },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("Session", sessionSchema);
