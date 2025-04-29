import PaymentMethod from "../models/PaymentMethod.js";

// Create a new payment method
export const createPaymentMethod = async (req, res) => {
  try {
    const { description, status = "active" } = req.body;

    if (!description) {
      return res.status(400).json({ message: "Description is required." });
    }

    const newMethod = new PaymentMethod({ description, status });
    const savedMethod = await newMethod.save();

    res.status(201).json({ message: "Payment method created", data: savedMethod });
  } catch (err) {
    console.error("Create error:", err);
    if (err.code === 11000) {
      // Duplicate key error (unique constraint)
      return res.status(400).json({ message: "Description must be unique." });
    }
    res.status(500).json({ message: "Failed to create payment method", error: err.message });
  }
};

// Get all payment methods
export const getPaymentMethods = async (req, res) => {
  try {
    const methods = await PaymentMethod.find().sort({ createdAt: -1 });
    res.status(200).json({ data: methods });
  } catch (err) {
    console.error("Get all error:", err);
    res.status(500).json({ message: "Failed to fetch payment methods", error: err.message });
  }
};

// Get all active payment methods
export const getActivePaymentMethods = async (req, res) => {
  try {
    const methods = await PaymentMethod.find({ status: "active" }).sort({ createdAt: -1 });
    res.status(200).json({ data: methods });
  } catch (err) {
    console.error("Get all error:", err);
    res.status(500).json({ message: "Failed to fetch payment methods", error: err.message });
  }
};

// Get a single payment method by ID
export const getPaymentMethodById = async (req, res) => {
  try {
    const method = await PaymentMethod.findById(req.params.id);
    if (!method) {
      return res.status(404).json({ message: "Payment method not found" });
    }
    res.status(200).json({ data: method });
  } catch (err) {
    console.error("Get by ID error:", err);
    res.status(500).json({ message: "Failed to fetch payment method", error: err.message });
  }
};

// Delete a payment method
export const deletePaymentMethod = async (req, res) => {
  try {
    const deleted = await PaymentMethod.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Payment method not found" });
    }
    res.status(200).json({ message: "Payment method deleted" });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ message: "Failed to delete payment method", error: err.message });
  }
};

// Update a payment method
export const updatePaymentMethod = async (req, res) => {
  try {
    const { description, status } = req.body;

    if (!description) {
      return res.status(400).json({ message: "Description is required." });
    }

    if (status && !["active", "inactive"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value." });
    }

    const updated = await PaymentMethod.findByIdAndUpdate(
      req.params.id,
      { description, status },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Payment method not found" });
    }

    res.status(200).json({ message: "Payment method updated", data: updated });
  } catch (err) {
    console.error("Update error:", err);
    if (err.code === 11000) {
      return res.status(400).json({ message: "Description must be unique." });
    }
    res.status(500).json({ message: "Failed to update payment method", error: err.message });
  }
};
