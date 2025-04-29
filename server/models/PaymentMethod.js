
import mongoose from "mongoose";

const PaymentMethodSchema = new mongoose.Schema(
  {
    description: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true }
);

export default mongoose.model("PaymentMethod", PaymentMethodSchema);

