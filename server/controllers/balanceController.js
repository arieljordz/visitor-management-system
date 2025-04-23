import mongoose from "mongoose";
import path from "path";
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
  const { topUpAmount, paymentMethod } = req.body;

  console.log("Top-up request received for:", userId, req.body);

  // Step 1: Validate top-up amount
  const parsedAmount = parseFloat(topUpAmount);
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    return res
      .status(400)
      .json({ message: "The top-up amount must be a valid, positive number." });
  }

  try {
    // Step 2: Ensure valid user ObjectId
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Step 3: Handle file upload (proof of payment)
    const proofOfPaymentPath = req.file
      ? path.join("uploads", req.file.filename)
      : null;

    // Step 4: Create and save the payment transaction
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
      completedDate: null,
    });

    // Save the transaction to the database
    await transaction.save();
    console.log(
      "Transaction recorded (awaiting admin verification):",
      transaction._id
    );

    const message = `You have requested a top-up of ₱${parsedAmount} using ${transaction.paymentMethod}. Awaiting verification.`;

    // Create and save the notification
    const newNotification = await createNotification(
      userId,
      "Top-up",
      "Payment",
      message
    );

    // Emit the notification to the client
    emitNotification(req.app.get("io"), userId, message);

    // Step 7: Respond with a success message
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
