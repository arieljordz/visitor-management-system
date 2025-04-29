import React, { useState, useEffect } from "react";
import { Card, Row, Col } from "react-bootstrap";
import Navpath from "../../components/common/Navpath";
import TopUp from "../../components/myWallet/TopUp";
import { getActivePaymentAccounts } from "../../services/paymentAccountService";

const MyWallet = ({ user, setUser }) => {
  const [balance, setBalance] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("gcash");
  const [paymentAccounts, setPaymentAccounts] = useState([]);
  const [proof, setProof] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchPaymentAccounts = async () => {
      try {
        const data = await getActivePaymentAccounts();
        console.log("PaymentAccounts:", data);
        setPaymentAccounts(data);
      } catch (error) {
        console.error("Error fetching payment accounts:", error.message);
      }
    };

    if (user) fetchPaymentAccounts();
  }, [user]);

  return (
    <div className="content-wrapper">
      <Navpath levelOne="My Wallet" levelTwo="Home" levelThree="My Wallet" />

      <section className="content">
        <div className="container-fluid">
          <Row className="justify-content-center">
            <Col md={8} lg={12}>
              <Card>
                <Card.Body className="main-card">
                  <TopUp
                    user={user}
                    paymentMethod={paymentMethod}
                    setPaymentMethod={setPaymentMethod}
                    paymentAccounts={paymentAccounts}
                    proof={proof}
                    setProof={setProof}
                    setBalance={setBalance}
                    isLoading={isLoading}
                    setIsLoading={setIsLoading}
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
