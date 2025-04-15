import mongoose from "mongoose";
import Balance from "../models/Balance.js";
import PaymentDetail from "../models/PaymentDetail.js";
import path from "path";

// Get user balance handler
export const getBalance = async (req, res) => {
  const userId = req.params.userId;

  try {
    const balance = await Balance.findOne({ userId }).exec();
    if (!balance) {
      return res
        .status(404)
        .json({ message: "Balance not found for this user" });
    }
    return res.status(200).json({ balance: balance.balance });
  } catch (error) {
    console.error("Error fetching balance:", error);
    return res
      .status(500)
      .json({ message: "Server error, please try again later" });
  }
};

export const topUp = async (req, res) => {
  const { userId } = req.params;
  const { topUpAmount, paymentMethod } = req.body;

  console.log("Top-up request received for:", userId, req.body);

  const parsedAmount = parseFloat(topUpAmount);
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    return res.status(400).json({ message: "Invalid top-up amount." });
  }

  try {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Find or create user balance
    let balance = await Balance.findOne({ userId: userObjectId });
    if (!balance) {
      balance = new Balance({
        userId: userObjectId,
        balance: parsedAmount,
      });
      await balance.save();
      console.log("New balance created:", balance.balance);
    } else {
      balance.balance += parsedAmount;
      await balance.save();
      console.log("Updated balance:", balance.balance);
    }

    // Handle uploaded file path if any
    let proofOfPaymentPath = null;
    if (req.file) {
      proofOfPaymentPath = path.join("uploads", req.file.filename); // adjust based on your storage structure
    }

    // Log the payment transaction
    const transaction = new PaymentDetail({
      userId: userObjectId,
      amount: parsedAmount,
      paymentMethod: paymentMethod || "e-wallet",
      transaction: "credit",
      proofOfPayment: proofOfPaymentPath,
      status: "completed",
      paymentDate: new Date(),
      completedDate: new Date(),
    });

    await transaction.save();
    console.log("Transaction recorded:", transaction._id);

    return res.status(200).json({
      message: "Top-up successful.",
      balance: balance.balance,
    });
  } catch (error) {
    console.error("Top-up error:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};
