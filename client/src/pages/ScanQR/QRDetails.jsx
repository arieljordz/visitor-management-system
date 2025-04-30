import React from "react";
import moment from "moment";
import { Form, Row, Col, Card } from "react-bootstrap";

const QRDetails = ({ responseMessage }) => {
  const { clientName, visitorName, visitDate, purpose } = responseMessage.data;

  return (
    <Card className="border-success shadow-sm mt-4">
      <Card.Header className="bg-success text-white">
        <h5 className="mb-0">Visitor Details</h5>
      </Card.Header>
      <Card.Body>
        <Row className="mb-3">
          <Col md={6}>
            <Form.Label className="fw-semibold">Home Owner Name</Form.Label>
            <div className="form-control-plaintext border rounded px-3 py-2 bg-light">
              {clientName}
            </div>
          </Col>
          <Col md={6}>
            <Form.Label className="fw-semibold">Visitor Name</Form.Label>
            <div className="form-control-plaintext border rounded px-3 py-2 bg-light">
              {visitorName}
            </div>
          </Col>
        </Row>
        <Row>
          <Col md={6}>
            <Form.Label className="fw-semibold">Visit Date</Form.Label>
            <div className="form-control-plaintext border rounded px-3 py-2 bg-light">
              {moment(visitDate).format("MMMM DD, YYYY")}
            </div>
          </Col>
          <Col md={6}>
            <Form.Label className="fw-semibold">Purpose</Form.Label>
            <div className="form-control-plaintext border rounded px-3 py-2 bg-light">
              {purpose}
            </div>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default QRDetails;
