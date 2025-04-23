import mongoose from "mongoose";
import PaymentDetail from "../models/PaymentDetail.js";
import Balance from "../models/Balance.js";
import Fee from "../models/Fee.js";
import {
  createNotification,
  emitNotification,
} from "../services/notificationService.js";

export const processPayment = async (req, res) => {
  const {
    userId,
    visitorId,
    paymentMethod = "e-wallet",
    proofOfPayment = null,
  } = req.body;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "Invalid userId." });
  }

  try {
    const feeDoc = await Fee.findOne({
      description: { $regex: /generate qr fee/i },
      active: true,
    });

    if (!feeDoc) {
      return res.status(404).json({
        message: "'Generate QR fee' not found or inactive.",
      });
    }

    const feeAmount = feeDoc.fee ?? 0;

    const balanceDoc = await Balance.findOne({ userId });
    if (!balanceDoc) {
      return res.status(404).json({ message: "Balance record not found." });
    }

    if (balanceDoc.balance < feeAmount) {
      return res.status(400).json({ message: "Insufficient balance." });
    }

    balanceDoc.balance -= feeAmount;
    await balanceDoc.save();

    const payment = new PaymentDetail({
      userId,
      visitorId,
      amount: feeAmount,
      paymentMethod,
      transaction: "debit",
      status: "completed",
      proofOfPayment,
      verificationStatus: "verified",
      paymentDate: new Date(),
      completedDate: new Date(),
    });

    await payment.save();

    const io = req.app.get("io");
    io.emit("balance-updated", {
      userId,
      newBalance: balanceDoc.balance,
    });

    return res.status(200).json({
      newBalance: balanceDoc.balance,
      paymentId: payment._id,
    });
  } catch (error) {
    console.error("Payment processing failed:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getPaymentDetails = async (req, res) => {
  try {
    const paymentDetails = await PaymentDetail.find()
      .populate("userId") // Include user details
      .sort({ paymentDate: -1 }); // Newest first

    res.status(200).json({
      data: paymentDetails,
    });
  } catch (error) {
    console.error("Error fetching payment details:", error);
    res.status(500).json({ message: "Server error fetching payment details." });
  }
};

export const getPaymentDetailsById = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId." });
    }

    const paymentDetails = await PaymentDetail.find({ userId })
      .populate("userId")
      .populate("visitorId")
      .sort({ paymentDate: -1 })
      .lean();

    res.status(200).json({
      data: paymentDetails,
      total: paymentDetails.length,
    });
  } catch (error) {
    console.error("Error fetching payment details:", error);
    res.status(500).json({
      message: "Server error fetching payment details.",
      error: error.message,
    });
  }
};

export const getPaymentProofs = async (req, res) => {
  try {
    const paymentProofs = await PaymentDetail.find({
      transaction: "credit",
    })
      .populate("userId", "name email")
      .sort({ paymentDate: -1 });

    console.log("paymentProofs:", paymentProofs);

    res.status(200).json({
      data: paymentProofs,
    });
  } catch (error) {
    console.error("Error fetching proof of payments:", error);
    res
      .status(500)
      .json({ message: "Server error while fetching proof of payments" });
  }
};

export const deletePaymentProofs = async (req, res) => {
  const { selectedRows } = req.body; // Expecting an array of IDs

  try {
    // Delete the records from the database
    await PaymentDetail.deleteMany({ _id: { $in: selectedRows } });
    res.status(200).json({ message: "Records deleted successfully." });
  } catch (error) {
    console.error("Error deleting records:", error);
    res.status(500).json({ message: "Error deleting records." });
  }
};

export const updateVerificationStatus = async (req, res) => {
  const { id } = req.params;
  const { verificationStatus } = req.body;

  try {
    // ✅ Validate verification status
    const allowedStatuses = ["verified", "declined"];
    if (!allowedStatuses.includes(verificationStatus)) {
      return res.status(400).json({ message: "Invalid verification status." });
    }

    // 🔍 Find the payment
    const payment = await PaymentDetail.findOne({
      _id: id,
      transaction: "credit",
    });

    if (!payment) {
      return res
        .status(404)
        .json({ message: "Payment not found or not a credit transaction." });
    }

    if (payment.verificationStatus !== "pending") {
      return res
        .status(400)
        .json({ message: "Payment has already been verified or declined." });
    }

    // 🕐 Update verification status and completion time
    payment.verificationStatus = verificationStatus;
    payment.completedDate = new Date();

    // 💰 If verified, credit the user’s balance
    if (verificationStatus === "verified") {
      payment.status = "completed";

      let userBalance = await Balance.findOne({ userId: payment.userId });

      if (!userBalance) {
        userBalance = new Balance({
          userId: payment.userId,
          balance: payment.amount,
        });
      } else {
        userBalance.balance += payment.amount;
      }

      await userBalance.save();

      // 🔔 Emit updated balance to the user
      const io = req.app.get("io");
      io.emit("balance-updated", {
        userId: payment.userId,
        newBalance: userBalance.balance,
      });
    }

    // ❌ If declined, mark payment as cancelled
    if (verificationStatus === "declined") {
      payment.status = "cancelled";
    }

    await payment.save();

    const message = `₱${payment.amount} has been successfully added to your wallet after top-up verification.`;

    // Create and save the notification
    const newNotification = await createNotification(
      payment.userId,
      "Verification",
      "Payment",
      message
    );

    // Emit the notification to the client
    emitNotification(req.app.get("io"), payment.userId, message);

    return res.status(200).json({
      message: `Payment ${verificationStatus} successfully.`,
      data: payment,
    });
  } catch (error) {
    console.error("Error updating verification status:", error);
    return res.status(500).json({
      message: "Server error while updating payment status.",
      error: error.message,
    });
  }
};
