import React from "react";
import { Card, Row, Col } from "react-bootstrap";
import Navpath from "../../components/common/Navpath";
import QRScanner from "./QRScanner";


function ScanQR() {
  return (
    <div>
      <div className="content-wrapper">
        {/* Content Header */}
        <Navpath levelOne="Scan QR" levelTwo="Home" levelThree="Scan QR" />

        {/* Main Content */}
        <section className="content">
          <div className="container-fluid">
            <Row className="justify-content-center">
              <Col md={8} lg={12}>
                {/* Card with conditional dark mode styling */}
                <Card>
                  <Card.Body className="main-card">
                    <QRScanner />
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

export default ScanQR;
