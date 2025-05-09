import mongoose from "mongoose";
import User from "../models/User.js";
import PaymentDetail from "../models/PaymentDetail.js";
import Balance from "../models/Balance.js";
import {
  createNotification,
  emitNotification,
} from "../services/notificationService.js";
import {
  TransactionEnum,
  VerificationStatusEnum,
  PaymentStatusEnum,
  NotificationEnum,
  UserRoleEnum,
} from "../enums/enums.js";

export const getPaymentDetails = async (req, res) => {
  try {
    const paymentDetails = await PaymentDetail.find()
      .populate("userId", "name email") // Include user details
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
      .populate("userId", "name email")
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
      transaction: TransactionEnum.CREDIT,
    })
      .populate("userId", "name email")
      .sort({ paymentDate: -1 });

    // console.log("paymentProofs:", paymentProofs);

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
  const { selectedRows } = req.body;

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
  const { verificationStatus, reason = "" } = req.body;

  const io = req.app.get("io");

  const allowedStatuses = [
    VerificationStatusEnum.VERIFIED,
    VerificationStatusEnum.DECLINED,
  ];
  if (!allowedStatuses.includes(verificationStatus)) {
    return res.status(400).json({ message: "Invalid verification status." });
  }

  try {
    // 🔍 Find payment with credit transaction
    const payment = await PaymentDetail.findOne({
      _id: id,
      transaction: TransactionEnum.CREDIT,
    });
    if (!payment) {
      return res.status(404).json({
        message: "Payment not found or not a credit transaction.",
      });
    }

    if (payment.verificationStatus !== VerificationStatusEnum.PENDING) {
      return res.status(400).json({
        message: "Payment has already been verified or declined.",
      });
    }

    // ✏️ Update verification status and completion date
    payment.verificationStatus = verificationStatus;
    payment.completedDate = new Date();

    if (verificationStatus === VerificationStatusEnum.VERIFIED) {
      // ✅ Mark payment as completed
      payment.status = PaymentStatusEnum.COMPLETED;

      // 💰 Update or create user balance
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

      // 🔔 Emit new balance
      io.emit("balance-updated", {
        userId: payment.userId,
        newBalance: userBalance.balance,
      });
    }

    if (verificationStatus === VerificationStatusEnum.DECLINED) {
      // ❌ Mark payment as cancelled and store reason
      payment.status = PaymentStatusEnum.CANCELLED;
      payment.reason = reason || "No reason provided.";
    }

    await payment.save();

    // 🧑 Fetch user's first name
    const user = await User.findById(payment.userId).lean();
    const userName = user?.name?.split(" ")[0] || "A user";

    // ✉️ Compose notification messages
    const clientMessage =
      verificationStatus === VerificationStatusEnum.VERIFIED
        ? `₱${payment.amount} has been successfully added to your wallet after top-up verification.`
        : `Your top-up of ₱${payment.amount} was declined. Reason: ${payment.reason}`;

    const adminMessage =
      verificationStatus === VerificationStatusEnum.VERIFIED
        ? `Top-up of ₱${payment.amount} for ${userName} has been verified and added to the wallet.`
        : `Top-up of ₱${payment.amount} for ${userName} was declined. Reason: ${payment.reason}`;

    // 🔔 Send notifications
    await createNotification(
      payment.userId,
      NotificationEnum.TOP_UP,
      NotificationEnum.PAYMENT,
      clientMessage,
      UserRoleEnum.SUBSCRIBER
    );
    emitNotification(io, payment.userId, clientMessage);

    await createNotification(
      payment.userId,
      NotificationEnum.TOP_UP,
      NotificationEnum.PAYMENT,
      adminMessage,
      UserRoleEnum.ADMIN
    );
    emitNotification(io, UserRoleEnum.ADMIN, adminMessage);

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

export const verifyPayment = async (req, res) => {
  const { id } = req.params;

  try {
    const payment = await PaymentDetail.findOne({
      _id: id,
      transaction: TransactionEnum.CREDIT,
    });

    if (!payment) {
      return res
        .status(404)
        .json({ message: "Payment not found or not a credit transaction." });
    }

    if (payment.verificationStatus !== VerificationStatusEnum.PENDING) {
      return res
        .status(400)
        .json({ message: "Payment has already been verified or declined." });
    }

    // Update status
    payment.verificationStatus = VerificationStatusEnum.VERIFIED;
    payment.status = PaymentStatusEnum.COMPLETED;
    payment.completedDate = new Date();

    // Update user's balance
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

    // Emit balance update
    const io = req.app.get("io");
    io.emit("balance-updated", {
      userId: payment.userId,
      newBalance: userBalance.balance,
    });

    await payment.save();

    // Notify client and admin
    const user = await User.findById(payment.userId).lean();
    const userName = user ? `${user.name.split(" ")[0]}` : "A user";
    const clientMessage = `₱${payment.amount} has been successfully added to your wallet after top-up verification.`;
    const adminMessage = `Top-up of ₱${payment.amount} for ${userName} has been verified and added to the wallet.`;

    await createNotification(
      payment.userId,
      NotificationEnum.TOP_UP,
      NotificationEnum.PAYMENT,
      clientMessage,
      UserRoleEnum.SUBSCRIBER
    );
    await createNotification(
      payment.userId,
      NotificationEnum.TOP_UP,
      NotificationEnum.PAYMENT,
      adminMessage,
      UserRoleEnum.ADMIN
    );
    emitNotification(io, payment.userId, clientMessage);
    emitNotification(io, UserRoleEnum.ADMIN, adminMessage);

    return res.status(200).json({
      message: "Payment verified successfully.",
      data: payment,
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    return res
      .status(500)
      .json({ message: "Server error.", error: error.message });
  }
};

export const declinePayment = async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  try {
    const payment = await PaymentDetail.findOne({
      _id: id,
      transaction: TransactionEnum.CREDIT,
    });

    if (!payment) {
      return res
        .status(404)
        .json({ message: "Payment not found or not a credit transaction." });
    }

    if (payment.verificationStatus !== VerificationStatusEnum.PENDING) {
      return res
        .status(400)
        .json({ message: "Payment has already been verified or declined." });
    }

    // Update status
    payment.verificationStatus = VerificationStatusEnum.DECLINED;
    payment.status = PaymentStatusEnum.CANCELLED;
    payment.completedDate = new Date();
    if (reason) payment.reason = reason;

    await payment.save();

    const clientMessage = `Your top-up of ₱${payment.amount} has been declined${
      reason ? `: ${reason}` : "."
    }`;
    const io = req.app.get("io");

    await createNotification(
      payment.userId,
      NotificationEnum.TOP_UP,
      NotificationEnum.PAYMENT,
      clientMessage,
      UserRoleEnum.SUBSCRIBER
    );
    emitNotification(io, payment.userId, clientMessage);

    return res.status(200).json({
      message: "Payment declined successfully.",
      data: payment,
    });
  } catch (error) {
    console.error("Error declining payment:", error);
    return res
      .status(500)
      .json({ message: "Server error.", error: error.message });
  }
};
