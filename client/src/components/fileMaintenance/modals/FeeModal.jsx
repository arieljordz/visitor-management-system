import React, { useEffect, useState } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import axios from "axios";
import { toast } from "react-toastify";

const API_URL = import.meta.env.VITE_BASE_API_URL;

const FeeModal = ({ show, onHide, selectedRow, refreshList }) => {
  const [formData, setFormData] = useState({
    description: "",
    fee: 0,
    active: true,
  });

  useEffect(() => {
    if (selectedRow) {
      setFormData({
        description: selectedRow.description ?? "",
        fee: selectedRow.fee ?? 0,
        active: selectedRow.active ?? true,
      });
    } else {
      setFormData({
        description: "",
        fee: 0,
        active: true,
      });
    }
  }, [selectedRow]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (selectedRow?._id) {
        // Update
        await axios.put(
          `${API_URL}/api/update-fee/${selectedRow._id}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          }
        );
        toast.success("Fee updated successfully.");
      } else {
        // Create
        await axios.post(`${API_URL}/api/create-fee`, formData, {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });
        toast.success("Fee created successfully.");
      }

      refreshList();
      onHide();
    } catch (error) {
      toast.error("Error saving fee.");
      console.error("Submit error:", error);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="md" backdrop="static" centered>
      <Modal.Header closeButton>
        <Modal.Title>{selectedRow ? "Edit" : "Add"} Fee</Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Row>
            <Col md={12}>
              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>

            <Col md={12}>
              <Form.Group className="mb-3">
                <Form.Label>Amount Fee</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  min="0"
                  name="fee"
                  value={formData.fee}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>

            <Col md={12}>
              <Form.Group className="mb-3">
                <Form.Check
                  type="checkbox"
                  label="Active"
                  name="active"
                  checked={formData.active}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            {selectedRow ? "Update" : "Save"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default FeeModal;
