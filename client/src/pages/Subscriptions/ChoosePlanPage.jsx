import React from "react";
import { useAuth } from "../../context/AuthContext";
import { Card, Button, Row, Col } from "react-bootstrap";
import Navpath from "../../components/common/Navpath";

const plans = [
  {
    name: "Basic",
    price: "₱99/month",
    features: ["Access dashboard", "Generate QR"],
  },
  {
    name: "Premium",
    price: "₱199/month",
    features: ["All features", "Priority support"],
  },
];

function ChoosePlanPage({ onSelect }) {
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
                    <h2 className="text-center mb-4">Choose Your Plan</h2>
                    <Row>
                      {plans.map((plan, idx) => (
                        <Col md={6} key={idx}>
                          <Card className="mb-4">
                            <Card.Body>
                              <Card.Title>{plan.name}</Card.Title>
                              <Card.Subtitle className="mb-2 text-muted">
                                {plan.price}
                              </Card.Subtitle>
                              <ul>
                                {plan.features.map((feat, i) => (
                                  <li key={i}>{feat}</li>
                                ))}
                              </ul>
                              <Button
                                onClick={() => onSelect(plan.name)}
                                variant="primary"
                              >
                                Select
                              </Button>
                            </Card.Body>
                          </Card>
                        </Col>
                      ))}
                    </Row>
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

export default ChoosePlanPage;
