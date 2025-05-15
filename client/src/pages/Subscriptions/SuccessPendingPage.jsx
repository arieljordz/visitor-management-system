import React from "react";
import { Card, Row, Col, Alert, Button } from "react-bootstrap";
import { useAuth } from "../../context/AuthContext";
import Navpath from "../../components/common/Navpath";

const SuccessPendingPage = ({title, messages}) => {
  const { user } = useAuth();

  return (
    <div className="content-wrapper">
      <Navpath levelOne="Subscribe" levelTwo="Home" levelThree="Subscribe" />
      <section className="content">
        <div className="container-fluid">
          <Row className="justify-content-center">
            <Col md={8} lg={12}>
              <Card>
                <Card.Body className="main-card">
                  <Alert variant="info">
                    <h4>{title}</h4>
                    {messages.map((msg, index) => (
                      <p key={index}>{msg}</p>
                    ))}
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
  );
};

export default SuccessPendingPage;
