import mongoose from "mongoose";

const PaymentMethodSchema = new mongoose.Schema(
  {
    method: {
      type: String,
      enum: ["GCash", "PayMaya", "Bank"],
      required: true,
    },
    accountName: {
      type: String,
      required: true,
    },
    accountNumber: {
      type: String,
      required: true,
    },
    bankName: {
      type: String,
      required: function () {
        return this.method === "Bank";
      },
    },
  },
  { timestamps: true }
);

const PaymentMethod = mongoose.model("PaymentMethod", PaymentMethodSchema);

export default PaymentMethod;
