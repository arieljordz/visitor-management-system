import Department from "../models/Department.js";
import { StatusEnum } from "../enums/enums.js";

// Add new Department
export const createDepartment = async (req, res) => {
  try {
    const { description, status } = req.body;

    if (!description || !description.trim()) {
      return res.status(400).json({ message: "Description is required." });
    }

    const trimmedDescription = description.trim();

    // Check for duplicate (case-insensitive)
    const existing = await Department.findOne({
      description: { $regex: new RegExp(`^${trimmedDescription}$`, "i") },
    });
    if (existing) {
      return res
        .status(409)
        .json({ message: "Department already exists." });
    }

    const newDepartment = new Department({
      description: trimmedDescription,
      status:
        status?.toLowerCase() === StatusEnum.INACTIVE
          ? StatusEnum.INACTIVE
          : StatusEnum.ACTIVE, // defaults to "active"
    });

    const saved = await newDepartment.save();

    res.status(201).json({
      message: "Department added successfully.",
      data: saved,
    });
  } catch (error) {
    console.error("Error adding Department:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// Get all Departments
export const getDepartments = async (req, res) => {
  try {
    const departments = await Department.find().sort({ createdAt: -1 });
    res.status(200).json({ data: departments });
  } catch (error) {
    console.error("Error fetching Departments:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// Get Department by ID
export const getDepartmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const department = await Department.findById(id);
    if (!department) {
      return res.status(404).json({ message: "Department not found." });
    }
    res.status(200).json({ data: department });
  } catch (error) {
    console.error("Error fetching Department:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// Delete Department by ID
export const deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Department.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Department not found." });
    }
    res.status(200).json({ message: "Department deleted successfully." });
  } catch (error) {
    console.error("Error deleting Department:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// Update Department by ID
export const updateDepartment = async (req, res) => {
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

    const updated = await Department.findByIdAndUpdate(id, updateFields, {
      new: true,
    });

    if (!updated) {
      return res.status(404).json({ message: "Department not found." });
    }

    res.status(200).json({
      message: "Department updated successfully.",
      data: updated,
    });
  } catch (error) {
    console.error("Error updating Department:", error);
    res.status(500).json({ message: "Server error." });
  }
};
