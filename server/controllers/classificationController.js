import mongoose from "mongoose";
import Classification from "../models/Classification.js";
import { StatusEnum } from "../enums/enums.js";

// Add new classification
export const createClassification = async (req, res) => {
  try {
    const { description, status } = req.body;
    const userId = req.user?._id;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(401).json({ message: "Unauthorized or invalid user." });
    }

    if (!description || !description.trim()) {
      return res.status(400).json({ message: "Description is required." });
    }

    const trimmedDescription = description.trim();

    // Check for duplicate (case-insensitive, per user)
    const existing = await Classification.findOne({
      userId,
      description: { $regex: new RegExp(`^${trimmedDescription}$`, "i") },
    });

    if (existing) {
      return res.status(409).json({
        message: "Classification already exists for this user.",
      });
    }

    const newClassification = new Classification({
      userId,
      description: trimmedDescription,
      status:
        status?.toLowerCase() === StatusEnum.INACTIVE
          ? StatusEnum.INACTIVE
          : StatusEnum.ACTIVE,
    });

    const saved = await newClassification.save();

    return res.status(201).json({
      message: "Classification added successfully.",
      data: saved,
    });
  } catch (error) {
    console.error("Error adding classification:", error);
    return res.status(500).json({ message: "Server error." });
  }
};

// Get all classifications
export const getClassifications = async (req, res) => {
  try {
    const userId = req.user?._id;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(401).json({ message: "Unauthorized or invalid user." });
    }

    const classifications = await Classification.find({ userId }).sort({
      createdAt: -1,
    });

    return res.status(200).json({ data: classifications });
  } catch (error) {
    console.error("Error fetching classifications:", error);
    return res.status(500).json({ message: "Server error." });
  }
};

// Get classification by ID
export const getClassificationById = async (req, res) => {
  try {
    const { id } = req.params;
    const classification = await Classification.findById(id);
    if (!classification) {
      return res.status(404).json({ message: "Classification not found." });
    }
    res.status(200).json({ data: classification });
  } catch (error) {
    console.error("Error fetching classification:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// Delete classification by ID
export const deleteClassification = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Classification.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Classification not found." });
    }
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
    const { description, status } = req.body;

    const updateFields = {};
    if (description) updateFields.description = description.trim();
    if (status) {
      if (
        ![StatusEnum.ACTIVE, StatusEnum.INACTIVE].includes(status.toLowerCase())
      ) {
        return res.status(400).json({ message: "Invalid status value." });
      }
      updateFields.status = status.toLowerCase();
    }

    const updated = await Classification.findByIdAndUpdate(id, updateFields, {
      new: true,
    });

    if (!updated) {
      return res.status(404).json({ message: "Classification not found." });
    }

    res.status(200).json({
      message: "Classification updated successfully.",
      data: updated,
    });
  } catch (error) {
    console.error("Error updating classification:", error);
    res.status(500).json({ message: "Server error." });
  }
};
