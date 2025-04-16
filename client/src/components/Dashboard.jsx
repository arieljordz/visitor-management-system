import React, { useState, useEffect } from "react";
import {
  Container,
  Button,
  Spinner,
  Row,
  Col,
  Card,
  Accordion,
} from "react-bootstrap";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import axios from "axios";
import QRDisplay from "./QRDisplay";
import TopUpForm from "./TopUpForm";
import Header from "./Header";
import { useTheme } from "../context/ThemeContext";

const API_URL = import.meta.env.VITE_BASE_API_URL;

const Dashboard = ({ user }) => {
  const [balance, setBalance] = useState(0.0);
  const [qrCode, setQrCode] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("gcash");
  const [proof, setProof] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState([]);

  const { darkMode } = useTheme();

  useEffect(() => {
    if (user?.userId) {
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
      const res = await axios.get(`${API_URL}/api/check-balance/${user?.userId}`);
      if (res.status === 200 && res.data?.balance !== undefined) {
        const parsedBalance = parseFloat(res.data.balance);
        setBalance(isNaN(parsedBalance) ? 0.0 : parsedBalance);
        console.log("Fetched balance:", parsedBalance);
      } else {
        toast.error("Unexpected response while fetching balance.");
        setBalance(0.0);
      }
    } catch (error) {
      console.error("Balance fetch error:", error?.response || error);
      setBalance(0.0);
    } finally {
      setIsLoading(false);
    }
  };

  const generateQR = async () => {
    try {
      const res = await axios.post(`${API_URL}/api/generate-qr/${user.userId}`);
      setQrCode(res.data.qrImageUrl);
      return true;
    } catch {
      toast.error("QR generation failed.");
      return false;
    }
  };

  const payBalance = async () => {
    try {
      const res = await axios.post(`${API_URL}/api/submit-payment`, {
        userId: user.userId,
      });

      if (res.status === 200) {
        const newBalance = balance - 100;
        setBalance(parseFloat(newBalance));
        toast.success("Payment successful. ₱100.00 has been deducted from your balance.");
        return true;
      }

      toast.error("Payment failed: " + (res.data.message || "Unknown error"));
      setQrCode(null);
      return false;
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Payment failed. Please try again.");
      setQrCode(null);
      return false;
    }
  };

  const handleGenerateAndPay = async () => {
    if (balance < 100) {
      toast.warning("Your balance is insufficient to generate a QR code.");
      return;
    }

    const result = await Swal.fire({
      title: "Proceed with QR Generation?",
      text: "₱100.00 will be deducted from your balance upon payment.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, generate and pay",
    });

    if (!result.isConfirmed) return;

    setIsLoading(true);
    try {
      const qrGenerated = await generateQR();
      if (qrGenerated) {
        await payBalance();
      }
    } catch (error) {
      console.error("Error generating QR or paying balance:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const cardClass = darkMode ? "dashboard-card-dark" : "dashboard-card-light";
  const btnClass = darkMode ? "dashboard-btn-dark" : "dashboard-btn-light";

  return (
    <Container className="mt-6">
      <Header levelOne="Home" levelTwo="Dashboard" levelThree={user?.email} />
      <Row className="justify-content-center">
        <Col md={8} lg={12}>
          <Card className={`shadow ${cardClass}`}>
            <Card.Body className="main-card">
              <h4 className="text-center mb-4">
                Current Balance: ₱{parseFloat(balance).toFixed(2)}
              </h4>

              <Accordion defaultActiveKey={null}>
                <Accordion.Item eventKey="0" className="accordion-success">
                  <Accordion.Header>Top-Up Balance</Accordion.Header>
                  <Accordion.Body className={`${cardClass}`}>
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

              <div className="text-center mt-4">
                <Button
                  onClick={handleGenerateAndPay}
                  className={`mb-2 w-100 ${btnClass}`}
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
    </Container>
  );
};

export default Dashboard;
