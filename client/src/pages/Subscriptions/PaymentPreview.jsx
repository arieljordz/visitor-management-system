import React from "react";
import { Image } from "react-bootstrap";

function PaymentPreview({ previewUrl }) {
  return (
    <>
      <h5 className="mb-3">Image Preview</h5>
      <div
        className="border rounded d-flex align-items-center justify-content-center"
        style={{
          height: "250px",
          backgroundColor: "#f8f9fa",
        }}
      >
        {previewUrl ? (
          <Image
            src={previewUrl}
            alt="Proof Preview"
            fluid
            rounded
            thumbnail
            style={{
              maxHeight: "100%",
              maxWidth: "100%",
              objectFit: "contain",
            }}
          />
        ) : (
          <span className="text-muted">No image uploaded</span>
        )}
      </div>
    </>
  );
}

export default PaymentPreview;
