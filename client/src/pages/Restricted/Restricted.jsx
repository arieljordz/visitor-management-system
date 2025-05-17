import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Card, Row, Col, Button } from "react-bootstrap";
import Navpath from "../../components/common/Navpath";

function Restricted() {
  const { user } = useAuth();
  return (
    <div>
      <div className="content-wrapper">
        {/* Content Header */}
        <Navpath
          levelOne="Restricted"
          levelTwo="Home"
          levelThree="Restricted"
        />

        {/* Main Content */}
        <section className="content">
          <div className="container-fluid">
            <Row className="justify-content-center">
              <Col md={8} lg={12}>
                {/* Card with conditional dark mode styling */}
                <Card>
                  <Card.Body className="main-card">
                    <div className="mt-4">
                      <h5>Basic Feature</h5>
                      <p>Everyone can access this.</p>
                    </div>

                    <div className="mt-4">
                      <h5>Premium Feature</h5>
                    </div>
                    <p className="text-muted">
                      This feature is available for subscribed users only.
                    </p>
                    <ul>
                      <li>Access all premium features</li>
                      <li>Remove limitations</li>
                      <li>Priority support</li>
                    </ul>
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

export default Restricted;
