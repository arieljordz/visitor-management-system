import mongoose from "mongoose";

const ClassificationSchema = new mongoose.Schema(
  {
    description: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

export default mongoose.model("Classification", ClassificationSchema);
