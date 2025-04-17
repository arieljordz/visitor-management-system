import React, { useState } from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import Header from "../Common/Header";
import TXNPaymentDetails from "../Transactions/TXNPaymentDetails";
import TXNGeneratedQRCodes from "../Transactions/TXNGeneratedQRCodes"; 
import { useTheme } from "../../context/ThemeContext";

const Transactions = ({ user }) => {
  const { darkMode } = useTheme();
  const [activeTab, setActiveTab] = useState("payment");

  //   console.log("User Details:", user);

  const cardClass = darkMode ? "dashboard-card-dark" : "dashboard-card-light";

  const tabLinkClass = (tab) => {
    const isActive = activeTab === tab;
    return `nav-link border ${
      isActive ? "active" : ""
    } ${darkMode ? (isActive ? "text-dark bg-white border-secondary" : "text-white border-secondary") : ""}`;
  };
  

  return (
    <Container className="mt-6">
      <Header
        levelOne="Home"
        levelTwo="Transactions"
        levelThree={user?.email}
      />
      <Row className="justify-content-center">
        <Col md={10} lg={12}>
          <Card className={`shadow ${cardClass}`}>
            <Card.Body className="main-card">
              {/* Nav Tabs */}
              <ul className={`nav nav-tabs mb-3 ${darkMode ? "border-bottom border-secondary" : ""}`}>
                <li className="nav-item">
                  <button
                    className={tabLinkClass("payment")}
                    onClick={() => setActiveTab("payment")}
                  >
                    Payment History
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={tabLinkClass("qr")}
                    onClick={() => setActiveTab("qr")}
                  >
                    Generated QR Codes
                  </button>
                </li>
              </ul>

              {/* Tab Content */}
              <div className="tab-content">
                {activeTab === "payment" && (
                  <div>
                    <TXNPaymentDetails user={user} darkMode={darkMode} />
                  </div>
                )}
                {activeTab === "qr" && (
                  <div>
                    <TXNGeneratedQRCodes user={user} darkMode={darkMode} />
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Transactions;
