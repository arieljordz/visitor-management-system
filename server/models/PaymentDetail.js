import mongoose from "mongoose";
import { PaymentStatusEnum, VerificationStatusEnum } from "../enums/enums.js";

const paymentDetailsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    visitorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Visitor",
      required: false,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentMethod: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(PaymentStatusEnum),
      default: PaymentStatusEnum.PENDING,
    },
    transaction: {
      type: String,
      required: true, // debit or credit
    },
    proofOfPayment: {
      type: String, // URL or path to the uploaded proof image
      required: false,
    },
    referenceNumber: {
      type: String,
      required: false,
    },
    verificationStatus: {
      type: String,
      enum: Object.values(VerificationStatusEnum),
      default: VerificationStatusEnum.PENDING,
    },
    reason: {
      type: String,
      required: false,
    },
    paymentDate: {
      type: Date,
      default: Date.now,
    },
    completedDate: {
      type: Date,
      required: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("PaymentDetail", paymentDetailsSchema);

