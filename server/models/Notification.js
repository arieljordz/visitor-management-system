import mongoose from "mongoose";
import { UserRoleEnum } from "../enums/enums.js"

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      enum: Object.values(UserRoleEnum),
      required: true,
    },
    transaction: { type: String, required: true },
    type: { type: String, required: true },
    message: { type: String, required: true },
    isAdminRead: { type: Boolean, default: false },
    isClientRead: { type: Boolean, default: false },
    dateCreated: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);
