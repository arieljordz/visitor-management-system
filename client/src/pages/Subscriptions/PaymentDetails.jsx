import React from "react";
import { Form } from "react-bootstrap";

// Format display value
const formatCurrency = (value) => {
  const number = parseFloat(value);
  if (isNaN(number)) return "";
  return number.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const PaymentDetails = ({
  paymentMethod,
  setPaymentMethod,
  topUpAmount,
  setTopUpAmount,
  paymentAccounts,
  renderPaymentInfo,
}) => {
  const handleAmountChange = (e) => {
    const raw = e.target.value;
    // Allow only numbers and one optional decimal point
    if (/^\d*\.?\d*$/.test(raw)) {
      setTopUpAmount(raw);
    }
  };

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
          type="text"
          inputMode="decimal"
          placeholder="Enter amount"
          value={topUpAmount}
          onChange={handleAmountChange}
        />
        {/* <small className="text-muted">
          Formatted: {formatCurrency(topUpAmount)}
        </small> */}
      </Form.Group>

      {renderPaymentInfo()}
    </>
  );
};

export default PaymentDetails;
