import React, { useState } from "react";
import { Button, Form, Row, Col, Card, Spinner, Image } from "react-bootstrap";
import { toast } from "react-toastify";
import { topUp } from "../../services/balanceService";

const TopUp = ({
  user,
  paymentMethod,
  setPaymentMethod,
  paymentAccounts,
  proof,
  setProof,
  setBalance,
  isLoading,
  setIsLoading,
}) => {
  const [topUpAmount, setTopUpAmount] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [previewUrl, setPreviewUrl] = useState(null);

  const selectedPaymentMethodGroup = paymentAccounts.find(
    (group) => group._id.toLowerCase() === paymentMethod.toLowerCase()
  );

  const handleTopUp = async () => {
    const amount = parseFloat(topUpAmount);

    if (
      !amount ||
      amount <= 0 ||
      !proof ||
      !paymentMethod ||
      !referenceNumber
    ) {
      toast.warning(
        "Please select a payment method, enter amount, reference number, and upload proof."
      );
      return;
    }

    const formData = new FormData();
    formData.append("topUpAmount", amount.toFixed(2));
    formData.append("paymentMethod", paymentMethod);
    formData.append("proof", proof);
    formData.append("referenceNumber", referenceNumber);

    setIsLoading(true);

    try {
      await topUp(user.userId, formData);
      setTopUpAmount("");
      setReferenceNumber("");
      setProof(null);
      setPreviewUrl(null);
      toast.success("Top-up submitted. Awaiting admin verification.");
    } catch (error) {
      console.error("Top-up error:", error);
      toast.error(
        error.response?.data?.message || "Top-up failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleProofChange = (e) => {
    const file = e.target.files[0];
    setProof(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Form>
      <Row>
        {/* LEFT COLUMN: Top-Up Details */}
        <Col md={4}>
          <h5 className="mb-3">Top-Up Details</h5>

          <Form.Group className="mb-3">
            <Form.Label>Payment Method</Form.Label>
            <Form.Select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="form-control"
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
            <Form.Label>Top-Up Amount (₱)</Form.Label>
            <Form.Control
              type="number"
              step="0.01"
              placeholder="Enter amount"
              min="0"
              value={topUpAmount}
              onChange={(e) => setTopUpAmount(e.target.value)}
            />
          </Form.Group>

          {selectedPaymentMethodGroup && (
            <Card className="mb-3">
              <Card.Header>
                Payment Info: {selectedPaymentMethodGroup._id}
              </Card.Header>
              <Card.Body>
                {selectedPaymentMethodGroup.accounts.map((account, index) => (
                  <div key={index}>
                    <strong>{account.accountName}</strong>
                    <p className="mb-1">
                      Number: {account.accountNumber}
                      {selectedPaymentMethodGroup._id === "BANK" &&
                        account.bankName && (
                          <>
                            <br />
                            Bank: {account.bankName}
                          </>
                        )}
                    </p>
                    {index < selectedPaymentMethodGroup.accounts.length - 1 && (
                      <hr />
                    )}
                  </div>
                ))}
              </Card.Body>
            </Card>
          )}
        </Col>

        {/* MIDDLE COLUMN: Upload + Reference Number */}
        <Col md={4}>
          <h5 className="mb-3">Proof of Payment</h5>
          <Form.Group className="mb-3">
            <Form.Label>Upload Image</Form.Label>
            <Form.Control
              type="file"
              accept="image/*"
              onChange={handleProofChange}
            />
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
        </Col>

        {/* RIGHT COLUMN: Image Preview */}
        <Col md={4}>
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
        </Col>
      </Row>

      <Button
        variant="success"
        className="w-100 mt-4"
        onClick={handleTopUp}
        disabled={isLoading}
      >
        {isLoading ? <Spinner animation="border" size="sm" /> : "Submit Top-Up"}
      </Button>
    </Form>
  );
};

export default TopUp;
