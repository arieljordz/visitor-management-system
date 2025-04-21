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
        .status(200)
        .json({ balance: 0  });
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

    // Handle uploaded file path if any
    let proofOfPaymentPath = null;
    if (req.file) {
      proofOfPaymentPath = path.join("uploads", req.file.filename);
    }

    // Just log the transaction as pending
    const transaction = new PaymentDetail({
      userId: userObjectId,
      visitorId: null,
      amount: parsedAmount,
      paymentMethod: paymentMethod || "e-wallet",
      transaction: "credit",
      proofOfPayment: proofOfPaymentPath,
      isVerified: false,
      status: "pending",
      paymentDate: new Date(),
      completedDate: null, // Not completed yet until verified
    });

    await transaction.save();
    console.log(
      "Transaction recorded (awaiting verification):",
      transaction._id
    );

    return res.status(200).json({
      message: "Top-up request submitted. Awaiting admin verification.",
      transactionId: transaction._id,
    });
  } catch (error) {
    console.error("Top-up error:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};
