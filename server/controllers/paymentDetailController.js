import mongoose from "mongoose";
import Balance from "../models/Balance.js"; 
import PaymentDetail from "../models/PaymentDetail.js";

export const processPayment = async (req, res) => {
  try {
    const { userId, paymentMethod = "e-wallet", proofOfPayment = null } = req.body;

    // console.log("processPayment body", req.body);

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId." });
    }

    const balanceDoc = await Balance.findOne({ userId });
    if (!balanceDoc) {
      return res.status(404).json({ message: "Balance record not found." });
    }

    if (balanceDoc.balance < 100) {
      return res.status(400).json({ message: "Insufficient balance." });
    }

    // Deduct ₱100 from the balance
    balanceDoc.balance -= 100;
    await balanceDoc.save();

    // Create the payment transaction record
    const payment = new PaymentDetail({
      userId,
      amount: 100,
      paymentMethod,
      transaction: "debit", // Required by your schema
      status: "completed",
      proofOfPayment, // Optional, pass null if not provided
      paymentDate: new Date(),
      completedDate: new Date(),
    });

    await payment.save();

    res.json({
      message: "Payment recorded successfully",
      newBalance: balanceDoc.balance,
      paymentId: payment._id,
    });
  } catch (error) {
    console.error("Payment processing failed:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
