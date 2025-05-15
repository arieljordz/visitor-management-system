import React from "react";
import { Card, Button, Row, Col } from "react-bootstrap";
import { useAuth } from "../../context/AuthContext";
import Navpath from "../../components/common/Navpath";

const plans = [
  {
    name: "Free",
    price: "₱0/month",
    features: ["Valid for 3 Days", "Access dashboard", "Generate QR"],
  },
  {
    name: "Premium",
    price: "₱999/month",
    features: ["Valid for 1 Month", "All features", "Priority support"],
  },
];

const PlanCard = ({ plan, onSelect }) => (
  <Col md={6}>
    <Card className="mb-4">
      <Card.Body>
        <Card.Title>{plan.name}</Card.Title>
        <Card.Subtitle className="mb-2 text-muted">{plan.price}</Card.Subtitle>
        <ul>
          {plan.features.map((feature, index) => (
            <li key={index}>{feature}</li>
          ))}
        </ul>
        <Button variant="primary" onClick={() => onSelect(plan.name)}>
          Select
        </Button>
      </Card.Body>
    </Card>
  </Col>
);

const ChoosePlanPage = ({ onSelect }) => {
  return (
    <div className="content-wrapper">
      <Navpath levelOne="Subscribe" levelTwo="Home" levelThree="Subscribe" />
      <section className="content">
        <div className="container-fluid">
          <Row className="justify-content-center">
            <Col md={8} lg={12}>
              <Card>
                <Card.Body className="main-card">
                  <h2 className="text-center mb-4">Choose Your Plan</h2>
                  <Row>
                    {plans.map((plan, idx) => (
                      <PlanCard key={idx} plan={plan} onSelect={onSelect} />
                    ))}
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </div>
      </section>
    </div>
  );
};

export default ChoosePlanPage;
