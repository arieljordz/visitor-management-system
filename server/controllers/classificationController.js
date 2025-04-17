import Classification from "../models/Classification.js";

// Add new classification
export const addClassification = async (req, res) => {
  try {
    const { description } = req.body;

    // Check for duplicate
    const existing = await Classification.findOne({
      description: description.trim(),
    });
    if (existing) {
      return res
        .status(409)
        .json({ message: "Classification already exists." });
    }

    const newClassification = new Classification({
      description: description.trim(),
    });
    const saved = await newClassification.save();

    res.status(201).json({
      message: "Classification added successfully.",
      data: saved,
    });
  } catch (error) {
    console.error("Error adding classification:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// Get all classifications
export const getClassifications = async (req, res) => {
  try {
    const classifications = await Classification.find().sort({ createdAt: -1 });
    res.status(200).json({ data: classifications });
  } catch (error) {
    console.error("Error fetching classifications:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// Get all classifications
export const getClassificationById = async (req, res) => {
  try {
    const { id } = req.params;
    const classifications = await Classification.findById(id);
    if (!classifications) {
      return res.status(404).json({ message: "Classifications not found." });
    }
    res.status(200).json({ data: classifications });
  } catch (error) {
    console.error("Error fetching classifications:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// Delete classification by ID
export const deleteClassification = async (req, res) => {
  try {
    const { id } = req.params;
    await Classification.findByIdAndDelete(id);
    res.status(200).json({ message: "Classification deleted successfully." });
  } catch (error) {
    console.error("Error deleting classification:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// Update classification by ID
export const updateClassification = async (req, res) => {
  try {
    const { id } = req.params;
    const { description } = req.body;

    const updated = await Classification.findByIdAndUpdate(
      id,
      { description: description.trim() },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Classification not found." });
    }

    res
      .status(200)
      .json({ message: "Classification updated successfully.", data: updated });
  } catch (error) {
    console.error("Error updating classification:", error);
    res.status(500).json({ message: "Server error." });
  }
};
