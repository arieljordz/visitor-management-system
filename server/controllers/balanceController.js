import mongoose from "mongoose";
import path from "path";
import fs from "fs";
import {
  TransactionEnum,
  PaymentMethodEnum,
  PaymentStatusEnum,
  UserRoleEnum,
  NotificationEnum,
} from "../enums/enums.js";
import User from "../models/User.js";
import Balance from "../models/Balance.js";
import PaymentDetail from "../models/PaymentDetail.js";
import {
  createNotification,
  emitNotification,
} from "../services/notificationService.js";
import cloudinary from "../utils/cloudinaryUtils.js";

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
      paymentMethod: paymentMethod || PaymentMethodEnum.E_WALLET,
      transaction: TransactionEnum.CREDIT,
      proofOfPayment: proofOfPaymentPath,
      referenceNumber,
      isVerified: false,
      status: PaymentStatusEnum.PENDING,
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
    await createNotification(
      userId,
      NotificationEnum.TOP_UP,
      NotificationEnum.PAYMENT,
      clientMessage,
      UserRoleEnum.SUBSCRIBER
    );
    emitNotification(req.app.get("io"), userId, clientMessage);

    // Create and emit notification for admin
    await createNotification(
      userId,
      NotificationEnum.TOP_UP,
      NotificationEnum.PAYMENT,
      adminMessage,
      UserRoleEnum.ADMIN
    );
    emitNotification(req.app.get("io"), UserRoleEnum.ADMIN, adminMessage);

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

export const submitSubscription = async (req, res) => {
  const { userId } = req.params;
  const { topUpAmount, paymentMethod, referenceNumber, planType } = req.body;

  const parsedAmount = parseFloat(topUpAmount);
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    return res.status(400).json({
      message: "The top-up amount must be a valid, positive number.",
    });
  }

  try {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // ⬇️ Upload image to Cloudinary if provided
    let proofOfPaymentPath = null;
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "subscriptions",
      });
      proofOfPaymentPath = result.secure_url;
      // ✅ Delete temp file after successful upload
      fs.unlinkSync(req.file.path);
    }

    const transaction = new PaymentDetail({
      userId: userObjectId,
      visitorId: null,
      amount: parsedAmount,
      paymentMethod: paymentMethod || PaymentMethodEnum.E_WALLET,
      transaction: TransactionEnum.CREDIT,
      proofOfPayment: proofOfPaymentPath,
      referenceNumber,
      isVerified: false,
      status: PaymentStatusEnum.PENDING,
      paymentDate: new Date(),
      completedDate: null,
    });

    await transaction.save();

    // 🔍 Get user's name for admin notification
    const user = await User.findById(userObjectId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    user.planType = planType;
    await user.save();

    const userName = user ? `${user.name.split(" ")[0]}` : "A user";

    const clientMessage = `You have requested a subscription of ₱${parsedAmount} via ${transaction.paymentMethod}. Awaiting verification.`;
    const adminMessage = `${userName} has requested a subscription of ₱${parsedAmount} via ${transaction.paymentMethod}. Please verify.`;

    // Create notification for client
    await createNotification(
      userId,
      NotificationEnum.SUBSCRIPTION,
      NotificationEnum.PAYMENT,
      clientMessage,
      UserRoleEnum.SUBSCRIBER
    );
    emitNotification(req.app.get("io"), userId, clientMessage);

    // Create and emit notification for admin
    await createNotification(
      userId,
      NotificationEnum.SUBSCRIPTION,
      NotificationEnum.PAYMENT,
      adminMessage,
      UserRoleEnum.ADMIN
    );
    emitNotification(req.app.get("io"), UserRoleEnum.ADMIN, adminMessage);

    return res.status(200).json({
      message:
        "Subscription submitted successfully. Please await admin verification.",
      transactionId: transaction._id,
    });
  } catch (error) {
    console.error("Error during subscription:", error);
    return res.status(500).json({
      message:
        "An error occurred while processing your subscription request. Please try again later.",
    });
  }
};
