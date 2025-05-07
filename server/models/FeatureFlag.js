import mongoose from "mongoose";

const FeatureFlagSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true }, 
    description: { type: String, default: null },
    enabled: { type: Boolean, default: false },
    relatedKeys: [{ type: String }],
  },
  { timestamps: true }
);

export default mongoose.model("FeatureFlag", FeatureFlagSchema);
