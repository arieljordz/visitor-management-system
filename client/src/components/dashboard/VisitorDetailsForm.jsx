import React from "react";
import { Form, Row, Col } from "react-bootstrap";

const VisitorDetailsForm = ({ visitorType, formData, classifications, onChange }) => {
  return (
    <>
      <Row className="mt-2 mb-2">
        {visitorType === "Group" && (
          <Col md={6}>
            <Form.Group>
              <Form.Label>No. of Visitors</Form.Label>
              <Form.Control
                type="number"
                name="noOfVisitors"
                value={formData.noOfVisitors}
                onChange={onChange}
                min={1}
                required
              />
            </Form.Group>
          </Col>
        )}
        <Col md={6}>
          <Form.Group>
            <Form.Label>Visit Date</Form.Label>
            <Form.Control
              type="date"
              name="visitDate"
              value={formData.visitDate}
              onChange={onChange}
              required
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label>Purpose</Form.Label>
            <Form.Control
              type="text"
              name="purpose"
              value={formData.purpose}
              onChange={onChange}
              placeholder="Enter pupose"
              required
            />
          </Form.Group>
        </Col>
        <Col md={6} className="mt-2">
          <Form.Group>
            <Form.Label>Classification</Form.Label>
            <Form.Select
              name="classification"
              value={formData.classification}
              onChange={onChange}
              className="form-control"
              required
            >
              <option value="">-- Select Classification --</option>
              {classifications.map((c, i) => (
                <option key={i} value={c.description}>
                  {c.description}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>
    </>
  );
};

export default VisitorDetailsForm;
