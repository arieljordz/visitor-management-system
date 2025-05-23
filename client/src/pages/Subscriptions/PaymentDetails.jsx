import React from "react";
import { Form } from "react-bootstrap";

// Utility to format number as currency
const formatCurrency = (value) => {
  const number = parseFloat(value.replace(/,/g, ""));
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
  // Handle money input formatting
  const handleAmountChange = (e) => {
    const raw = e.target.value.replace(/[^\d.]/g, "");
    setTopUpAmount(raw);
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
          type="number"
          inputMode="decimal"
          placeholder="Enter amount"
          value={formatCurrency(topUpAmount)}
          onChange={handleAmountChange}
        />
      </Form.Group>

      {renderPaymentInfo()}
    </>
  );
};

export default PaymentDetails;
