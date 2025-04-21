import React, { useState, useEffect } from "react";
import { Modal, Button, Spinner } from "react-bootstrap";

const QRCodeModal = ({ show, setShowModal, qrImageUrl, txnId }) => {
  const [isLoading, setIsLoading] = useState(true);

  // Reset loading state when qrImageUrl changes or modal is shown
  useEffect(() => {
    if (show && qrImageUrl) {
      setIsLoading(true);
    }
  }, [qrImageUrl, show]);

  // Download handler
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
     <Modal
      //  className="modal-sm"
       show={show}
       onHide={() => setShowModal(false)}
       centered
     >
       {/* Header */}
       <Modal.Header closeButton>
         <Modal.Title className="fw-bold">QR Code</Modal.Title>
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
       </Modal.Body>
 
       {/* Footer */}
       <Modal.Footer className="justify-content-center">
         <Button onClick={handleDownload} disabled={isLoading || !qrImageUrl}>
           {isLoading ? "Loading..." : "Download"}
         </Button>
       </Modal.Footer>
     </Modal>
   );
};

export default QRCodeModal;
