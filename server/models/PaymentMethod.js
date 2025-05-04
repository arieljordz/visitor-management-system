import mongoose from "mongoose";
import { StatusEnum } from "../enums/enums.js";

const PaymentMethodSchema = new mongoose.Schema(
  {
    description: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: Object.values(StatusEnum),
      default: StatusEnum.ACTIVE,
    },
  },
  { timestamps: true }
);

export default mongoose.model("PaymentMethod", PaymentMethodSchema);
