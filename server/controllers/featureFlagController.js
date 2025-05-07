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
    // Get the flag to update
    const flag = await FeatureFlag.findOne({ key });

    if (!flag) {
      return res.status(404).json({ error: "Feature flag not found" });
    }

    // Gather keys to update: the flag itself + any related keys
    const keysToUpdate = [key, ...(flag.relatedKeys || [])];

    // Update all relevant flags
    await FeatureFlag.updateMany(
      { key: { $in: keysToUpdate } },
      { enabled }
    );

    // Return updated flags
    const updatedFlags = await FeatureFlag.find({ key: { $in: keysToUpdate } });

    res.json({ message: "Feature flags updated", updatedFlags });
  } catch (error) {
    console.error("Error updating feature flags:", error);
    res.status(500).json({ error: "Failed to update feature flags" });
  }
};

