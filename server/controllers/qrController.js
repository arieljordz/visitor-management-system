import mongoose from "mongoose";
import moment from "moment";
import QRCode from "../models/QRCode.js";
import Visitor from "../models/Visitor.js";
import VisitDetail from "../models/VisitDetail.js";
import PaymentDetail from "../models/PaymentDetail.js";
import Balance from "../models/Balance.js";
import { fetchFeeByCodeAndStatus } from "../utils/feeUtils.js";

export const generateQRCodeWithPayment = async (req, res) => {
  const {
    userId,
    visitorId,
    visitdetailsId,
    paymentMethod = "e-wallet",
    proofOfPayment = null,
  } = req.body;

  // Validate ObjectIds
  if (
    !mongoose.Types.ObjectId.isValid(userId) ||
    !mongoose.Types.ObjectId.isValid(visitorId) ||
    !mongoose.Types.ObjectId.isValid(visitdetailsId)
  ) {
    return res.status(400).json({ message: "Invalid ID(s)." });
  }

  try {
    // Check if visitor exists
    const visitor = await Visitor.findById(visitorId);
    if (!visitor) {
      return res.status(404).json({ message: "Visitor not found." });
    }

    // Fetch visit date from visitdetailsId
    const visitDetail = await VisitDetail.findById(visitdetailsId);
    if (!visitDetail || !visitDetail.visitDate) {
      return res.status(404).json({ message: "Visit details not found or missing visit date." });
    }

    const targetVisitDate = moment(visitDetail.visitDate).startOf("day");
    const today = moment().startOf("day");

    // ❌ Prevent QR generation for past visit dates
    if (targetVisitDate.isBefore(today)) {
      return res.status(400).json({ message: "Cannot generate QR code for a past visit date." });
    }

    // Find all active QR codes for this visitor and user
    const activeQRCodes = await QRCode.find({
      visitorId,
      userId,
      status: { $in: ["active", "used"] },
    }).populate("visitdetailsId");

    // Check if any QR already exists for the same visit date
    const duplicateQR = activeQRCodes.find((qr) => {
      if (!qr.visitdetailsId?.visitDate) return false;
      const qrVisitDate = moment(qr.visitdetailsId.visitDate).startOf("day");
      return qrVisitDate.isSame(targetVisitDate);
    });

    if (duplicateQR) {
      return res.status(409).json({ message: "Active or Used QR code already exists for this visit date." });
    }

    // Get the active 'generate qr fee'
    const feeDoc = await fetchFeeByCodeAndStatus("GENQR01");
    const feeAmount = feeDoc.fee ?? 0;

    // Fetch and validate balance
    const balanceDoc = await Balance.findOne({ userId });
    if (!balanceDoc) {
      return res.status(404).json({ message: "Balance record not found." });
    }

    if (balanceDoc.balance < feeAmount) {
      return res.status(400).json({ message: "Insufficient balance." });
    }

    // Deduct balance
    balanceDoc.balance -= feeAmount;
    await balanceDoc.save();

    // Log payment
    const payment = new PaymentDetail({
      userId,
      visitorId,
      amount: feeAmount,
      paymentMethod,
      transaction: "debit",
      status: "completed",
      proofOfPayment,
      referenceNumber: null,
      verificationStatus: "verified",
      paymentDate: new Date(),
      completedDate: new Date(),
    });
    await payment.save();

    // Emit real-time balance update
    const io = req.app.get("io");
    if (io) {
      io.emit("balance-updated", {
        userId,
        newBalance: balanceDoc.balance,
      });
    }

    // Generate QR code
    const qrData = `visitor-${userId}-${visitorId}-${Date.now()}`;
    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(
      qrData
    )}&size=150x150`;

    // Save QR code
    const qrCodeDoc = new QRCode({
      userId,
      visitorId,
      visitdetailsId,
      qrData,
      qrImageUrl,
      status: "active",
      generatedAt: new Date(),
    });
    await qrCodeDoc.save();

    return res.status(200).json({
      message: "QR code generated and payment processed successfully.",
      data: {
        newBalance: balanceDoc.balance,
        paymentId: payment._id,
        qrCodeId: qrCodeDoc._id,
        qrImageUrl,
        qrData,
      },
    });

  } catch (error) {
    console.error("QR/payment combined process failed:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const scanQRCode = async (req, res) => {
  try {
    const { qrData } = req.params;

    if (!qrData) {
      return res.status(400).json({ message: "QR data is required." });
    }

    const qrCodeDoc = await QRCode.findOne({ qrData })
      .populate("visitorId")
      .populate("userId", "name email")
      .populate("visitdetailsId");

    if (!qrCodeDoc) {
      return res.status(404).json({ message: "QR code not found." });
    }

    if (["used", "expired"].includes(qrCodeDoc.status)) {
      return res.status(400).json({ message: `QR code has already been ${qrCodeDoc.status}.` });
    }

    const visitDate = moment(qrCodeDoc.visitdetailsId.visitDate).startOf("day");
    const today = moment().startOf("day");

    if (visitDate.isBefore(today)) {
      qrCodeDoc.status = "expired";
      await qrCodeDoc.save();
      return res.status(400).json({ message: "QR code is expired. Visit date has passed." });
    }

    if (!visitDate.isSame(today)) {
      return res.status(400).json({ message: "Visit date does not match today's date." });
    }

    qrCodeDoc.status = "used";
    await qrCodeDoc.save();

    const visitor = qrCodeDoc.visitorId;
    const visitorName =
      visitor.visitorType === "Individual"
        ? `${visitor.firstName} ${visitor.lastName}`
        : visitor.groupName;

    res.status(200).json({
      message: "QR code scanned successfully.",
      data: {
        clientName: qrCodeDoc.userId.name,
        visitorName,
        visitDate: moment(qrCodeDoc.visitdetailsId.visitDate).format("YYYY-MM-DD"),
        purpose: qrCodeDoc.visitdetailsId.purpose,
      },
    });
  } catch (error) {
    console.error("QR code scan error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getGeneratedQRCodes = async (req, res) => {
  try {
    const generatedQRCodes = await QRCode.find()
      .populate("userId", "name email")
      .populate("visitorId") 
      .populate("visitdetailsId") 
      .sort({ generatedAt: -1 })
      .lean();

    if (generatedQRCodes.length === 0) {
      return res.status(404).json({
        message: "No QR codes found.",
      });
    }

    return res.status(200).json({
      message:
        "Successfully fetched all generated QR codes with user details and visit information.",
      data: generatedQRCodes,
    });
  } catch (error) {
    console.error("Error fetching QR codes:", error.stack);

    let errorMessage = "Server error while fetching QR codes.";
    if (error.name === "CastError") {
      errorMessage = "Invalid data format in request.";
    }

    return res.status(500).json({
      message: errorMessage,
      error: error.message,
    });
  }
};

export const getGeneratedQRCodesById = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required." });
    }

    // Fetch QR codes created by the user
    const generatedQRCodes = await QRCode.find({ userId })
      .populate("userId", "name email")
      .populate("visitorId")
      .populate("visitdetailsId")
      .sort({ generatedAt: -1 })
      .lean();

    if (generatedQRCodes.length === 0) {
      return res
        .status(404)
        .json({ message: "No QR codes found for this user." });
    }

    // Optionally: fetch associated visit details for each QRCode
    const qrCodesWithVisitDetails = await Promise.all(
      generatedQRCodes.map(async (qr) => {
        const visitDetail = await VisitDetail.findOne({
          qrCodeId: qr._id,
        }).lean();
        return {
          ...qr,
          visitDetail: visitDetail || null,
        };
      })
    );

    return res.status(200).json({
      message: "Successfully fetched generated QR codes.",
      data: qrCodesWithVisitDetails,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Server error while fetching QR codes." });
  }
};

export const checkActiveQRCodeForVisit = async (req, res) => {
  try {
    const { visitorId, userId, visitdetailsId } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(visitorId) ||
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(visitdetailsId)
    ) {
      return res.status(400).json({ message: "Invalid ID(s)." });
    }

    const visitDetail = await VisitDetail.findById(visitdetailsId);
    if (!visitDetail || !visitDetail.visitDate) {
      return res.status(404).json({ message: "Visit details not found or missing visit date." });
    }

    const targetVisitDate = moment(visitDetail.visitDate).startOf("day");

    const qrCodes = await QRCode.find({
      visitorId,
      userId,
      status: { $in: ["active", "used"] },
    }).populate("visitdetailsId");

    const conflict = qrCodes.find((qr) => {
      if (!qr.visitdetailsId?.visitDate) return false;
      const qrVisitDate = moment(qr.visitdetailsId.visitDate).startOf("day");
      return qrVisitDate.isSame(targetVisitDate);
    });

    if (conflict) {
      const message =
        conflict.status === "active"
          ? "An *active* QR code already exists for this visit date."
          : "A QR code has already been *used* for this visit date.";

      return res.status(409).json({ message, status: conflict.status });
    }

    return res
      .status(200)
      .json({ message: "No conflicting QR code found. Safe to generate." });
  } catch (error) {
    console.error("Error checking QR code:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};


