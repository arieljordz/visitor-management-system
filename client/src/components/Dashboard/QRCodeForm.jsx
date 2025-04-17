import React from "react";
import { Button, Card, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";

const QRCodeForm = ({ qrCode, txnId, isLoading }) => {
  
  const handleDownload = async () => {
    try {
      const response = await fetch(qrCode);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const now = new Date();
      const formattedDate = now.toISOString().split("T")[0];
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `${txnId}-${formattedDate}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("QR code download failed:", error);
      toast.error("Failed to download QR code. Please try again.");
    }
  };

  return (
    <Card className="mt-4 p-3 shadow-sm text-center">
      <Card.Body>
        <h5>QR Code for Visitor Entry</h5>
        {isLoading ? (
          <Spinner animation="border" size="sm" />
        ) : (
          <>
            <div>
              <img src={qrCode} alt="QR Code" className="img-fluid mb-3" />
            </div>
            <Button variant="primary" onClick={handleDownload}>
              Download QR Code
            </Button>
            <p className="mt-3 text-muted">
              Click the button above to download the QR code.
            </p>
          </>
        )}
      </Card.Body>
    </Card>
  );
};

export default QRCodeForm;
