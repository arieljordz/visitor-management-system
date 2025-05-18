import QRCode from "../models/QRCode.js";
import User from "../models/User.js";
import Visitor from "../models/Visitor.js";
import PaymentDetail from "../models/PaymentDetail.js";
import { UserRoleEnum, QRStatusEnum, VerificationStatusEnum } from "../enums/enums.js";

export const getDashboardStats = async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    let stats = {};

    if (user.role === UserRoleEnum.ADMIN) {
      const [subscribers, qrCodes, pendingSubscriptions, visitors] = await Promise.all([
        User.find({ role: UserRoleEnum.SUBSCRIBER }),
        QRCode.find({}), // All QR codes by all subscribers
        PaymentDetail.find({ verificationStatus: VerificationStatusEnum.PENDING }),
        Visitor.find({})
      ]);

      stats = {
        subscriberCount: subscribers.length,
        totalQRCodes: qrCodes.length,
        pendingSubscriptions: pendingSubscriptions.length,
        totalVisitors: visitors.length
      };
    }

    if (user.role === UserRoleEnum.SUBSCRIBER) {
      const [allQRCodes, activeQRCodes, usedQRCodes, visitors] = await Promise.all([
        QRCode.countDocuments({ userId: user._id }),
        QRCode.countDocuments({ userId: user._id, status: QRStatusEnum.ACTIVE }),
        QRCode.countDocuments({ userId: user._id, status: QRStatusEnum.USED }),
        Visitor.countDocuments({ userId: user._id })
      ]);

      stats = {
        totalQRCodes: allQRCodes,
        activeQRCodes,
        usedQRCodes,
        visitorCount: visitors
      };
    }

    res.status(200).json({ stats });

  } catch (error) {
    console.error("Error in getDashboardStats:", error);
    res.status(500).json({ message: "Failed to fetch dashboard statistics" });
  }
};
