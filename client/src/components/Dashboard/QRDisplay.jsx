import React from "react";
import { Button, Card } from "react-bootstrap";
import { toast } from "react-toastify";

// Function to handle the QR code download
const handleDownload = async (qrCodeUrl) => {
  try {
    const response = await fetch(qrCodeUrl);
    const blob = await response.blob();

    const blobUrl = window.URL.createObjectURL(blob);

    // Format date as MM-DD-YYYY
    const now = new Date();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    const yyyy = now.getFullYear();
    const formattedDate = `${mm}-${dd}-${yyyy}`;

    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = `visitor_qr_${formattedDate}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    window.URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error("QR code download failed:", error);
    toast.error("Failed to download QR code. Please try again.");
  }
};

const QRDisplay = ({ qrCode }) => {
  if (!qrCode) return null;

  return (
    <Card className="mt-3 p-3 shadow-sm">
      <Card.Body className="text-center">
        <h5>QR Code for Visitor Entry</h5>
        <div>
          <img src={qrCode} alt="QR Code" className="img-fluid mb-3" />
        </div>
        <Button
          variant="primary"
          onClick={() => handleDownload(qrCode)}
          className="btn-block"
        >
          Download QR Code
        </Button>
        <p className="mt-3 text-muted">
          Click the button above to download the QR code.
        </p>
      </Card.Body>
    </Card>
  );
};

export default QRDisplay;
