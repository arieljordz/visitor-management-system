import React, { useState, useEffect } from "react";
import { Card, Row, Col } from "react-bootstrap";
import { toast } from "react-toastify";
import axios from "axios";
import TopUp from "../../components/myWallet/TopUp";
import Navpath from "../../components/common/Navpath";

const API_URL = import.meta.env.VITE_BASE_API_URL;

const MyWallet = ({ user, setUser }) => {
  // State variables for wallet details
  const [balance, setBalance] = useState(0.0);
  const [paymentMethod, setPaymentMethod] = useState("gcash");
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [proof, setProof] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch payment methods on component mount
  useEffect(() => {
    fetchPaymentMethods();
  }, [user]);

  const fetchPaymentMethods = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/get-payment-methods`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      setPaymentMethods(response.data.data);
    } catch (error) {
      toast.error("Failed to load payment methods.");
    }
  };

  return (
    <div className="content-wrapper">
      {/* Content Header */}
      <Navpath levelOne="My Wallet" levelTwo="Home" levelThree="My Wallet" />

      {/* Main Content */}
      <section className="content">
        <div className="container-fluid">
          <Row className="justify-content-center">
            <Col md={8} lg={12}>
              {/* Card with conditional dark mode styling */}
              <Card>
                <Card.Body className="main-card">
                  <TopUp
                    user={user}
                    paymentMethod={paymentMethod}
                    setPaymentMethod={setPaymentMethod}
                    paymentMethods={paymentMethods}
                    proof={proof}
                    setProof={setProof}
                    setBalance={setBalance}
                    isLoading={isLoading}
                  />
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </div>
      </section>
    </div>
  );
};

export default MyWallet;
