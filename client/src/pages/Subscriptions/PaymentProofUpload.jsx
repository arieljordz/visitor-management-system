import React from "react";
import { Form } from "react-bootstrap";

function PaymentProofUpload({
  referenceNumber,
  setReferenceNumber,
  handleProofChange,
}) {
  return (
    <>
      <h5 className="mb-3">Proof of Payment</h5>
      <Form.Group className="mb-3">
        <Form.Label>Upload Image</Form.Label>
        <Form.Control type="file" accept="image/*" onChange={handleProofChange} />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Reference Number</Form.Label>
        <Form.Control
          type="text"
          placeholder="Enter reference number"
          value={referenceNumber}
          onChange={(e) => setReferenceNumber(e.target.value)}
        />
      </Form.Group>
    </>
  );
}

export default PaymentProofUpload;
