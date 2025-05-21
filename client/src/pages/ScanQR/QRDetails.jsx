import React from "react";
import moment from "moment";
import { Card, Row, Col, Image } from "react-bootstrap";
import { ValidityEnum } from "../../enums/enums.js";

const QRDetails = ({ responseMessage }) => {
  const { hostName, visitor, visitDetail } = responseMessage.data;

  console.log("responseMessage:", responseMessage);

  return (
    <Card className="border-success shadow-sm mt-4">
      <Card.Header className="bg-success text-white">
        <h5 className="mb-0">Visitor Details</h5>
      </Card.Header>
      <Card.Body>
        <Row>
          {/* Left: Textual details */}
          <Col md={8}>
            <Row className="mb-3">
              <Col sm={6}>
                <h6 className="text-muted">Host Name</h6>
                <p className="border rounded px-3 py-2 bg-light mb-0">
                  {hostName}
                </p>
              </Col>
              <Col sm={6}>
                <h6 className="text-muted">Visitor Name</h6>
                <p className="border rounded px-3 py-2 bg-light mb-0">
                  {visitor.visitorName}
                </p>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col sm={6}>
                <h6 className="text-muted">Visit Date</h6>
                <p className="border rounded px-3 py-2 bg-light mb-0">
                  {moment(visitDetail.visitDate).format("MMMM DD, YYYY")}
                </p>
              </Col>
              <Col sm={6}>
                <h6 className="text-muted">Purpose</h6>
                <p className="border rounded px-3 py-2 bg-light mb-0">
                  {visitDetail.purpose}
                </p>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col sm={6}>
                <h6 className="text-muted">Department</h6>
                <p className="border rounded px-3 py-2 bg-light mb-0">
                  {visitDetail.department}
                </p>
              </Col>
              <Col sm={6}>
                <h6 className="text-muted">Classification</h6>
                <p className="border rounded px-3 py-2 bg-light mb-0">
                  {visitDetail.classification}
                </p>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col sm={12}>
                <h6 className="text-muted">Validity</h6>
                <p className="border rounded px-3 py-2 bg-light mb-0">
                  {visitDetail.validity}
                </p>
              </Col>
            </Row>
          </Col>

          {/* Right: Visitor image */}
          <Col md={4}>
            <div
              className="border rounded d-flex align-items-center justify-content-center"
              style={{
                height: "100%",
                minHeight: "300px",
                backgroundColor: "#f8f9fa",
              }}
            >
              {visitor.visitorImage ? (
                <Image
                  src={visitor.visitorImage}
                  alt="Visitor Preview"
                  fluid
                  rounded
                  thumbnail
                  style={{
                    maxHeight: "100%",
                    maxWidth: "100%",
                    objectFit: "contain",
                  }}
                />
              ) : (
                <span className="text-muted">No image uploaded</span>
              )}
            </div>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default QRDetails;
