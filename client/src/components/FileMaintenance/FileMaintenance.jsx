import React, { useState } from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import FormHeader from "../../commons/FormHeader";
import TXNGeneratedQRCodes from "../Transactions/TXNGeneratedQRCodes";
import { useTheme } from "../../context/ThemeContext";
import FMProofs from "./FMProofs";
import FMClassifications from "./FMClassifications";
import FMFees from "./FMFees";
import FMPaymentMethod from "./FMPaymentMethod";
import FMAccounts from "./FMAccounts";

const FileMaintenance = ({ user }) => {
  const { darkMode } = useTheme();
  const [activeTab, setActiveTab] = useState("proofs");

  //   console.log("User Details:", user);

  const cardClass = darkMode ? "dashboard-card-dark" : "dashboard-card-light";

  const tabLinkClass = (tab) => {
    const isActive = activeTab === tab;
    return `nav-link border ${isActive ? "active" : ""} ${
      darkMode
        ? isActive
          ? "text-dark bg-white border-secondary"
          : "text-white border-secondary"
        : ""
    }`;
  };

  return (
    <Container className="mt-6">
      <FormHeader
        levelOne="Home"
        levelTwo="File Maintenance"
        levelThree={user?.name?.split(" ")[0]}
      />
      <Row className="justify-content-center">
        <Col md={10} lg={12}>
          <Card className={`shadow ${cardClass}`}>
            <Card.Body className="main-card">
              {/* Nav Tabs */}
              <ul
                className={`nav nav-tabs mb-3 ${
                  darkMode ? "border-bottom border-secondary" : ""
                }`}
              >
                <li className="nav-item">
                  <button
                    className={tabLinkClass("proofs")}
                    onClick={() => setActiveTab("proofs")}
                  >
                    Proofs
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={tabLinkClass("payment-method")}
                    onClick={() => setActiveTab("payment-method")}
                  >
                    Payment Methods
                  </button>
                </li>

                <li className="nav-item">
                  <button
                    className={tabLinkClass("classifications")}
                    onClick={() => setActiveTab("classifications")}
                  >
                    Classifications
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={tabLinkClass("fees")}
                    onClick={() => setActiveTab("fees")}
                  >
                    Fees
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={tabLinkClass("accounts")}
                    onClick={() => setActiveTab("accounts")}
                  >
                    Accounts
                  </button>
                </li>
              </ul>

              {/* Tab Content */}
              <div className="tab-content">
                {activeTab === "proofs" && (
                  <div>
                    <FMProofs user={user} darkMode={darkMode} />
                  </div>
                )}
                {activeTab === "payment-method" && (
                  <div>
                    <FMPaymentMethod user={user} darkMode={darkMode} />
                  </div>
                )}
                {activeTab === "classifications" && (
                  <div>
                    <FMClassifications user={user} darkMode={darkMode} />
                  </div>
                )}
                {activeTab === "fees" && (
                  <div>
                    <FMFees user={user} darkMode={darkMode} />
                  </div>
                )}
                {activeTab === "accounts" && (
                  <div>
                    <FMAccounts user={user} darkMode={darkMode} />
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

export default FileMaintenance;
