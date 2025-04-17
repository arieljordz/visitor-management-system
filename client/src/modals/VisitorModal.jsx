import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import { toast } from "react-toastify";
import axios from "axios";
import { useTheme } from "../context/ThemeContext";

const API_URL = import.meta.env.VITE_BASE_API_URL;

const VisitorModal = ({ user, show, onHide, refreshList }) => {
  const { darkMode } = useTheme();
  const modalClass = darkMode ? "bg-dark text-light" : "bg-white text-dark";

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
      const res = await axios.get(`${API_URL}/api/get-classifications`);
      setClassifications(res.data.data || []);
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

    console.log("Submitted Data:", dataToSubmit);

    try {
      await axios.post(`${API_URL}/api/create-visitor`, dataToSubmit);
      toast.success("Visitor saved successfully");
      refreshList();
      onHide();
    } catch (error) {
      console.error("Error saving visitor:", error);
      toast.error("Failed to save visitor");
    }
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="lg"
      backdrop="static"
      contentClassName={modalClass}
    >
      <Modal.Header closeButton className={modalClass}>
        <Modal.Title>Add Visitor Details</Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body className={modalClass}>
          {/* Visitor Type Selection */}
          <div className="mb-3">
            <Form.Label className="fw-bold me-3">Visitor Type:</Form.Label>
            <Form.Check
              inline
              type="radio"
              id="individual"
              label="Individual"
              checked={formData.visitorType === "Individual"}
              onChange={() => handleTypeChange("Individual")}
            />
            <Form.Check
              inline
              type="radio"
              id="group"
              label="Group"
              checked={formData.visitorType === "Group"}
              onChange={() => handleTypeChange("Group")}
            />
          </div>

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
        </Modal.Body>

        <Modal.Footer className={modalClass}>
          <Button variant="secondary" onClick={onHide}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            Submit
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default VisitorModal;
