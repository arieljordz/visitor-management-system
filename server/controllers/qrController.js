export const generateQRCode = async (req, res) => {
    try {
      const userId = req.params.userId;
      const qrData = `visitor-${userId}`;
      const qrCode = `https://api.qrserver.com/v1/create-qr-code/?data=${qrData}&size=150x150`;
  
      // You could optionally store QR metadata if needed (timestamp, status, etc.)
  
      res.json({ qrCode });
    } catch (error) {
      console.error("QR generation failed:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };
  