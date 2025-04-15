import mongoose from "mongoose";

const paymentDetailsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Assuming there's a User model for the user making the payment
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentMethod: {
      type: String,
      enum: ["gcash", "paymaya", "bank", "e-wallet"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "cancelled"],
      default: "pending",
    },
    proofOfPayment: {
      type: String, // URL or path to the uploaded proof image
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
