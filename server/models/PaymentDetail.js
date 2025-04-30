import mongoose from "mongoose";

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
      enum: ["pending", "completed", "failed", "cancelled"],
      default: "pending",
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
      enum: ["pending", "verified", "declined"],
      default: "pending",
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
  { timestamps: true } // Automatically adds createdAt and updatedAt fields
);

const PaymentDetails = mongoose.model("PaymentDetail", paymentDetailsSchema);

export default PaymentDetails;
