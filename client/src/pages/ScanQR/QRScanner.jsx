import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { scanQRCode } from "../../services/qrService.js";

const QRScanner = () => {
  const [scanResult, setScanResult] = useState(null);
  const [qrData, setQrData] = useState("");
  const [responseMessage, setResponseMessage] = useState(null);
  const [isManualMode, setIsManualMode] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const html5QrCodeRef = useRef(null);

  const openCamera = async () => {
    if (html5QrCodeRef.current || isManualMode) return;

    const qrRegionId = "qr-reader";
    const html5QrCode = new Html5Qrcode(qrRegionId);
    html5QrCodeRef.current = html5QrCode;

    try {
      const devices = await Html5Qrcode.getCameras();
      if (devices && devices.length > 0) {
        const cameraId = devices[0].id;

        await html5QrCode.start(
          cameraId,
          { fps: 10, qrbox: 250 },
          async (decodedText) => {
            setScanResult(decodedText);
            await closeCamera();

            try {
              const response = await scanQRCode(decodedText);
              setResponseMessage({
                type: "success",
                text: response.message,
                data: response.data,
              });
            } catch (error) {
              setResponseMessage({
                type: "error",
                text:
                  error?.response?.data?.message ||
                  "An error occurred during scanning.",
              });
            }
          },
          (errorMessage) => {
            console.warn("QR error:", errorMessage);
          }
        );

        setIsCameraOpen(true);
      }
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

  const toggleManualMode = async () => {
    setIsManualMode(!isManualMode);
    setScanResult(null);
    setResponseMessage(null);
    setQrData("");
    await closeCamera(); // Ensure camera is closed on mode switch
  };

  useEffect(() => {
    return () => {
      closeCamera(); // Cleanup on unmount
    };
  }, []);

  const handleManualInputChange = (e) => {
    setQrData(e.target.value);
  };

  const handleScanQRCode = async () => {
    if (!qrData) {
      setResponseMessage({ type: "error", text: "Please enter QR data." });
      return;
    }

    try {
      const response = await scanQRCode(qrData);
      setScanResult(qrData);
      setResponseMessage({
        type: "success",
        text: response.message,
        data: response.data,
      });
    } catch (error) {
      setResponseMessage({
        type: "error",
        text:
          error?.response?.data?.message ||
          error?.message ||
          "An error occurred during scanning.",
      });
    }
  };

  return (
    <div className="container text-center mt-4">
      <h3>QR Code Scanner</h3>

      <button className="btn btn-secondary mb-3" onClick={toggleManualMode}>
        {isManualMode ? "Switch to Scanner" : "Switch to Manual Input"}
      </button>

      {isManualMode ? (
        <div>
          <input
            type="text"
            className="form-control mb-3"
            value={qrData}
            onChange={handleManualInputChange}
            placeholder="Enter QR code data"
          />
          <button
            className="btn btn-primary"
            onClick={handleScanQRCode}
            disabled={!qrData}
          >
            Process QR Code
          </button>
        </div>
      ) : (
        <div>
          <div className="d-flex justify-content-center mb-2 gap-2">
            {!isCameraOpen ? (
              <button className="btn btn-success" onClick={openCamera}>
                Open Camera
              </button>
            ) : (
              <button className="btn btn-danger" onClick={closeCamera}>
                Close Camera
              </button>
            )}
          </div>
          <div id="qr-reader" style={{ width: "100%" }} />
        </div>
      )}

      {scanResult && (
        <div className="alert alert-success mt-3">
          <strong>Scanned Data:</strong> {scanResult}
        </div>
      )}

      {responseMessage && (
        <div
          className={`alert mt-3 alert-${
            responseMessage.type === "success" ? "success" : "danger"
          }`}
        >
          <strong>{responseMessage.text}</strong>
        </div>
      )}
    </div>
  );
};

export default QRScanner;
