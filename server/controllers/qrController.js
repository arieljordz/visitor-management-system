import mongoose from "mongoose";
import moment from "moment";
import QRCode from "../models/QRCode.js";
import User from "../models/User.js";
import Visitor from "../models/Visitor.js";
import VisitDetail from "../models/VisitDetail.js";
import PaymentDetail from "../models/PaymentDetail.js";
import Balance from "../models/Balance.js";
import ScanLog from "../models/ScanLog.js";
import { fetchFeeByCodeAndStatus } from "../utils/feeUtils.js";
import {
  TransactionEnum,
  QRStatusEnum,
  FeeCodeEnum,
  PaymentStatusEnum,
  VerificationStatusEnum,
  VisitorTypeEnum,
  ValidityEnum,
  PaymentMethodEnum,
} from "../enums/enums.js";

// For Prepaid
export const generateQRCodeWithPayment = async (req, res) => {
  const {
    userId,
    visitorId,
    visitDetailsId,
    paymentMethod = PaymentMethodEnum.E_WALLET,
    proofOfPayment = null,
  } = req.body;

  // console.log("QRCodeWithPayment:", req.body);
  // Validate ObjectIds
  if (
    !mongoose.Types.ObjectId.isValid(userId) ||
    !mongoose.Types.ObjectId.isValid(visitorId) ||
    !mongoose.Types.ObjectId.isValid(visitDetailsId)
  ) {
    return res.status(400).json({ message: "Invalid ID(s)." });
  }

  try {
    // Check if visitor exists
    const visitor = await Visitor.findById(visitorId);
    if (!visitor) {
      return res.status(404).json({ message: "Visitor not found." });
    }

    // Fetch visit date from visitDetailsId
    const visitDetail = await VisitDetail.findById(visitDetailsId);
    if (!visitDetail || !visitDetail.visitDate) {
      return res
        .status(404)
        .json({ message: "Visit details not found or missing visit date." });
    }

    const targetVisitDate = moment(visitDetail.visitDate).startOf("day");
    const today = moment().startOf("day");

    // ❌ Prevent QR generation for past visit dates
    if (targetVisitDate.isBefore(today)) {
      return res
        .status(400)
        .json({ message: "Cannot generate QR code for a past visit date." });
    }

    // Find all active QR codes for this visitor and user
    const activeQRCodes = await QRCode.find({
      visitorId,
      userId,
      status: { $in: [QRStatusEnum.ACTIVE, QRStatusEnum.USED] },
    }).populate("visitDetailsId");

    // Check if any QR already exists for the same visit date
    const duplicateQR = activeQRCodes.find((qr) => {
      if (!qr.visitDetailsId?.visitDate) return false;
      const qrVisitDate = moment(qr.visitDetailsId.visitDate).startOf("day");
      return qrVisitDate.isSame(targetVisitDate);
    });

    if (duplicateQR) {
      return res.status(409).json({
        message: "Active or Used QR code already exists for this visit date.",
      });
    }

    // Get the active 'generate qr fee'
    const feeDoc = await fetchFeeByCodeAndStatus(FeeCodeEnum.GENQR01);
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
      transaction: TransactionEnum.DEBIT,
      status: PaymentStatusEnum.COMPLETED,
      proofOfPayment,
      referenceNumber: null,
      verificationStatus: VerificationStatusEnum.VERIFIED,
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
      visitDetailsId,
      qrData,
      qrImageUrl,
      status: QRStatusEnum.ACTIVE,
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

// For Subscrition
export const generateQRCodeSubscription = async (req, res) => {
  const { userId, visitorId, visitDetailsId } = req.body;

  // console.log("Subscription:", req.body);
  // Validate ObjectIds
  if (
    !mongoose.Types.ObjectId.isValid(userId) ||
    !mongoose.Types.ObjectId.isValid(visitorId) ||
    !mongoose.Types.ObjectId.isValid(visitDetailsId)
  ) {
    return res.status(400).json({ message: "Invalid ID(s)." });
  }

  try {
    // Check if visitor exists
    const visitor = await Visitor.findById(visitorId);
    if (!visitor) {
      return res.status(404).json({ message: "Visitor not found." });
    }

    // Fetch visit detail
    const visitDetail = await VisitDetail.findById(visitDetailsId);
    if (!visitDetail || !visitDetail.visitDate) {
      return res
        .status(404)
        .json({ message: "Visit details not found or missing visit date." });
    }

    const targetVisitDate = moment(visitDetail.visitDate).startOf("day");
    const today = moment().startOf("day");

    // ❌ Prevent QR generation for past visit dates
    if (targetVisitDate.isBefore(today)) {
      return res
        .status(400)
        .json({ message: "Cannot generate QR code for a past visit date." });
    }

    // Find all active QR codes for this visitor and user
    const activeQRCodes = await QRCode.find({
      visitorId,
      userId,
      status: { $in: [QRStatusEnum.ACTIVE, QRStatusEnum.USED] },
    }).populate("visitDetailsId");

    // Check for duplicate QR for same visit date
    const duplicateQR = activeQRCodes.find((qr) => {
      const qrVisitDate = qr.visitDetailsId?.visitDate;
      return (
        qrVisitDate &&
        moment(qrVisitDate).startOf("day").isSame(targetVisitDate)
      );
    });

    if (duplicateQR) {
      return res.status(409).json({
        message: "Active or Used QR code already exists for this visit date.",
      });
    }

    // Generate QR code
    const qrData = `visitor-${userId}-${visitorId}-${Date.now()}`;
    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(
      qrData
    )}&size=150x150`;

    const qrCodeDoc = new QRCode({
      userId,
      visitorId,
      visitDetailsId,
      qrData,
      qrImageUrl,
      status: QRStatusEnum.ACTIVE,
      generatedAt: new Date(),
    });

    await qrCodeDoc.save();

    return res.status(200).json({
      message: "QR code generated successfully.",
      data: {
        qrCodeId: qrCodeDoc._id,
        qrImageUrl,
        qrData,
      },
    });
  } catch (error) {
    console.error("QR code generation failed:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const scanQRCode = async (req, res) => {
  try {
    const staffId = req.user._id;
    const { qrData, userId } = req.params;

    // Validate userId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID." });
    }

    // Validate QR data
    if (!qrData) {
      return res.status(400).json({ message: "QR data is required." });
    }

    // Find staff user
    const staffUser = await User.findById(staffId).select(
      "department name email"
    );
    if (!staffUser) {
      return res.status(404).json({ message: "Staff user not found." });
    }

    // Find QR code with populated references
    const qrCodeDoc = await QRCode.findOne({ qrData })
      .populate("visitorId")
      .populate("userId", "name email") // host
      .populate("visitDetailsId");

    if (!qrCodeDoc) {
      return res.status(404).json({ message: "QR code not found." });
    }

    const visitDetail = qrCodeDoc.visitDetailsId;
    const visitor = qrCodeDoc.visitorId;

    if (!visitDetail) {
      return res
        .status(400)
        .json({ message: "Visit details missing for QR code." });
    }

    if (!visitor) {
      return res
        .status(400)
        .json({ message: "Visitor information is missing." });
    }

    // Check department match
    if (staffUser.department !== visitDetail.department) {
      return res.status(403).json({
        message:
          "Department mismatch. You are not authorized to scan this QR code.",
      });
    }

    const today = moment().startOf("day");
    const visitDate = moment(visitDetail.visitDate).startOf("day");

    // Validity handling
    if (visitDetail.validity === ValidityEnum.VALID_TODAY) {
      if (!visitDate.isSame(today)) {
        qrCodeDoc.status = QRStatusEnum.EXPIRED;
        await qrCodeDoc.save();

        return res.status(400).json({
          message: "QR code is expired. Visit date has passed.",
        });
      }

      // Mark as used
      qrCodeDoc.status = QRStatusEnum.USED;
      await qrCodeDoc.save();
    } else if (visitDetail.validity === ValidityEnum.PERMANENT) {
      console.log("visitDetail.validity:", visitDetail.validity);
      if (visitDate.isAfter(today)) {
        return res.status(400).json({
          message: "QR code is not yet valid. Visit date is in the future.",
        });
      }

      // Permanent: Don't change status (remains ACTIVE)
    } else {
      return res.status(400).json({
        message: "Unknown validity type for this QR code.",
      });
    }

    // ✅ Log scan
    const scanLog = await ScanLog.create({
      qrCodeId: qrCodeDoc._id,
      scannedBy: staffUser._id,
      visitorId: visitor._id,
      validityType: visitDetail.validity,
      statusAtScan: qrCodeDoc.status,
    });

    // Build visitor name
    const visitorName =
      visitor.visitorType === VisitorTypeEnum.INDIVIDUAL
        ? `${visitor.firstName} ${visitor.lastName}`
        : visitor.groupName;

    return res.status(200).json({
      message: "VERIFIED!",
      data: {
        hostName: qrCodeDoc.userId?.name || null,
        scanTime: scanLog.scannedAt,
        visitor: {
          id: visitor._id,
          visitorType: visitor.visitorType,
          visitorName,
          firstName: visitor.firstName || null,
          lastName: visitor.lastName || null,
          groupName: visitor.groupName || null,
          visitorImage: visitor.visitorImage || null,
        },
        visitDetail: {
          visitDate: visitDetail.visitDate,
          purpose: visitDetail.purpose,
          department: visitDetail.department,
          classification: visitDetail.classification,
          noOfVisitors: visitDetail.noOfVisitors,
          validity: visitDetail.validity,
          createdAt: visitDetail.createdAt,
          updatedAt: visitDetail.updatedAt,
        },
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
      .populate("visitDetailsId")
      .sort({ generatedAt: -1 })
      .lean();

    return res.status(200).json({
      message: "Fetched all generated QR codes.",
      data: generatedQRCodes,
    });
  } catch (error) {
    console.error("Error fetching QR codes:", error.stack);

    return res.status(500).json({
      message:
        error.name === "CastError"
          ? "Invalid data format in request."
          : "Server error while fetching QR codes.",
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
      .populate("visitDetailsId")
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
    const { visitorId, userId, visitDetailsId } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(visitorId) ||
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(visitDetailsId)
    ) {
      return res.status(400).json({ message: "Invalid ID(s)." });
    }

    const visitDetail = await VisitDetail.findById(visitDetailsId);
    if (!visitDetail || !visitDetail.visitDate) {
      return res
        .status(404)
        .json({ message: "Visit details not found or missing visit date." });
    }

    const targetVisitDate = moment(visitDetail.visitDate).startOf("day");

    const qrCodes = await QRCode.find({
      visitorId,
      userId,
      status: { $in: [QRStatusEnum.ACTIVE, QRStatusEnum.USED] },
    }).populate("visitDetailsId");

    const conflict = qrCodes.find((qr) => {
      if (!qr.visitDetailsId?.visitDate) return false;
      const qrVisitDate = moment(qr.visitDetailsId.visitDate).startOf("day");
      return qrVisitDate.isSame(targetVisitDate);
    });

    if (conflict) {
      const message =
        conflict.status === QRStatusEnum.ACTIVE
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
