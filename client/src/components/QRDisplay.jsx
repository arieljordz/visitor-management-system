import React from "react";
import { Button, Card } from "react-bootstrap";

// Function to handle the QR code download
const handleDownload = (qrCode) => {
  const link = document.createElement("a");
  link.href = qrCode;
  link.download = "visitor_qr.png"; // Specify the download filename
  link.click(); // Trigger the download
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
        <p className="mt-3 text-muted">Click the button above to download the QR code.</p>
      </Card.Body>
    </Card>
  );
};

export default QRDisplay;
