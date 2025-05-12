import React from "react";
import { useAuth } from "../../context/AuthContext";
import { Card, Row, Col, Alert, Button } from "react-bootstrap";
import Navpath from "../../components/common/Navpath";

function SuccessPendingPage() {
  const { user } = useAuth();
  return (
    <div>
      <div className="content-wrapper">
        {/* Content Header */}
        <Navpath levelOne="Subscribe" levelTwo="Home" levelThree="Subscribe" />

        {/* Main Content */}
        <section className="content">
          <div className="container-fluid">
            <Row className="justify-content-center">
              <Col md={8} lg={12}>
                {/* Card with conditional dark mode styling */}
                <Card>
                  <Card.Body className="main-card">
                    <Alert variant="info">
                      <h4>✅ Payment Submitted</h4>
                      <p>
                        Your subscription is currently pending verification.
                      </p>
                      <p>We will notify you once it's approved.</p>
                    </Alert>
                    <Button href="/dashboard" variant="primary">
                      Go to Dashboard
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </div>
        </section>
      </div>
    </div>
  );
}

export default SuccessPendingPage;
