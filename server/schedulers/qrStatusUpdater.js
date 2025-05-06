import cron from "node-cron";
import QRCode from "../models/QRCode.js";
import moment from "moment";

export const startQRStatusJob = () => {
  cron.schedule("0 0 * * *", async () => { // Every hour on the hour
    const now = moment().startOf("day").toDate();

    try {
      const activeQRCodes = await QRCode.find({ status: "active" }).populate("visitdetailsId");

      const expiredQRIds = activeQRCodes
        .filter((qr) => {
          const visitDate = qr.visitdetailsId?.visitDate;
          return visitDate && moment(visitDate).isBefore(now, "day");
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
    } catch (err) {
      console.error("[CRON] Error updating QR code status:", err.message);
    }
  });
};
