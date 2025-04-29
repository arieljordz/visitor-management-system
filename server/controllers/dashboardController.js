import QRCode from "../models/QRCode.js";
import User from "../models/User.js";
import Visitor from "../models/Visitor.js";
import PaymentDetail from "../models/PaymentDetail.js";

export const getDashboardStats = async (req, res) => {
  try {
    const user = req.user;

    console.log("user:", user);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const isClient = user.role === "client";
    const matchCondition = isClient ? { userId: user._id } : {};

    // Prepare async operations
    const qrStatsPromise = QRCode.aggregate([
      { $match: matchCondition },
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    const paymentStatusPromise = PaymentDetail.aggregate([
      { $match: matchCondition },
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    const transactionTypePromise = PaymentDetail.aggregate([
      { $match: matchCondition },
      { $group: { _id: "$transaction", count: { $sum: 1 } } }
    ]);

    const verificationStatusPromise = PaymentDetail.aggregate([
      { $match: matchCondition },
      { $group: { _id: "$verificationStatus", count: { $sum: 1 } } }
    ]);

    const visitorCountPromise = isClient
      ? Visitor.countDocuments({ userId: user._id })
      : Visitor.countDocuments();

    const clientCountPromise = isClient
      ? Promise.resolve(null)
      : User.countDocuments({ role: "client" });

    // Wait for all promises
    const [
      qrStats,
      paymentStatus,
      transactionType,
      verificationStatus,
      visitorCount,
      clientCount
    ] = await Promise.all([
      qrStatsPromise,
      paymentStatusPromise,
      transactionTypePromise,
      verificationStatusPromise,
      visitorCountPromise,
      clientCountPromise
    ]);

    // Format QR stats
    const formattedQrStats = {
      total: 0,
      active: 0,
      used: 0,
      expired: 0
    };
    qrStats.forEach(({ _id, count }) => {
      formattedQrStats[_id] = count;
      formattedQrStats.total += count;
    });

    // Format payment status
    const formattedStatusStats = {
      total: 0,
      pending: 0,
      completed: 0,
      failed: 0,
      cancelled: 0
    };
    paymentStatus.forEach(({ _id, count }) => {
      formattedStatusStats[_id] = count;
      formattedStatusStats.total += count;
    });

    // Format transaction types
    const formattedTransactionStats = {
      total: 0,
      debit: 0,
      credit: 0
    };
    transactionType.forEach(({ _id, count }) => {
      formattedTransactionStats[_id] = count;
      formattedTransactionStats.total += count;
    });

    // Format verification stats
    const formattedVerificationStats = {
      total: 0,
      pending: 0,
      verified: 0,
      declined: 0
    };
    verificationStatus.forEach(({ _id, count }) => {
      formattedVerificationStats[_id] = count;
      formattedVerificationStats.total += count;
    });

    res.status(200).json({
      qrCodeStats: formattedQrStats,
      visitorCount,
      clientCount: clientCount !== null ? clientCount : undefined,
      paymentStats: {
        status: formattedStatusStats,
        transactionType: formattedTransactionStats,
        verificationStatus: formattedVerificationStats
      }
    });
  } catch (error) {
    console.error("Error in dashboard stats:", error);
    res.status(500).json({ message: "Failed to fetch dashboard statistics" });
  }
};
