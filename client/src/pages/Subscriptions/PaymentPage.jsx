import React, { useState, useEffect } from "react";
import { Form, Button, Card, Row, Col } from "react-bootstrap";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import { useSpinner } from "../../context/SpinnerContext";
import Navpath from "../../components/common/Navpath";
import PaymentDetails from "./PaymentDetails";
import PaymentProofUpload from "./PaymentProofUpload";
import PaymentPreview from "./PaymentPreview";
import { getActivePaymentAccounts } from "../../services/paymentAccountService";
import { submitSubscription } from "../../services/balanceService";
import { getFeeByCodeAndStatus } from "../../services/feeService.js";
import { FeeCodeEnum, PlanTypeEnum } from "../../enums/enums.js";

function PaymentPage({ setStep, selectedPlan, steps }) {
  const { user } = useAuth();
  const { setLoading } = useSpinner();

  const [topUpAmount, setTopUpAmount] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("gcash");
  const [proof, setProof] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [paymentAccounts, setPaymentAccounts] = useState([]);

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

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const selectedGroup = paymentAccounts.find(
    (group) => group._id.toLowerCase() === paymentMethod.toLowerCase()
  );

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

  const isValid = () => {
    const amount = parseFloat(topUpAmount);
    return (
      !isNaN(amount) &&
      amount > 0 &&
      referenceNumber?.trim() &&
      proof &&
      paymentMethod
    );
  };

  const handleTopUp = async (e) => {
    e.preventDefault();
    const amount = parseFloat(topUpAmount);

    if (!isValid()) {
      toast.warning("Please complete all fields before submitting.");
      return;
    }

    const feeCodeMap = {
      [PlanTypeEnum.PREMIUM_1]: FeeCodeEnum.PREM01,
      [PlanTypeEnum.PREMIUM_2]: FeeCodeEnum.PREM02,
      [PlanTypeEnum.PREMIUM_3]: FeeCodeEnum.PREM03,
    };

    const selectedFeeCode = feeCodeMap[selectedPlan];

    if (selectedFeeCode) {
      const fee = await getFeeByCodeAndStatus(selectedFeeCode);

      if (amount < fee.fee) {
        toast.warning(`Amount must be at least ₱${fee.fee.toFixed(2)}.`);
        return;
      }
    }

    const formData = new FormData();
    formData.append("topUpAmount", amount.toFixed(2));
    formData.append("paymentMethod", paymentMethod);
    formData.append("proof", proof);
    formData.append("referenceNumber", referenceNumber);
    formData.append("planType", selectedPlan);

    setLoading(true);
    try {
      await submitSubscription(user.userId, formData);
      resetForm();
      toast.success("Subscription submitted. Awaiting admin verification.");
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

    // Revoke previous preview URL if any to avoid memory leaks
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    const objectUrl = URL.createObjectURL(file);
    setProof(file);
    setPreviewUrl(objectUrl);
  };

  const resetForm = () => {
    setTopUpAmount("");
    setReferenceNumber("");
    setProof(null);
    setPreviewUrl(null);
  };

  const handleCancel = (e) => {
    e.preventDefault();
    setStep(steps.CHOOSE_PLAN);
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
                      <Col md={4}>
                        <PaymentDetails
                          paymentMethod={paymentMethod}
                          setPaymentMethod={setPaymentMethod}
                          topUpAmount={topUpAmount}
                          setTopUpAmount={setTopUpAmount}
                          paymentAccounts={paymentAccounts}
                          renderPaymentInfo={renderPaymentInfo}
                        />
                      </Col>

                      <Col md={4}>
                        <PaymentProofUpload
                          referenceNumber={referenceNumber}
                          setReferenceNumber={setReferenceNumber}
                          handleProofChange={handleProofChange}
                        />
                      </Col>

                      <Col md={4}>
                        <PaymentPreview previewUrl={previewUrl} />
                      </Col>
                    </Row>

                    <Row className="d-flex justify-content-end">
                      <Button
                        type="button"
                        className="mt-4 mr-2"
                        variant="secondary"
                        onClick={handleCancel}
                      >
                        Cancel
                      </Button>
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
