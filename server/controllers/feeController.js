import Fee from "../models/Fee.js";

// Create a new fee
export const createFee = async (req, res) => {
  try {
    const { description, fee, status } = req.body;

    if (!description || !["active", "inactive"].includes(status)) {
      return res.status(400).json({ message: "Description and valid status are required." });
    }

    const newFee = new Fee({ description, fee, status });
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
    const { description, fee, status } = req.body;

    if (!description || !["active", "inactive"].includes(status)) {
      return res.status(400).json({ message: "Description and valid status are required." });
    }

    const updatedFee = await Fee.findByIdAndUpdate(
      id,
      { description, fee, status },
      { new: true, runValidators: true }
    );

    if (!updatedFee) {
      return res.status(404).json({ message: "Fee not found" });
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
export const getActiveGenerateQRFee = async (req, res) => {
  try {
    const fee = await Fee.findOne({
      description: { $regex: /generate qr fee/i },
      status: "active",
    });

    if (!fee) {
      return res.status(404).json({ message: "Active 'Generate QR fee' not found." });
    }

    res.status(200).json({ message: "Active 'Generate QR fee' fetched successfully", data: fee });
  } catch (err) {
    console.error("Get Active Generate QR Fee Error:", err);
    res.status(500).json({ message: "Failed to fetch fee", error: err.message });
  }
};
