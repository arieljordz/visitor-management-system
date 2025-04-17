import React, { useState } from "react";
import { Button, Form, Row, Col, Card, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import axios from "axios";
import { useTheme } from "../../context/ThemeContext";

const API_URL = import.meta.env.VITE_BASE_API_URL;

const TopUpForm = ({
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
  const { darkMode } = useTheme();

  console.log("paymentMethods:", paymentMethods);

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
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
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

  const themeCard = darkMode ? "dashboard-card-dark" : "dashboard-card-light";

  return (
    <Form>
      <Row className="mb-3">
        <Col xs={12} md={6}>
          <Form.Select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className={darkMode ? "select-white-border" : ""}
          >
            <option value="gcash">GCash</option>
            <option value="paymaya">PayMaya</option>
            <option value="bank">Bank Transfer</option>
          </Form.Select>
        </Col>
        <Col xs={12} md={6}>
          <Form.Control
            type="number"
            step="0.01"
            placeholder="0.00"
            min="0"
            value={topUpAmount}
            onChange={(e) => setTopUpAmount(e.target.value)}
          />
        </Col>
      </Row>

      <Card className={`mb-3 ${themeCard}`}>
        <Card.Header>Selected Payment Method</Card.Header>
        <Card.Body>
          {paymentMethods
            .filter(
              (method) =>
                method.method.toLowerCase() === paymentMethod.toLowerCase()
            )
            .map((method, index) => (
              <div key={index} className="mb-3">
                <strong>{method.method}</strong>
                <p>
                  Name: {method.accountName} <br />
                  {method.method === "Bank" && method.bankName && (
                    <>
                      Bank: {method.bankName} <br />
                    </>
                  )}
                  Number: {method.accountNumber}
                </p>
              </div>
            ))}
        </Card.Body>
      </Card>

      <Row className="mb-3">
        <Col>
          <Form.Label>Upload Proof of Payment</Form.Label>
          <Form.Control
            type="file"
            accept="image/*"
            onChange={(e) => setProof(e.target.files[0])}
          />
        </Col>
      </Row>

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

export default TopUpForm;
