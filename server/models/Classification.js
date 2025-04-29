import mongoose from "mongoose";

const ClassificationSchema = new mongoose.Schema(
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

export default mongoose.model("Classification", ClassificationSchema);
