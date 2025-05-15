import React from "react";
import { Form } from "react-bootstrap";

function PaymentDetails({
  paymentMethod,
  setPaymentMethod,
  topUpAmount,
  setTopUpAmount,
  paymentAccounts,
  renderPaymentInfo,
}) {
  return (
    <>
      <h5 className="mb-3">Details</h5>
      <Form.Group className="mb-3">
        <Form.Label>Payment Method</Form.Label>
        <Form.Select
          className="form-control"
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
        >
          <option value="">-- Choose a method --</option>
          {paymentAccounts.map((group) => (
            <option key={group._id} value={group._id.toLowerCase()}>
              {group._id}
            </option>
          ))}
        </Form.Select>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Amount (₱)</Form.Label>
        <Form.Control
          type="number"
          step="0.01"
          min="0"
          placeholder="Enter amount"
          value={topUpAmount}
          onChange={(e) => setTopUpAmount(e.target.value)}
        />
      </Form.Group>

      {renderPaymentInfo()}
    </>
  );
}

export default PaymentDetails;
