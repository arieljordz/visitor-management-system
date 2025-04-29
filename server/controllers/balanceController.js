import mongoose from "mongoose";
import path from "path";
import User from "../models/User.js";
import Balance from "../models/Balance.js";
import PaymentDetail from "../models/PaymentDetail.js";
import {
  createNotification,
  emitNotification,
} from "../services/notificationService.js";

// Get user balance handler
export const getBalance = async (req, res) => {
  const userId = req.params.userId;

  try {
    const balance = await Balance.findOne({ userId }).exec();

    if (!balance) {
      return res.status(200).json({ data: { balance: 0 } });
    }

    return res.status(200).json({ data: { balance: balance.balance } });
  } catch (error) {
    console.error("Error fetching balance:", error);
    return res
      .status(500)
      .json({ message: "Server error, please try again later" });
  }
};

export const topUp = async (req, res) => {
  const { userId } = req.params;
  const { topUpAmount, paymentMethod, referenceNumber } = req.body;

  const parsedAmount = parseFloat(topUpAmount);
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    return res.status(400).json({
      message: "The top-up amount must be a valid, positive number.",
    });
  }

  try {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const proofOfPaymentPath = req.file
      ? path.join("uploads", req.file.filename)
      : null;

    const transaction = new PaymentDetail({
      userId: userObjectId,
      visitorId: null,
      amount: parsedAmount,
      paymentMethod: paymentMethod || "e-wallet",
      transaction: "credit",
      proofOfPayment: proofOfPaymentPath,
      referenceNumber,
      isVerified: false,
      status: "pending",
      paymentDate: new Date(),
      completedDate: null,
    });

    await transaction.save();

    // 🔍 Get user's name for admin notification
    const user = await User.findById(userObjectId).lean();
    const userName = user ? `${user.name.split(" ")[0]}` : "A user";

    const clientMessage = `You have requested a top-up of ₱${parsedAmount} using ${transaction.paymentMethod}. Awaiting verification.`;
    const adminMessage = `${userName} has requested a top-up of ₱${parsedAmount} using ${transaction.paymentMethod}. Verify now.`;

    // Create notification for client
    await createNotification(userId, "Top-up", "Payment", clientMessage, "client");
    emitNotification(req.app.get("io"), userId, clientMessage);

    // Create and emit notification for admin
    await createNotification(userId, "Top-up", "Payment", adminMessage, "admin");
    emitNotification(req.app.get("io"), "admin", adminMessage);

    return res.status(200).json({
      message:
        "Top-up request submitted successfully. Please await admin verification.",
      transactionId: transaction._id,
    });
  } catch (error) {
    console.error("Error during top-up:", error);
    return res.status(500).json({
      message:
        "An error occurred while processing your top-up request. Please try again later.",
    });
  }
};

