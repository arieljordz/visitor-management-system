import React, { useState, useEffect } from "react";
import {
  Button,
  Alert,
  Spinner,
  Row,
  Col,
  Card,
  Accordion,
} from "react-bootstrap";
import { toast } from "react-toastify";
import axios from "axios";
import QRDisplay from "./QRDisplay";
import TopUpForm from "./TopUpForm";

const API_URL = import.meta.env.VITE_BASE_API_URL;

const Dashboard = ({ user }) => {
  const [balance, setBalance] = useState(null);
  const [qrCode, setQrCode] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("gcash");
  const [proof, setProof] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState([]);

  // Fetch payment methods and balance on mount
  useEffect(() => {
    if (user && user.userId) {
      fetchUserBalance();
    }
    fetchPaymentMethods();
  }, [user]);

  const fetchPaymentMethods = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/get-payment-methods`);
      setPaymentMethods(res.data);
    } catch {
      toast.error("Failed to load payment methods.");
    }
  };

  const fetchUserBalance = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(
        `${API_URL}/api/check-balance/${user?.userId}`
      );

      if (res.status === 200 && res.data?.balance !== undefined) {
        setBalance(res.data.balance);

        if (res.data.balance < 100) {
          toast.warning("Your balance is less than ₱100. Please top-up.");
        }

        console.log("Fetched balance:", res.data.balance);
      } else {
        toast.error("Unexpected response while fetching balance.");
      }
    } catch (error) {
      console.error("Balance fetch error:", error?.response || error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateQR = async () => {
    try {
      const res = await axios.post(`${API_URL}/api/generate-qr/${user.userId}`);
      console.log("QrCode Result:",res);
      setQrCode(res.data.qrImageUrl);
      return true;
    } catch {
      toast.error("QR generation failed.");
      return false;
    }
  };

  const payBalance = async () => {
    setIsLoading(true); // Set loading state to true before starting the request

    try {
      const res = await axios.post(`${API_URL}/api/submit-payment`, {
        userId: user.userId,
      });

      console.log("payment response:", res);

      // Check if the payment was successful based on status code
      if (res.status === 200) {
        // Deduct 100 from the balance
        setBalance((prev) => prev - 100);
        toast.success("Payment successful. ₱100 has been deducted from your balance.");
        return true;
      }

      // If payment fails but status is not 200, show error message
      toast.error("Payment failed: "+ (res.data.message || "Unknown error"));
      setQrCode(null);
      return false;
    } catch (error) {
      console.error("Payment error:", error); // Log error for debugging
      toast.error("Payment failed. Please try again.");
      setQrCode(null);
      return false;
    } finally {
      setIsLoading(false); // Reset loading state after completion
    }
  };

  const handleGenerateAndPay = async () => {
    if (balance < 100) {
      toast.warning("Your balance is insufficient to generate a QR code.");
    }

    setIsLoading(true);
    const qrGenerated = await generateQR();
    console.log("QrCode Generated:",qrGenerated);
    if (qrGenerated) {
      await payBalance();
    }
    setIsLoading(false);
  };

  return (
    <Row className="justify-content-center p-3">
      <h2 className="text-center mb-4">Welcome, {user?.email}</h2>

      <Col md={8} lg={6}>
        <Card className="p-4">
          <Card.Body>
            <h4 className="text-center mb-4">Current Balance: ₱{balance}</h4>

            {/* Accordion for Top-Up Form */}
            <Accordion defaultActiveKey={null}>
              <Accordion.Item eventKey="0">
                <Accordion.Header>Top-Up Balance</Accordion.Header>
                <Accordion.Body>
                  <TopUpForm
                    user={user}
                    paymentMethod={paymentMethod}
                    setPaymentMethod={setPaymentMethod}
                    paymentMethods={paymentMethods}
                    proof={proof}
                    setProof={setProof}
                    setBalance={setBalance}
                    isLoading={isLoading}
                  />
                </Accordion.Body>
              </Accordion.Item>
            </Accordion>

            {/* QR Section */}
            <div className="text-center mt-4">
              <Button
                onClick={handleGenerateAndPay}
                variant="info"
                className="mb-2 w-100"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Spinner animation="border" size="sm" />
                ) : (
                  "Generate QR Code"
                )}
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
