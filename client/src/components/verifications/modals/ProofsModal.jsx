import React, { useState, useEffect } from "react";
import { Modal, Button, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";

const API_URL = import.meta.env.VITE_BASE_API_URL;

const ProofsModal = ({ show, setShowModal, imageProof, txnId }) => {
  const [isLoading, setIsLoading] = useState(true);

  // Normalize the file path and create full image URL
  const normalizedPath = imageProof?.replace(/\\/g, "/");
  const imageUrl = normalizedPath ? `${API_URL}/${normalizedPath}` : "";

  // console.log("imageUrl:", imageUrl);

  // Reset loading when modal opens or imageProof changes
  useEffect(() => {
    if (show && imageProof) {
      setIsLoading(true);
    }
  }, [show, imageProof]);

  // Handle image download
  const handleDownload = async () => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      const now = new Date();
      const formattedDate = `${String(now.getMonth() + 1).padStart(
        2,
        "0"
      )}-${String(now.getDate()).padStart(2, "0")}-${now.getFullYear()}`;

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `${txnId}-${formattedDate}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Proof download failed:", error);
      toast.error("Failed to download proof. Please try again.");
    }
  };

  return (
    <Modal show={show} onHide={() => setShowModal(false)} centered>
      {/* Header */}
      <Modal.Header closeButton>
        <Modal.Title className="fw-bold">Proof</Modal.Title>
      </Modal.Header>

      {/* Body */}
      <Modal.Body>
        <div
          className="d-flex flex-column justify-content-center align-items-center"
          style={{ minHeight: "210px", position: "relative" }}
        >
          {/* Spinner */}
          {isLoading && (
            <Spinner animation="border" style={{ position: "absolute" }} />
          )}

          {/* Proof Image and Transaction ID */}
          {imageUrl ? (
            <>
              <img
                src={imageUrl}
                alt="Proof of Payment"
                onLoad={() => setIsLoading(false)}
                onError={() => setIsLoading(false)}
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
            <p className="text-danger">Proof not available.</p>
          )}
        </div>
      </Modal.Body>

      {/* Footer */}
      <Modal.Footer className="justify-content-center">
        <Button onClick={handleDownload} disabled={isLoading || !imageUrl}>
          {isLoading ? "Loading..." : "Download"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ProofsModal;
