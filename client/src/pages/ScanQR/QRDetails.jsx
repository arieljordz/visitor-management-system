import React from "react";
import moment from "moment";
import { Card, Row, Col } from "react-bootstrap";

const QRDetails = ({ responseMessage }) => {
  const { hostName, visitor, visitDetail } = responseMessage.data;

  console.log("responseMessage:", responseMessage);

  return (
    <Card className="border-success shadow-sm mt-4">
      <Card.Header className="bg-success text-white">
        <h5 className="mb-0">Visitor Details</h5>
      </Card.Header>
      <Card.Body>
        <Row className="mb-3">
          <Col md={6}>
            <h6 className="text-muted">Host Name</h6>
            <p className="border rounded px-3 py-2 bg-light mb-0">{hostName}</p>
          </Col>
          <Col md={6}>
            <h6 className="text-muted">Visitor Name</h6>
            <p className="border rounded px-3 py-2 bg-light mb-0">
              {visitor.visitorName}
            </p>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={6}>
            <h6 className="text-muted">Visit Date</h6>
            <p className="border rounded px-3 py-2 bg-light mb-0">
              {moment(visitDetail.visitDate).format("MMMM DD, YYYY")}
            </p>
          </Col>
          <Col md={6}>
            <h6 className="text-muted">Purpose</h6>
            <p className="border rounded px-3 py-2 bg-light mb-0">
              {visitDetail.purpose}
            </p>
          </Col>
        </Row>

        <Row>
          <Col md={6}>
            <h6 className="text-muted">Department</h6>
            <p className="border rounded px-3 py-2 bg-light mb-0">
              {visitDetail.department}
            </p>
          </Col>
          <Col md={6}>
            <h6 className="text-muted">Classification</h6>
            <p className="border rounded px-3 py-2 bg-light mb-0">
              {visitDetail.classification}
            </p>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default QRDetails;
