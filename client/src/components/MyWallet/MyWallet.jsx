import React, { useState, useEffect } from "react";
import {
  Card,
  Form,
  Button,
  InputGroup,
  Container,
  Row,
  Col,
  Alert,
  Accordion,
} from "react-bootstrap";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import axios from "axios";
import FormHeader from "../../commons/FormHeader";
import TopUpForm from "../Dashboard/TopUpForm";
import { useTheme } from "../../context/ThemeContext";

const API_URL = import.meta.env.VITE_BASE_API_URL;

const MyWallet = ({ user }) => {
  const { darkMode } = useTheme();
  const [balance, setBalance] = useState(0.0);
  const [paymentMethod, setPaymentMethod] = useState("gcash");
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [proof, setProof] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const cardClass = darkMode ? "dashboard-card-dark" : "dashboard-card-light";

  useEffect(() => {
    fetchPaymentMethods();
  }, [user]);

  const fetchPaymentMethods = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/get-payment-methods`);
      setPaymentMethods(res.data.data);
    } catch {
      toast.error("Failed to load payment methods.");
    }
  };

  return (
    <Container className="mt-6">
      <FormHeader
        levelOne="Home"
        levelTwo="File Maintenance"
        levelThree={user?.name?.split(" ")[0]}
      />
      <Row className="justify-content-center">
        <Col md={8} lg={12}>
          <Card className={`shadow ${cardClass}`}>
            <Card.Body className="main-card">
              {/* <h4 className="text-center mb-4">
                Current Balance: ₱{parseFloat(balance).toFixed(2)}
              </h4> */}

              <h3 className="mb-4 text-center">💰 My Wallet</h3>
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
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default MyWallet;
