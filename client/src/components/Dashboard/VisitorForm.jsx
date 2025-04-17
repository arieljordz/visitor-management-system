import React, { useEffect, useState } from "react";
import { Form, Button, Row, Col } from "react-bootstrap";
import axios from "axios";

const VisitorForm = () => {
  const [visitorType, setVisitorType] = useState("Individual");
  const [classifications, setClassifications] = useState([]);

  const [formData, setFormData] = useState({
    FirstName: "",
    LastName: "",
    GroupName: "",
    NoOfVisitors: "",
    VisitDate: "",
    Purpose: "",
    Classification: "",
  });

  useEffect(() => {
    fetchClassifications();
  }, []);

  const fetchClassifications = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/get-classifications`);
      console.log("Fetch classifications:", res);
      setClassifications(res.data.data || []);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  const handleTypeChange = (type) => {
    setVisitorType(type);
    setFormData({
      FirstName: "",
      LastName: "",
      GroupName: "",
      NoOfVisitors: "",
      VisitDate: "",
      Purpose: "",
      Classification: "",
    });
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const dataToSubmit = {
      VisitorType: visitorType,
      ...formData,
    };

    try {
      const res = await axios.post(
        `${API_URL}/api/create-visitor`,
        dataToSubmit
      );

      console.log("Submitted Data:", res.data);
      toast.success("Visitor saved successfully");

      // Optionally clear form or reset state
      setFormData({});
      setVisitorType("");
    } catch (error) {
      console.error("Error saving visitor:", error);
      toast.error("Failed to save visitor");
    }
  };

  return (
    <Form onSubmit={handleSubmit} className="p-4 border rounded shadow-sm">
      <div className="mb-3">
        <Form.Label className="fw-bold me-3">Visitor Type:</Form.Label>
        <Form.Check
          inline
          label="Individual"
          name="visitorType"
          type="radio"
          id="individual"
          checked={visitorType === "Individual"}
          onChange={() => handleTypeChange("Individual")}
        />
        <Form.Check
          inline
          label="Group"
          name="visitorType"
          type="radio"
          id="group"
          checked={visitorType === "Group"}
          onChange={() => handleTypeChange("Group")}
        />
      </div>

      <Row>
        {visitorType === "Individual" ? (
          <>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>First Name</Form.Label>
                <Form.Control
                  type="text"
                  name="FirstName"
                  value={formData.FirstName}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Last Name</Form.Label>
                <Form.Control
                  type="text"
                  name="LastName"
                  value={formData.LastName}
                  onChange={handleChange}
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
                  name="GroupName"
                  value={formData.GroupName}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>No. of Visitors</Form.Label>
                <Form.Control
                  type="number"
                  name="NoOfVisitors"
                  value={formData.NoOfVisitors}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>
          </>
        )}

        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Visit Date</Form.Label>
            <Form.Control
              type="date"
              name="VisitDate"
              value={formData.VisitDate}
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
              name="Purpose"
              value={formData.Purpose}
              onChange={handleChange}
              required
            />
          </Form.Group>
        </Col>

        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Classification</Form.Label>
            <Form.Select
              name="Classification"
              value={formData.Classification}
              onChange={handleChange}
              required
            >
              <option value="">-- Select Classification --</option>
              {classifications.map((item, index) => (
                <option key={index} value={item}>
                  {item}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      <Button variant="primary" type="submit">
        Submit
      </Button>
    </Form>
  );
};

export default VisitorForm;
