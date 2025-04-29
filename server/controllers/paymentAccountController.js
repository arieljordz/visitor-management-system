import PaymentAccount from "../models/PaymentAccount.js";

// Create a new Payment account
export const createPaymentAccount = async (req, res) => {
  try {
    const newMethod = new PaymentAccount(req.body);
    const savedMethod = await newMethod.save();
    res
      .status(201)
      .json({ message: "Payment account created", data: savedMethod });
  } catch (err) {
    console.error("Create error:", err);
    res
      .status(500)
      .json({
        message: "Failed to create Payment account",
        error: err.message,
      });
  }
};

// Get all Payment accounts
export const getPaymentAccounts = async (req, res) => {
  try {
    const methods = await PaymentAccount.find();
    res.status(200).json({ data: methods });
  } catch (err) {
    console.error("Get all error:", err);
    res
      .status(500)
      .json({
        message: "Failed to fetch Payment accounts",
        error: err.message,
      });
  }
};

// Get all active Payment accounts
export const getActivePaymentAccountsGroup = async (req, res) => {
  try {
    const methods = await PaymentAccount.find({ status: "active" });
    res.status(200).json({ data: methods });
  } catch (err) {
    console.error("Get all error:", err);
    res
      .status(500)
      .json({
        message: "Failed to fetch Payment accounts",
        error: err.message,
      });
  }
};

// Get all active Payment accounts group
export const getActivePaymentAccounts = async (req, res) => {
  try {
    const groupedMethods = await PaymentAccount.aggregate([
      { $match: { status: "active" } },
      {
        $group: {
          _id: "$method",
          accounts: {
            $push: {
              _id: "$_id",
              accountName: "$accountName",
              accountNumber: "$accountNumber",
              bankName: "$bankName",
              createdAt: "$createdAt",
              updatedAt: "$updatedAt",
            },
          },
        },
      },
      { $sort: { _id: 1 } } // Optional: sort methods alphabetically
    ]);

    res.status(200).json({ data: groupedMethods });
  } catch (err) {
    console.error("Get all error:", err);
    res.status(500).json({
      message: "Failed to fetch grouped payment accounts",
      error: err.message,
    });
  }
};

// Get a single Payment account by ID
export const getPaymentAccountById = async (req, res) => {
  try {
    const method = await PaymentAccount.findById(req.params.id);
    if (!method) {
      return res.status(404).json({ message: "Payment account not found" });
    }
    res.status(200).json({ data: method });
  } catch (err) {
    console.error("Get by ID error:", err);
    res
      .status(500)
      .json({ message: "Failed to fetch Payment account", error: err.message });
  }
};

// Delete a Payment account
export const deletePaymentAccount = async (req, res) => {
  try {
    const deleted = await PaymentAccount.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Payment account not found" });
    }
    res.status(200).json({ message: "Payment account deleted" });
  } catch (err) {
    console.error("Delete error:", err);
    res
      .status(500)
      .json({
        message: "Failed to delete Payment account",
        error: err.message,
      });
  }
};

// Update a Payment account
export const updatePaymentAccount = async (req, res) => {
  try {
    const updated = await PaymentAccount.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updated) {
      return res.status(404).json({ message: "Payment account not found" });
    }
    res.status(200).json({ message: "Payment account updated", data: updated });
  } catch (err) {
    console.error("Update error:", err);
    res
      .status(500)
      .json({
        message: "Failed to update Payment account",
        error: err.message,
      });
  }
};
