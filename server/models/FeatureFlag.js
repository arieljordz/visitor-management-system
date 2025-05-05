// models/FeatureFlag.js
import mongoose from "mongoose";

const FeatureFlagSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true }, 
    description: { type: String, default: null },
    enabled: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("FeatureFlag", FeatureFlagSchema);
