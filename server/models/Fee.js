import mongoose from "mongoose";
import { StatusEnum } from "../enums/enums.js";

const FeeSchema = new mongoose.Schema(
  {
 
    description: {
      type: String,
      required: true,
    },
    fee: {
      type: Number,
      default: 0,
    },
    feeCode: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(StatusEnum),
      default: StatusEnum.ACTIVE,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Fee", FeeSchema);
