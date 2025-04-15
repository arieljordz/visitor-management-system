import mongoose from "mongoose";
import QRCode from "../models/QRCode.js";

export const generateQRCode = async (req, res) => {
  try {
    const userId = req.params.userId;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID." });
    }

    const qrData = `visitor-${userId}-${Date.now()}`; // Make QR data unique
    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(qrData)}&size=150x150`;

    // Save to QRCode collection
    const qrCodeDoc = new QRCode({
      userId,
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
      return res.status(400).json({ message: "QR code has already been used." });
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
