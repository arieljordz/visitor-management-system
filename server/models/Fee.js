import mongoose from "mongoose";

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
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Fee", FeeSchema);
