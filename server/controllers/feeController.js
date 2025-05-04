import Fee from "../models/Fee.js";
import { fetchFeeByCodeAndStatus } from "../utils/feeUtils.js";

// Create a new fee
export const createFee = async (req, res) => {
  try {
    const { description, fee, feeCode, status } = req.body;

    // Validate required fields
    if (!description || !feeCode || !status || fee === undefined || fee === null) {
      return res.status(400).json({ message: "All fields (description, fee, feeCode, status) are required." });
    }

    // Validate fee is a number and non-negative
    const parsedFee = parseFloat(fee);
    if (isNaN(parsedFee) || parsedFee < 0) {
      return res.status(400).json({ message: "Fee must be a valid non-negative number." });
    }

    // Validate status
    if (!["active", "inactive"].includes(status.toLowerCase())) {
      return res.status(400).json({ message: "Status must be either 'active' or 'inactive'." });
    }

    const newFee = new Fee({
      description,
      fee: parsedFee,
      feeCode,
      status: status.toLowerCase(),
    });

    const savedFee = await newFee.save();
    res.status(201).json({ message: "Fee created successfully", data: savedFee });
  } catch (err) {
    console.error("Create Fee Error:", err);
    res.status(500).json({ message: "Failed to create fee", error: err.message });
  }
};

// Get all fees
export const getFees = async (req, res) => {
  try {
    const fees = await Fee.find().sort({ createdAt: -1 });
    res.status(200).json({ data: fees });
  } catch (err) {
    console.error("Get Fees Error:", err);
    res.status(500).json({ message: "Failed to retrieve fees", error: err.message });
  }
};

// Get a fee by ID
export const getFeeById = async (req, res) => {
  try {
    const fee = await Fee.findById(req.params.id);
    if (!fee) {
      return res.status(404).json({ message: "Fee not found" });
    }
    res.status(200).json({ data: fee });
  } catch (err) {
    console.error("Get Fee by ID Error:", err);
    res.status(500).json({ message: "Failed to retrieve fee", error: err.message });
  }
};

// Update a fee
export const updateFee = async (req, res) => {
  try {
    const { id } = req.params;
    const { description, fee, feeCode, status } = req.body;

    // Validate required fields
    if (!description || !feeCode || !status || fee === undefined || fee === null) {
      return res.status(400).json({ message: "All fields (description, fee, feeCode, status) are required." });
    }

    // Validate fee
    const parsedFee = parseFloat(fee);
    if (isNaN(parsedFee) || parsedFee < 0) {
      return res.status(400).json({ message: "Fee must be a valid non-negative number." });
    }

    // Validate status
    if (!["active", "inactive"].includes(status.toLowerCase())) {
      return res.status(400).json({ message: "Status must be either 'active' or 'inactive'." });
    }

    const updatedFee = await Fee.findByIdAndUpdate(
      id,
      {
        description,
        fee: parsedFee,
        feeCode,
        status: status.toLowerCase(),
      },
      { new: true, runValidators: true }
    );

    if (!updatedFee) {
      return res.status(404).json({ message: "Fee not found." });
    }

    res.status(200).json({ message: "Fee updated successfully", data: updatedFee });
  } catch (err) {
    console.error("Update Fee Error:", err);
    res.status(500).json({ message: "Failed to update fee", error: err.message });
  }
};

// Delete a fee
export const deleteFee = async (req, res) => {
  try {
    const deletedFee = await Fee.findByIdAndDelete(req.params.id);
    if (!deletedFee) {
      return res.status(404).json({ message: "Fee not found" });
    }
    res.status(200).json({ message: "Fee deleted" });
  } catch (err) {
    console.error("Delete Fee Error:", err);
    res.status(500).json({ message: "Failed to delete fee", error: err.message });
  }
};

// Get active "Generate QR" fee
export const getFeeByCodeAndStatus = async (req, res) => {
  try {
    const fee = await fetchFeeByCodeAndStatus(req.params.feeCode);

    res.status(200).json({
      message: `Active ${fee.description} fetched successfully`,
      data: fee,
    });
  } catch (err) {
    res.status(404).json({
      message: err.message || "Failed to fetch fee",
    });
  }
};
