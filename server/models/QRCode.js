import mongoose from "mongoose";

const qrCodeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    visitorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Visitor",
      required: true,
    },
    qrData: {
      type: String,
      required: true,
    },
    qrImageUrl: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "used", "expired"],
      default: "active",
    },
    generatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const QRCode = mongoose.model("QRCode", qrCodeSchema);
export default QRCode;
