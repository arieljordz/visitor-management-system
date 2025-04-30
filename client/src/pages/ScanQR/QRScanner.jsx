import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { scanQRCode } from "../../services/qrService.js";
import moment from "moment";

const QRScanner = () => {
  const [scanResult, setScanResult] = useState(null);
  const [responseMessage, setResponseMessage] = useState(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [facingMode, setFacingMode] = useState("environment"); 
  const html5QrCodeRef = useRef(null);

  const openCamera = async () => {
    if (html5QrCodeRef.current) return;

    const qrRegionId = "qr-reader";
    const html5QrCode = new Html5Qrcode(qrRegionId);
    html5QrCodeRef.current = html5QrCode;

    try {
      await html5QrCode.start(
        { facingMode },
        { fps: 10, qrbox: 250 },
        async (decodedText) => {
          setScanResult(decodedText);
          await closeCamera();

          try {
            const response = await scanQRCode(decodedText);
            const { status, data, message } = response;

            if (status === "error" || !data) {
              setResponseMessage({ type: "error", text: message || "Invalid QR." });
              return;
            }

            const visitDate = moment(data.visitDate).startOf("day");
            const today = moment().startOf("day");
            const isToday = visitDate.isSame(today);
            const isExpired = data.status === "expired";

            if (isExpired) {
              setResponseMessage({ type: "error", text: "QR Code is expired." });
            } else if (!isToday) {
              setResponseMessage({ type: "warning", text: "Visit date does not match today's date." });
            } else {
              setResponseMessage({ type: "success", text: "Visitor verified successfully.", data });
            }
          } catch (error) {
            setResponseMessage({
              type: "error",
              text: error?.response?.data?.message || "An error occurred during scanning.",
            });
          }
        },
        (errorMessage) => {
          console.warn("QR error:", errorMessage);
        }
      );

      setIsCameraOpen(true);
    } catch (err) {
      console.error("Camera start error:", err);
    }
  };

  const closeCamera = async () => {
    const html5QrCode = html5QrCodeRef.current;
    if (html5QrCode) {
      try {
        await html5QrCode.stop();
        await html5QrCode.clear();
      } catch (err) {
        console.error("Error stopping QR scanner:", err);
      }
      html5QrCodeRef.current = null;
      setIsCameraOpen(false);
    }
  };

  const toggleCamera = async () => {
    const newFacingMode = facingMode === "environment" ? "user" : "environment";
    await closeCamera();
    setFacingMode(newFacingMode);
    setTimeout(openCamera, 500); // slight delay to avoid race conditions
  };

  useEffect(() => {
    return () => {
      closeCamera(); // Cleanup on unmount
    };
  }, []);

  return (
    <div className="container text-center mt-4">
      <h3>QR Code Scanner</h3>

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

      <div id="qr-reader" style={{ width: "100%" }} />

      {scanResult && responseMessage?.data && (
        <div className="alert alert-info mt-4 text-start">
          <h5>Visitor Details:</h5>
          <ul className="list-unstyled">
            <li><strong>Client Name:</strong> {responseMessage.data.userId?.fullName || "N/A"}</li>
            <li><strong>Visitor Name:</strong> 
              {responseMessage.data.visitorType === "Individual"
                ? `${responseMessage.data.firstName} ${responseMessage.data.lastName}`
                : responseMessage.data.groupName}
            </li>
            <li><strong>Visit Date:</strong> {moment(responseMessage.data.visitDate).format("YYYY-MM-DD")}</li>
            <li><strong>Purpose:</strong> {responseMessage.data.purpose}</li>
          </ul>
        </div>
      )}

      {responseMessage && (
        <div
          className={`alert mt-3 alert-${
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
