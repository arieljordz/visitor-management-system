import cron from "node-cron";
import moment from "moment-timezone"; // use moment-timezone
import User from "../models/User.js";
import QRCode from "../models/QRCode.js";

export const startStatusJob = () => {
  cron.schedule("0 * * * *", async () => {
    // Set 'now' in PH time, and convert to native Date for MongoDB queries
    const now = moment().tz("Asia/Manila").startOf("day").toDate();

    try {
      // --- QR Code Expiration ---
      const activeQRCodes = await QRCode.find({ status: "active" }).populate("visitdetailsId");

      const expiredQRIds = activeQRCodes
        .filter((qr) => {
          const visitDate = qr.visitdetailsId?.visitDate;
          return (
            visitDate &&
            moment(visitDate).tz("Asia/Manila").isBefore(moment(now).tz("Asia/Manila"), "day")
          );
        })
        .map((qr) => qr._id);

      if (expiredQRIds.length > 0) {
        const result = await QRCode.updateMany(
          { _id: { $in: expiredQRIds } },
          { $set: { status: "expired" } }
        );
        console.log(`[CRON] QR codes marked as expired: ${result.modifiedCount}`);
      } else {
        console.log("[CRON] No expired QR codes found.");
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
