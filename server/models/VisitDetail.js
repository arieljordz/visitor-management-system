import mongoose from "mongoose";

const VisitDetailSchema = new mongoose.Schema(
  {
    visitorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Visitor",
      required: true,
    },
    visitDate: { type: Date, required: true },
    purpose: { type: String, required: true },
    classification: { type: String, required: true },
    noOfVisitors: {
      type: Number,
      required: true,
      default: 1,
    },
  },
  { timestamps: true }
);

export default mongoose.model("VisitDetail", VisitDetailSchema);
