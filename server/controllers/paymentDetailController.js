import mongoose from "mongoose";
import Balance from "../models/Balance.js"; // Assuming Balance schema is located here
import PaymentDetail from "../models/PaymentDetail.js";

// Process payment handler
export const processPayment = async (req, res) => {
  try {
    const userId = req.body.userId; // Get userId from body
    console.log("processPayment body", req.body); // Log to verify the body content

    const balanceDoc = await Balance.findOne({ userId });
    if (!balanceDoc) {
      return res.status(404).json({ message: "Balance record not found." });
    }

    if (balanceDoc.balance < 100) {
      return res.status(400).json({ message: "Insufficient balance." });
    }

    // Deduct ₱100 from balance
    balanceDoc.balance -= 100;
    await balanceDoc.save();

    // Create new payment log
    const payment = new PaymentDetail({
      userId,
      amount: 100,
      paymentMethod: req.body.paymentMethod || "e-wallet", // Default fallback
      status: "completed",
      paymentDate: new Date(),
      completedDate: new Date(),
    });

    await payment.save();

    res.json({
      message: "Payment recorded successfully",
      newBalance: balanceDoc.balance,
      paymentId: payment._id, // if needed in the frontend
    });
  } catch (error) {
    console.error("Payment processing failed:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

