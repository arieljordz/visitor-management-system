import mongoose from "mongoose";

const VisitDetailSchema = new mongoose.Schema(
  {
    visitorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Visitor",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    visitDate: { type: Date, required: true },
    purpose: { type: String, required: true },
    classification: { type: String, required: true },
    noOfVisitors: {
      type: Number,
      required: function () {
        return this.visitorType === "Group";
      },
    },
    qrCode: {
      qrData: { type: String, required: true },
      status: {
        type: String,
        enum: ["pending", "active", "scanned", "used", "expired", "revoked"],
        default: "pending",
      },
      generatedAt: { type: Date, default: Date.now },
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.model("VisitDetail", VisitDetailSchema);
