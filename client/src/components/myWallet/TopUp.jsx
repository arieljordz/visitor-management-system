import React, { useState } from "react";
import { Button, Form, Row, Col, Card, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import axios from "axios";

const API_URL = import.meta.env.VITE_BASE_API_URL;

const TopUp = ({
  user,
  paymentMethod,
  setPaymentMethod,
  paymentMethods,
  proof,
  setBalance,
  setProof,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState("");

  // Handle top-up request
  const handleTopUp = async () => {
    const amount = parseFloat(topUpAmount);

    if (!amount || amount <= 0 || !proof) {
      toast.warning("Please enter a valid top-up amount and upload proof.");
      return;
    }

    const formData = new FormData();
    formData.append("topUpAmount", amount.toFixed(2)); // ensure 2 decimal places
    formData.append("paymentMethod", paymentMethod);
    formData.append("proof", proof);

    setIsLoading(true);

    try {
      const res = await axios.post(
        `${API_URL}/api/top-up/${user.userId}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      const { balance } = res.data;
      setBalance(parseFloat(balance).toFixed(2));
      setTopUpAmount("");
      setProof(null);
      toast.success(
        `Top-up successful. New balance: ₱${parseFloat(balance).toFixed(2)}`
      );
    } catch (error) {
      console.error("Top-up error:", error);
      toast.error(
        error.response?.data?.message || "Top-up failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Payment method details for the selected method
  const selectedPaymentMethod = paymentMethods.find(
    (method) => method.method.toLowerCase() === paymentMethod.toLowerCase()
  );

  return (
    <Form>
      {/* Payment Method Selection */}
      <Row className="mb-3">
        <Col xs={12} md={6}>
          <Form.Select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="form-control"
          >
            <option value="gcash">GCash</option>
            <option value="paymaya">PayMaya</option>
            <option value="bank">Bank Transfer</option>
          </Form.Select>

        </Col>

        {/* Top-up Amount Input */}
        <Col xs={12} md={6}>
          <Form.Control
            type="number"
            step="0.01"
            placeholder="0.00"
            min="0"
            value={topUpAmount}
            onChange={(e) => setTopUpAmount(e.target.value)}
            className="form-control"
          />
        </Col>
      </Row>

      {/* Payment Method Details */}
      {selectedPaymentMethod && (
        <Card className={`mb-3`}>
          <Card.Header>Selected Payment Method</Card.Header>
          <Card.Body>
            <div className="mb-3">
              <strong>{selectedPaymentMethod.method}</strong>
              <p>
                Name: {selectedPaymentMethod.accountName} <br />
                {selectedPaymentMethod.method === "Bank" &&
                  selectedPaymentMethod.bankName && (
                    <>
                      Bank: {selectedPaymentMethod.bankName} <br />
                    </>
                  )}
                Number: {selectedPaymentMethod.accountNumber}
              </p>
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Proof of Payment */}
      <Row className="mb-3">
        <Col>
          <Form.Label>Upload Proof of Payment</Form.Label>
          <Form.Control
            type="file"
            accept="image/*"
            onChange={(e) => setProof(e.target.files[0])}
            className="form-control-file"
          />
        </Col>
      </Row>

      {/* Submit Button */}
      <Button
        variant="success"
        className="w-100"
        onClick={handleTopUp}
        disabled={isLoading}
      >
        {isLoading ? <Spinner animation="border" size="sm" /> : "Submit Top-Up"}
      </Button>
    </Form>
  );
};

export default TopUp;
