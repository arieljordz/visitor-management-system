import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import { useSpinner } from "../../context/SpinnerContext";
import { Form, Button, Card, Row, Col, Image } from "react-bootstrap";
import Navpath from "../../components/common/Navpath";
import { getActivePaymentAccounts } from "../../services/paymentAccountService";
import { submitSubscription } from "../../services/balanceService";

function PaymentPage({ setStep, selectedPlan }) {
  const { user } = useAuth();
  const { setLoading } = useSpinner();

  const [topUpAmount, setTopUpAmount] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("gcash");
  const [proof, setProof] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [paymentAccounts, setPaymentAccounts] = useState([]);

  // Fetch payment methods once
  useEffect(() => {
    if (!user) return;
    const fetchAccounts = async () => {
      try {
        const data = await getActivePaymentAccounts();
        setPaymentAccounts(data);
      } catch (error) {
        console.error("Failed to fetch accounts:", error.message);
      }
    };
    fetchAccounts();
  }, [user]);

  const selectedGroup = paymentAccounts.find(
    (group) => group._id.toLowerCase() === paymentMethod.toLowerCase()
  );

  const isValid = () => {
    const amount = parseFloat(topUpAmount);
    return amount > 0 && referenceNumber && proof && paymentMethod;
  };

  const handleTopUp = async (e) => {
    e.preventDefault();
    if (!isValid()) {
      toast.warning("Please complete all fields before submitting.");
      return;
    }

    const formData = new FormData();
    formData.append("topUpAmount", parseFloat(topUpAmount).toFixed(2));
    formData.append("paymentMethod", paymentMethod);
    formData.append("proof", proof);
    formData.append("referenceNumber", referenceNumber);

    setLoading(true);
    try {
      await submitSubscription(user.userId, formData);
      resetForm();
      toast.success("Subscription submitted. Awaiting admin verification.");
      setStep(3);
    } catch (error) {
      console.error("Top-up error:", error);
      toast.error(error.response?.data?.message || "Top-up failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleProofChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setProof(file);

    const reader = new FileReader();
    reader.onloadend = () => setPreviewUrl(reader.result);
    reader.readAsDataURL(file);
  };

  const resetForm = () => {
    setTopUpAmount("");
    setReferenceNumber("");
    setProof(null);
    setPreviewUrl(null);
  };

  const renderPaymentInfo = () => {
    if (!selectedGroup) return null;
    return (
      <Card className="mb-3">
        <Card.Header>Payment Info: {selectedGroup._id}</Card.Header>
        <Card.Body>
          {selectedGroup.accounts.map((account, idx) => (
            <div key={idx}>
              <strong>{account.accountName}</strong>
              <p className="mb-1">
                Number: {account.accountNumber}
                {selectedGroup._id === "BANK" && account.bankName && (
                  <>
                    <br />
                    Bank: {account.bankName}
                  </>
                )}
              </p>
              {idx < selectedGroup.accounts.length - 1 && <hr />}
            </div>
          ))}
        </Card.Body>
      </Card>
    );
  };

  return (
    <div className="content-wrapper">
      <Navpath levelOne="Subscribe" levelTwo="Home" levelThree="Subscribe" />

      <section className="content">
        <div className="container-fluid">
          <Row className="justify-content-center">
            <Col md={8} lg={12}>
              <Card>
                <Card.Body className="main-card">
                  <h3 className="mb-3">Complete Your Subscription</h3>
                  <p>
                    <strong>Plan:</strong> {selectedPlan}
                  </p>

                  <Form onSubmit={handleTopUp}>
                    <Row>
                      {/* Column 1 - Payment Method & Amount */}
                      <Col md={4}>
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
                              <option
                                key={group._id}
                                value={group._id.toLowerCase()}
                              >
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
                            placeholder="Enter amount"
                            min="0"
                            value={topUpAmount}
                            onChange={(e) => setTopUpAmount(e.target.value)}
                          />
                        </Form.Group>

                        {renderPaymentInfo()}
                      </Col>

                      {/* Column 2 - Proof & Reference */}
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

                      {/* Column 3 - Image Preview */}
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
                            <span className="text-muted">
                              No image uploaded
                            </span>
                          )}
                        </div>
                      </Col>
                    </Row>

                    <Row className="d-flex justify-content-end">
                      <Button type="submit" className="mt-4" variant="success">
                        Submit for Verification
                      </Button>
                    </Row>
                  </Form>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </div>
      </section>
    </div>
  );
}

export default PaymentPage;
