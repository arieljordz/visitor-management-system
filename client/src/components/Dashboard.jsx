import React, { useState, useEffect } from "react";
import { Button, Alert, Spinner, Row, Col, Card } from "react-bootstrap";
import axios from "axios";
import QRDisplay from "./QRDisplay";
import TopUpForm from "./TopUpForm";

const API_URL = import.meta.env.VITE_BASE_API_URL;

const Dashboard = ({ user }) => {
  const [balance, setBalance] = useState(null);
  const [qrCode, setQrCode] = useState(null);
  const [message, setMessage] = useState("");
  const [showMessage, setShowMessage] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("gcash");
  const [proof, setProof] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [canPay, setCanPay] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState([]);

  // Fetch payment methods and balance on load
  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/get-payment-methods`);
        setPaymentMethods(res.data);
      } catch (error) {
        setMessage("Failed to load payment methods.");
        setShowMessage(true);
      }
    };

    const fetchBalance = async () => {
      setIsLoading(true);
      try {
        const res = await axios.get(`${API_URL}/api/check-balance/${user.userId}`);
        setBalance(res.data.balance);
        if (res.data.balance < 100) {
          setMessage("Your balance is less than ₱100. Please top-up.");
          setShowMessage(true);
        }
      } catch {
        setMessage("Your balance is insufficient to generate a QR code.");
        setShowMessage(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPaymentMethods();
    fetchBalance();
  }, [user]);

  // Helper function to handle setting messages
  const handleMessage = (message, isError = false) => {
    setMessage(message);
    setShowMessage(true);
    setIsLoading(false);
    setQrCode(null); // Clear the QR code in case of error
  };

  const handleTopUp = async () => {
    if (!topUpAmount || parseFloat(topUpAmount) <= 0 || !proof) {
      handleMessage("Please enter a valid amount and upload proof.", true);
      return;
    }

    const formData = new FormData();
    formData.append("topUpAmount", parseFloat(topUpAmount));
    formData.append("paymentMethod", paymentMethod);
    formData.append("proof", proof);

    setIsLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/top-up/${user.userId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setBalance(res.data.balance);
      handleMessage(`Top-up submitted. Awaiting confirmation. Balance: ₱${res.data.balance}`);
      setTopUpAmount("");
      setProof(null);
    } catch {
      handleMessage("Top-up failed. Please try again.", true);
    }
  };

  const generateQR = async () => {
    if (balance < 100) {
      handleMessage("Your balance is insufficient to generate a QR code.", true);
      return;
    }

    setIsLoading(true);
    try {
      const qrCode = await generateQrCode();
      setQrCode(qrCode);
      setCanPay(true);
      handleMessage("QR Code generated. Proceeding to payment...");

      const paymentSuccess = await payBalance();
      if (!paymentSuccess) handlePaymentFailure();
    } catch (error) {
      handleMessage("QR generation failed", true);
    }
  };

  const generateQrCode = async () => {
    const res = await axios.post(`${API_URL}/api/generate-qr/${user.userId}`);
    return res.data.qrCode;
  };

  const payBalance = async () => {
    try {
      const response = await axios.post(`${API_URL}/api/payment`, { userId: user.userId });
      if (response.status === 200) {
        setBalance(0);
        handleMessage("Payment successful");
        return true;
      } else {
        handleMessage("Payment failed: " + response.data.message, true);
        return false;
      }
    } catch (error) {
      handleMessage("Payment failed", true);
      return false;
    }
  };

  const handlePaymentFailure = () => {
    handleMessage("Payment failed. QR generation is canceled.", true);
    setQrCode(null);
  };

  return (
    <Row className="justify-content-center p-3">
      <h2 className="text-center mb-4">Welcome, {user?.email}</h2>
      <Col md={8} lg={6}>
        <Card className="p-4">
          <Card.Body>
            <h4 className="text-center mb-4">Current Balance: ₱{balance}</h4>

            {/* Top-Up Form Component */}
            <TopUpForm
              topUpAmount={topUpAmount}
              setTopUpAmount={setTopUpAmount}
              paymentMethod={paymentMethod}
              setPaymentMethod={setPaymentMethod}
              paymentMethods={paymentMethods}
              proof={proof}
              setProof={setProof}
              handleTopUp={handleTopUp}
              isLoading={isLoading}
            />

            {showMessage && (
              <Alert
                className="mt-3"
                variant={message.includes("failed") ? "danger" : "success"}
                onClose={() => setShowMessage(false)}
                dismissible
              >
                {message}
              </Alert>
            )}

            {/* QR Code & Payment */}
            <div className="text-center mt-4">
              <Button
                onClick={generateQR}
                variant="info"
                className="mb-2 w-100"
                disabled={isLoading}
              >
                {isLoading ? <Spinner animation="border" size="sm" /> : "Generate QR Code"}
              </Button>

              {qrCode && <QRDisplay qrCode={qrCode} />}
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default Dashboard;
