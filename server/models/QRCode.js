import mongoose from "mongoose";
import { QRStatusEnum } from "../enums/enums.js"

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
    visitdetailsId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "VisitDetail",
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
      enum: Object.values(QRStatusEnum),
      default: QRStatusEnum.ACTIVE,
    },
    generatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model("QRCode", qrCodeSchema);
