import React, { useState, useEffect } from "react";
import { Modal, Button, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import { formatDateNow } from "../../../utils/globalUtils";

const QRCodeModal = ({ show, setShowModal, qrImageUrl, txnId }) => {
  const [isLoading, setIsLoading] = useState(true);

  // Reset loading state when qrImageUrl changes or modal is shown
  useEffect(() => {
    if (show && qrImageUrl) {
      setIsLoading(true);
    }
  }, [qrImageUrl, show]);

  // console.log("QR:", qrImageUrl);
  // Download handler
  const handleDownload = async () => {
    try {
      // console.log("Downloading QR from:", qrImageUrl);
      const response = await fetch(qrImageUrl);
      if (!response.ok) {
        throw new Error(`Fetch failed: ${response.statusText}`);
      }
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("image")) {
        throw new Error("Invalid content type received. Not an image.");
      }

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const formattedDate = formatDateNow();

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
    <Modal show={show} backdrop="static" keyboard={false} centered>
      {/* Header */}
      <div className="modal-header">
        <h5 className="modal-title fw-bold">QR Code</h5>
        <button
          type="button"
          className="close"
          onClick={() => setShowModal(false)}
          aria-label="Close"
        >
          <span aria-hidden="true">&times;</span>
        </button>
      </div>

      {/* Body */}
      <div className="modal-body">
        <div
          className="d-flex flex-column justify-content-center align-items-center"
          style={{ minHeight: "210px", position: "relative" }}
        >
          {/* Spinner */}
          {isLoading && (
            <Spinner animation="border" style={{ position: "absolute" }} />
          )}

          {/* QR Code Image and Txn ID */}
          {qrImageUrl ? (
            <>
              <img
                src={qrImageUrl}
                alt="QR Code"
                onLoad={() => setIsLoading(false)}
                style={{
                  visibility: isLoading ? "hidden" : "visible",
                  maxWidth: "100%",
                  maxHeight: "400px",
                  objectFit: "contain",
                  borderRadius: "8px",
                }}
              />
              {!isLoading && (
                <p className="mt-3 mb-0 text-center">
                  <strong>{txnId}</strong>
                </p>
              )}
            </>
          ) : (
            <p className="text-danger">QR code not available.</p>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="modal-footer justify-content-center">
        <Button onClick={handleDownload} disabled={isLoading}>
          {isLoading ? "Loading..." : "Download"}
        </Button>
      </div>
    </Modal>
  );
};

export default QRCodeModal;
