import React from "react";
import { Form, Row, Col } from "react-bootstrap";

const VisitorDetailsForm = ({
  visitorType,
  formData,
  classifications,
  departments,
  onChange,
}) => {
  // console.log("departments:", departments);
  return (
    <>
      <Row className="mt-2 mb-2">
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
              placeholder="Enter purpose"
              required
            />
          </Form.Group>
        </Col>
      </Row>
      <Row className="mt-2 mb-2">
        <Col md={6}>
          <Form.Group>
            <Form.Label>Department</Form.Label>
            <Form.Select
              name="department"
              value={formData.department}
              onChange={onChange}
              className="form-control"
              required
            >
              <option value="">-- Select Department --</option>
              {departments.map((c, i) => (
                <option key={i} value={c.description}>
                  {c.description}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={6}>
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
      <Row className="mt-2">
        <Col md={12}>
          <div className="form-group">
            <div className="custom-control custom-switch">
              <input
                type="checkbox"
                className="custom-control-input"
                id="status-switch"
                name="expiryStatus"
                checked={formData.expiryStatus === true}
                onChange={onChange}
              />
              <label className="custom-control-label" htmlFor="status-switch">
                {formData.expiryStatus === true ? "No Expiration" : "Valid Today"}
              </label>
            </div>
          </div>
        </Col>
      </Row>
    </>
  );
};

export default VisitorDetailsForm;
