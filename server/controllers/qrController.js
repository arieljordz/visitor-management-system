import mongoose from "mongoose";
import moment from "moment";
import QRCode from "../models/QRCode.js";
import Visitor from "../models/Visitor.js";
import PaymentDetail from "../models/PaymentDetail.js";
import Balance from "../models/Balance.js";
import Fee from "../models/Fee.js";

export const generateQRCodeWithPayment = async (req, res) => {
  const {
    userId,
    visitorId,
    paymentMethod = "e-wallet",
    proofOfPayment = null,
  } = req.body;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "Invalid user ID." });
  }
  if (!mongoose.Types.ObjectId.isValid(visitorId)) {
    return res.status(400).json({ message: "Invalid visitor ID." });
  }

  try {
    const visitor = await Visitor.findById(visitorId);
    if (!visitor) {
      return res.status(404).json({ message: "Visitor not found." });
    }

    const existingQR = await QRCode.findOne({ visitorId, status: "active" });
    if (existingQR) {
      return res.status(400).json({ message: "Visitor already has an active QR code." });
    }

    const feeDoc = await Fee.findOne({
      description: { $regex: /generate qr fee/i },
      status: "active",
    });
    if (!feeDoc) {
      return res.status(404).json({ message: "'Generate QR fee' not found or inactive." });
    }

    const feeAmount = feeDoc.fee ?? 0;

    const balanceDoc = await Balance.findOne({ userId });
    if (!balanceDoc) {
      return res.status(404).json({ message: "Balance record not found." });
    }

    if (balanceDoc.balance < feeAmount) {
      return res.status(400).json({ message: "Insufficient balance." });
    }

    balanceDoc.balance -= feeAmount;
    await balanceDoc.save();

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

    const io = req.app.get("io");
    io.emit("balance-updated", {
      userId,
      newBalance: balanceDoc.balance,
    });

    const qrData = `visitor-${userId}-${visitorId}-${Date.now()}`;
    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(
      qrData
    )}&size=150x150`;

    const qrCodeDoc = new QRCode({
      userId,
      visitorId,
      qrData,
      qrImageUrl,
      status: "active",
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

export const generateQRCode = async (req, res) => {
  try {
    const { userId, visitorId } = req.params;

    // Validate ObjectIds
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID." });
    }
    if (!mongoose.Types.ObjectId.isValid(visitorId)) {
      return res.status(400).json({ message: "Invalid visitor ID." });
    }

    // Optional: Check if visitor exists
    const visitorExists = await Visitor.findById(visitorId);
    if (!visitorExists) {
      return res.status(404).json({ message: "Visitor not found." });
    }

    // Generate QR data and image URL
    const qrData = `visitor-${userId}-${visitorId}-${Date.now()}`;
    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(
      qrData
    )}&size=150x150`;

    // Save QRCode document
    const qrCodeDoc = new QRCode({
      userId,
      visitorId,
      qrData,
      qrImageUrl,
      status: "active",
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
    console.error("QR generation failed:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const scanQRCode = async (req, res) => {
  try {
    const { qrData } = req.params;

    console.log("Received QR Data:", qrData);

    if (!qrData) {
      return res.status(400).json({ message: "QR data is required." });
    }

    const qrCodeDoc = await QRCode.findOne({ qrData }).populate("visitorId");

    if (!qrCodeDoc) {
      return res.status(404).json({ message: "QR code not found." });
    }

    if (qrCodeDoc.status === "used") {
      return res.status(400).json({ message: "QR code has already been used." });
    }

    if (qrCodeDoc.status === "expired") {
      return res.status(400).json({ message: "QR code has expired." });
    }

    const visitDate = moment(qrCodeDoc.visitorId.visitDate).startOf("day");
    const today = moment().startOf("day");

    if (visitDate.isBefore(today)) {
      qrCodeDoc.status = "expired";
      await qrCodeDoc.save();
      return res.status(400).json({ message: "QR code is expired. Visit date has passed." });
    }

    if (!visitDate.isSame(today)) {
      return res.status(400).json({ message: "Visit date does not match today's date." });
    }

    // Mark as used
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
        visitDate: visitor.visitDate,
        purpose: visitor.purpose,
      },
    });
  } catch (error) {
    console.error("QR code scan error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getGeneratedQRCodes = async (req, res) => {
  try {
    // Fetch all QR codes with user info, sorted by generation date (newest first)
    const generatedQRCodes = await QRCode.find()
      .populate("userId")
      .populate("visitorId")
      .sort({ generatedAt: -1 })
      .lean();

    return res.status(200).json({
      message: "Successfully fetched all generated QR codes with user details.",
      data: generatedQRCodes,
    });
  } catch (error) {
    console.error("Error fetching QR codes:", error);
    return res
      .status(500)
      .json({ message: "Server error while fetching QR codes." });
  }
};

export const getGeneratedQRCodesById = async (req, res) => {
  try {
    const { userId } = req.params; // Get userId from the URL parameter

    if (!userId) {
      return res.status(400).json({ message: "User ID is required." });
    }

    // Fetch QR codes for the user
    const generatedQRCodes = await QRCode.find({ userId })
      .populate("userId")
      .populate("visitorId")
      .sort({ generatedAt: -1 })
      .lean();

    if (generatedQRCodes.length === 0) {
      return res
        .status(404)
        .json({ message: "No QR codes found for this user." });
    }

    // Respond with the fetched QR codes
    return res.status(200).json({
      message: "Successfully fetched generated QR codes.",
      data: generatedQRCodes,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Server error while fetching QR codes." });
  }
};

export const checkActiveQRCodeById = async (req, res) => {
  try {
    const { userId, visitorId } = req.params;

    // Validate ObjectIds
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID." });
    }
    if (!mongoose.Types.ObjectId.isValid(visitorId)) {
      return res.status(400).json({ message: "Invalid visitor ID." });
    }

    // Find active QR code for the specific visitor and user
    const activeQRCode = await QRCode.findOne({
      userId,
      visitorId,
      status: "active",
    });

    if (!activeQRCode) {
      return res.status(404).json({ message: "No active QR code found." });
    }

    return res.status(200).json({
      message: "Active QR code found.",
      qrCodeId: activeQRCode._id,
      qrImageUrl: activeQRCode.qrImageUrl,
      qrData: activeQRCode.qrData,
      status: activeQRCode.status,
      generatedAt: activeQRCode.generatedAt,
    });
  } catch (error) {
    console.error("Error checking active QR code:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};
