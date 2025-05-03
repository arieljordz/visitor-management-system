import cron from "node-cron";
import moment from "moment";
import QRCode from "../models/QRCode.js";

export const startQRStatusJob = () => {
  cron.schedule("0 0 * * *", async () => {
    const today = moment().startOf("day").toDate();

    try {
      const result = await QRCode.updateMany(
        {
          status: "active",
          visitDate: { $lt: today },
        },
        { status: "expired" }
      );
      console.log(`[CRON] Expired QR codes updated: ${result.modifiedCount}`);
    } catch (err) {
      console.error("[CRON] Error updating QR code status:", err.message);
    }
  });
};
