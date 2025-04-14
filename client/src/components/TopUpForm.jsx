// TopUpForm.jsx
import React from "react";
import { Button, Form, Row, Col, Card, Spinner } from "react-bootstrap";

const TopUpForm = ({
  topUpAmount,
  setTopUpAmount,
  paymentMethod,
  setPaymentMethod,
  paymentMethods,
  proof,
  setProof,
  handleTopUp,
  isLoading,
}) => {
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
