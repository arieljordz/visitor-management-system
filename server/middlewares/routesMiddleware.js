import FeatureFlag from "../models/FeatureFlag.js";

const checkFeature = (key) => {
  return async (req, res, next) => {
    try {
      const feature = await FeatureFlag.findOne({ key });
      console.log("feature key:", key);
      console.log("feature:", feature);
      if (!feature || feature.enabled === true) {
        return res.status(403).json({ message: "This feature is currently disabled." });
      }

      next(); // continue if feature is enabled
    } catch (error) {
      return res.status(500).json({ message: "Error checking feature flag", error: error.message });
    }
  };
};

export default checkFeature;
