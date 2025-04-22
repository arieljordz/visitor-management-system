import mongoose from "mongoose";
import QRCode from "../models/QRCode.js";
import Visitor from "../models/Visitor.js";

export const generateQRCodes = async (req, res) => {
  try {
    const { userId, visitorId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID." });
    }

    if (!mongoose.Types.ObjectId.isValid(visitorId)) {
      return res.status(400).json({ message: "Invalid visitor ID." });
    }

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

    res.status(200).json({
      message: "QR code generated successfully",
      qrCodeId: qrCodeDoc._id,
      qrImageUrl,
      qrData,
    });
  } catch (error) {
    console.error("QR generation failed:", error);
    res.status(500).json({ message: "Internal server error" });
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

    // Optional: Check if visitor exists (to avoid orphan QR generation)
    const visitorExists = await Visitor.findById(visitorId);
    if (!visitorExists) {
      return res.status(404).json({ message: "Visitor not found." });
    }

    // Generate new QR code
    const qrData = `visitor-${userId}-${visitorId}-${Date.now()}`;
    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(
      qrData
    )}&size=150x150`;

    const qrCodeDoc = new QRCode({
      userId,
      visitorId,
      qrData,
      qrImageUrl,
      status: "active", // Default status
    });

    await qrCodeDoc.save();

    res.status(200).json({
      message: "QR code generated successfully.",
      qrCodeId: qrCodeDoc._id,
      qrImageUrl,
      qrData,
    });
  } catch (error) {
    console.error("QR generation failed:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const scanQRCode = async (req, res) => {
  try {
    const { qrData } = req.body;

    if (!qrData) {
      return res.status(400).json({ message: "QR data is required." });
    }

    // Find QR code document by qrData
    const qrCodeDoc = await QRCode.findOne({ qrData });

    if (!qrCodeDoc) {
      return res.status(404).json({ message: "QR code not found." });
    }

    if (qrCodeDoc.status === "used") {
      return res
        .status(400)
        .json({ message: "QR code has already been used." });
    }

    if (qrCodeDoc.status === "expired") {
      return res.status(400).json({ message: "QR code has expired." });
    }

    // Update QR code status to "used"
    qrCodeDoc.status = "used";
    await qrCodeDoc.save();

    res.status(200).json({
      message: "QR code scanned successfully.",
      userId: qrCodeDoc.userId,
      qrData: qrCodeDoc.qrData,
      scannedAt: new Date(),
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
