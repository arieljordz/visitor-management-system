import cron from "node-cron";
import moment from "moment-timezone";
import User from "../models/User.js";
import QRCode from "../models/QRCode.js";
import { QRStatusEnum } from "../enums/enums.js";

export const startStatusJob = () => {
  cron.schedule("0 * * * *", async () => {
    const now = moment().tz("Asia/Manila").startOf("day").toDate();

    try {
      // --- QR Code Expiration ---
      const qrCodesToCheck = await QRCode.find({
        status: { $in: [QRStatusEnum.ACTIVE, QRStatusEnum.PENDING] },
      }).populate("visitDetailsId");

      const expiredQRIds = qrCodesToCheck
        .filter((qr) => {
          const visitDate = qr.visitDetailsId?.visitDate;
          return (
            visitDate &&
            moment(visitDate).tz("Asia/Manila").isBefore(now, "day")
          );
        })
        .map((qr) => qr._id);

      if (expiredQRIds.length > 0) {
        const result = await QRCode.updateMany(
          { _id: { $in: expiredQRIds } },
          { $set: { status: QRStatusEnum.EXPIRED } }
        );
        console.log(`[CRON] QR codes marked as expired: ${result.modifiedCount}`);
      } else {
        console.log("[CRON] No QR codes needed expiration update.");
      }

      // --- User Subscription & Trial Cleanup ---
      const subResult = await User.updateMany(
        {
          subscription: true,
          expiryDate: { $lt: now },
        },
        { $set: { subscription: false } }
      );

      const trialResult = await User.updateMany(
        {
          isOnTrial: true,
          trialEndsAt: { $lt: now },
        },
        { $set: { isOnTrial: false } }
      );

      console.log(`[CRON] Users' subscriptions marked false: ${subResult.modifiedCount}`);
      console.log(`[CRON] Users' trials marked false: ${trialResult.modifiedCount}`);

    } catch (err) {
      console.error("[CRON] Error during cron job execution:", err.message);
    }
  });
};
