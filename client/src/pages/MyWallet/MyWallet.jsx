import React, { useState, useEffect } from "react";
import { Card, Row, Col } from "react-bootstrap";
import { toast } from "react-toastify";
import TopUp from "../../components/myWallet/TopUp";
import Navpath from "../../components/common/Navpath";
import { getPaymentMethods } from "../../services/paymentMethodService.js";

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
      const data = await getPaymentMethods();
      setPaymentMethods(data);
    } catch (error) {
      console.error(error.message);
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
