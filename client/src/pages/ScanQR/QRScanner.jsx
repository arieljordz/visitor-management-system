import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { useAuth } from "../../context/AuthContext";
import { scanQRCode } from "../../services/qrService.js";
import QRDetails from "./QRDetails.jsx";

const QRScanner = () => {
  const { user } = useAuth();
  const [scanResult, setScanResult] = useState(null);
  const [responseMessage, setResponseMessage] = useState(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [facingMode, setFacingMode] = useState("environment");
  const html5QrCodeRef = useRef(null);

  // Handle successful QR scan
  const handleScanSuccess = async (decodedText) => {
    setScanResult(decodedText);
    await closeCamera();

    try {
      const response = await scanQRCode(decodedText, user.subscriberId);
      const { message, data } = response;

      if (!data) {
        setResponseMessage({
          type: "error",
          text: message || "Invalid QR code.",
        });
        return;
      }

      setResponseMessage({
        type: "success",
        text: "Visitor verified successfully.",
        data,
      });
    } catch (error) {
      setResponseMessage({
        type: "error",
        text:
          error?.response?.data?.message || "An error occurred while scanning.",
      });
    }
  };

  // Open camera and start scanning
  const openCamera = async () => {
    if (html5QrCodeRef.current) return;

    const qrRegionId = "qr-reader";
    const html5QrCode = new Html5Qrcode(qrRegionId);
    html5QrCodeRef.current = html5QrCode;

    try {
      await html5QrCode.start(
        { facingMode },
        { fps: 10, qrbox: 250 },
        handleScanSuccess,
        (errorMessage) => {
          console.warn("QR scan error:", errorMessage);
        }
      );
      setIsCameraOpen(true);
      setResponseMessage(null); // clear previous messages on new scan session
      setScanResult(null);
    } catch (err) {
      console.error("Camera start error:", err);
      setResponseMessage({
        type: "error",
        text: "Failed to start camera. Please check permissions and try again.",
      });
    }
  };

  // Stop camera and clear resources
  const closeCamera = async () => {
    if (!html5QrCodeRef.current) return;

    try {
      await html5QrCodeRef.current.stop();
      await html5QrCodeRef.current.clear();
    } catch (err) {
      console.error("Error stopping QR scanner:", err);
    }
    html5QrCodeRef.current = null;
    setIsCameraOpen(false);
  };

  // Switch between front and rear camera
  const toggleCamera = async () => {
    const newFacingMode = facingMode === "environment" ? "user" : "environment";
    await closeCamera();
    setFacingMode(newFacingMode);
    setTimeout(openCamera, 500); // slight delay to avoid race conditions
  };

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      closeCamera();
    };
  }, []);

  return (
    <div className="container my-4">
      <h3 className="text-center mb-4">QR Code Scanner</h3>

      <div className="d-flex justify-content-center gap-2 mb-3">
        {!isCameraOpen ? (
          <button className="btn btn-success" onClick={openCamera}>
            Open Camera
          </button>
        ) : (
          <>
            <button className="btn btn-danger mr-2" onClick={closeCamera}>
              Close Camera
            </button>
            <button className="btn btn-warning" onClick={toggleCamera}>
              Switch Camera
            </button>
          </>
        )}
      </div>

      <div
        id="qr-reader"
        style={{ width: "100%", maxWidth: "500px", margin: "0 auto" }}
      />

      {scanResult && responseMessage?.data && (
        <QRDetails responseMessage={responseMessage} />
      )}

      {responseMessage && (
        <div
          className={`alert mt-4 text-center alert-${
            responseMessage.type === "success"
              ? "success"
              : responseMessage.type === "warning"
              ? "warning"
              : "danger"
          }`}
        >
          <strong>{responseMessage.text}</strong>
        </div>
      )}
    </div>
  );
};

export default QRScanner;
