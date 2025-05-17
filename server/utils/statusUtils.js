import moment from "moment-timezone";
import QRCode from "../models/QRCode.js";

export const evaluateUserStatus = async (user) => {
  let updated = false;
  const now = moment().tz("Asia/Manila").startOf("day"); // PH timezone start of day
  console.log("user.dateNow:", now);
  console.log("user.expiryDate:", user.expiryDate);
  // Expire subscription
  if (
    user.subscription &&
    user.expiryDate &&
    moment(user.expiryDate).tz("Asia/Manila").isBefore(now, "day")
  ) {
    user.subscription = false;
    updated = true;
  }

  console.log("user.trialEndsAt:", user.trialEndsAt);
  // Expire trial
  if (
    user.isOnTrial &&
    user.trialEndsAt &&
    moment(user.trialEndsAt).tz("Asia/Manila").isBefore(now, "day")
  ) {
    user.isOnTrial = false;
    updated = true;
  }

  // Save user changes if any
  if (updated) {
    await user.save();
  }

  // Update QR codes for this user that are active but expired
  try {
    const expiredQRs = await QRCode.find({
      userId: user._id,
      status: "active",
      visitDate: { $lt: now.toDate() }, // still in UTC for DB comparison
    });

    if (expiredQRs.length > 0) {
      await QRCode.updateMany(
        { _id: { $in: expiredQRs.map((qr) => qr._id) } },
        { $set: { status: "expired" } }
      );
    }
  } catch (err) {
    console.error("[evaluateUserStatus] Error updating QR codes:", err);
  }

  return user;
};
