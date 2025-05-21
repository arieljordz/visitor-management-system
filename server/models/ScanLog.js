import mongoose from "mongoose";
import { QRStatusEnum, ValidityEnum } from "../enums/enums.js"

const ScanLogSchema = new mongoose.Schema({
  qrCodeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "QRCode",
    required: true,
  },
  scannedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  scannedAt: { type: Date, default: Date.now },
  visitorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Visitor",
    required: true,
  },
  validityType: {
    type: String,
    enum: Object.values(ValidityEnum),
    required: true,
  },
  statusAtScan: {
    type: String,
    enum: Object.values(QRStatusEnum),
    required: true,
  },
});

export default mongoose.model("ScanLog", ScanLogSchema);
