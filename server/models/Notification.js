import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      enum: ["client", "admin", "staff"],
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

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
