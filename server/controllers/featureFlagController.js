import FeatureFlag from "../models/FeatureFlag.js";

export const getFeatureFlags = async (req, res) => {
    try {
      const flags = await FeatureFlag.find(); 
      const result = {};
  
      flags.forEach((flag) => {
        result[flag.key] = flag.enabled; 
      });
  
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to load feature flags" });
    }
  };
  

export const updateFeatureFlag = async (req, res) => {
  const { key } = req.params;
  const { enabled } = req.body;

  try {
    const updatedFlag = await FeatureFlag.findOneAndUpdate(
      { key },
      { enabled },
      { new: true }
    );

    if (!updatedFlag) {
      return res.status(404).json({ error: "Feature flag not found" });
    }

    res.json(updatedFlag);
  } catch (error) {
    console.error("Error updating feature flag:", error);
    res.status(500).json({ error: "Failed to update feature flag" });
  }
};
