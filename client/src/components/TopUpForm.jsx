import React, { useState, useEffect } from "react";
import { Button, Form, Row, Col, Card, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import axios from "axios";

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

  const handleTopUp = async () => {
    if (!topUpAmount || parseFloat(topUpAmount) <= 0 || !proof) {
      toast.warning("Please enter a valid amount and upload proof.");
      return;
    }
  
    const formData = new FormData();
    formData.append("topUpAmount", parseFloat(topUpAmount));
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
      setBalance(balance);
      setTopUpAmount("");
      setProof(null);
  
      toast.success(`Top-up submitted successfully. New balance: ₱${balance}`);
    } catch (error) {
      console.error("Top-up error:", error);
      toast.error(
        error.response?.data?.message || "Top-up failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Form>
      <Row className="mb-3">
        <Col xs={12} md={6}>
          <Form.Control
            type="number"
            placeholder="Enter amount"
            min="1"
            value={topUpAmount}
            onChange={(e) => setTopUpAmount(e.target.value)}
          />
        </Col>
        <Col xs={12} md={6}>
          <Form.Select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
          >
            <option value="gcash">GCash</option>
            <option value="paymaya">PayMaya</option>
            <option value="bank">Bank Transfer</option>
          </Form.Select>
        </Col>
      </Row>

      <Card className="mb-3">
        <Card.Header>Selected Payment Method</Card.Header>
        <Card.Body>
          {paymentMethods
            .filter(
              (method) =>
                method.method.toLowerCase() === paymentMethod.toLowerCase()
            ) // Filter based on selected method
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
