import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import { toast } from "react-toastify";
import { createVisitor } from "../../../services/visitorService.js";
import { getClassifications } from "../../../services/classificationService.js";

const VisitorsModal = ({ user, show, onHide, refreshList }) => {
  const [classifications, setClassifications] = useState([]);
  const [formData, setFormData] = useState({
    visitorType: "Individual",
    firstName: "",
    lastName: "",
    groupName: "",
    noOfVisitors: "",
    visitDate: "",
    purpose: "",
    classification: "",
  });

  useEffect(() => {
    fetchClassifications();
  }, []);

  const fetchClassifications = async () => {
    try {
      const data = await getClassifications();
      setClassifications(data || []);
    } catch (err) {
      console.error("Error fetching classifications:", err);
    }
  };

  const handleTypeChange = (type) => {
    setFormData({
      visitorType: type,
      firstName: "",
      lastName: "",
      groupName: "",
      noOfVisitors: "",
      visitDate: "",
      purpose: "",
      classification: "",
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user?.userId) {
      toast.error("User not authenticated.");
      return;
    }

    const dataToSubmit = {
      userId: user.userId,
      ...formData,
    };

    try {
      await createVisitor(dataToSubmit);
      toast.success("Visitor saved successfully");
      refreshList();
      onHide();
    } catch (error) {
      console.error("Error saving visitor:", error);
      if (error.status === 409) {
        toast.warning(
          "The visitor is already registered, with an active QR code currently assigned."
        );
      }
    }
  };

  return (
    <Modal show={show} backdrop="static" size="lg" keyboard={false} centered>
      {/* Header */}
      <div className="modal-header">
        <h5 className="modal-title fw-bold">Add Visitor Details</h5>
        <button
          type="button"
          className="close"
          onClick={onHide}
          aria-label="Close"
        >
          <span aria-hidden="true">&times;</span>
        </button>
      </div>

      {/* Body */}
      <Form onSubmit={handleSubmit}>
        <div className="modal-body">
          {/* Visitor Type */}
          <Form.Group className="mb-3">
            <Form.Label className="fw-bold">Visitor Type:</Form.Label>
            <div>
              {["Individual", "Group"].map((type) => (
                <Form.Check
                  key={type}
                  inline
                  type="radio"
                  id={type.toLowerCase()}
                  label={type}
                  checked={formData.visitorType === type}
                  onChange={() => handleTypeChange(type)}
                />
              ))}
            </div>
          </Form.Group>
          {/* Conditional Fields */}
          <Row>
            {formData.visitorType === "Individual" ? (
              <>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>First Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="Enter first name"
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Last Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Enter last name"
                      required
                    />
                  </Form.Group>
                </Col>
              </>
            ) : (
              <>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Group Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="groupName"
                      value={formData.groupName}
                      onChange={handleChange}
                      placeholder="Enter group name"
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>No. of Visitors</Form.Label>
                    <Form.Control
                      type="number"
                      name="noOfVisitors"
                      value={formData.noOfVisitors}
                      onChange={handleChange}
                      placeholder="Enter number of visitors"
                      min={1}
                      required
                    />
                  </Form.Group>
                </Col>
              </>
            )}
            {/* Shared Fields */}
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Visit Date</Form.Label>
                <Form.Control
                  type="date"
                  name="visitDate"
                  value={formData.visitDate}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Purpose</Form.Label>
                <Form.Control
                  type="text"
                  name="purpose"
                  value={formData.purpose}
                  onChange={handleChange}
                  placeholder="Enter purpose of visit"
                  required
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Classification</Form.Label>
                <Form.Select
                  name="classification"
                  value={formData.classification}
                  onChange={handleChange}
                  className="form-control"
                  required
                >
                  <option value="">-- Select Classification --</option>
                  {classifications.map((item, index) => (
                    <option key={index} value={item.description}>
                      {item.description}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
        </div>

        {/* Footer */}
        <div className="modal-footer justify-content-end">
          <Button variant="secondary" onClick={onHide}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            Save
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default VisitorsModal;
