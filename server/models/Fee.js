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
    active: {
      type: Boolean,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Fee", FeeSchema);
