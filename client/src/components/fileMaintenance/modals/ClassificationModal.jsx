import React, { useEffect, useState } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import axios from "axios";
import { toast } from "react-toastify";

const API_URL = import.meta.env.VITE_BASE_API_URL;

const ClassificationModal = ({ show, onHide, selectedRow, refreshList }) => {
  const [formData, setFormData] = useState({ description: "" });

  useEffect(() => {
    if (selectedRow) {
      setFormData({ description: selectedRow.description || "" });
    } else {
      setFormData({ description: "" });
    }
  }, [selectedRow]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (selectedRow?._id) {
        // Update
        await axios.put(
          `${API_URL}/api/update-classification/${selectedRow._id}`,
          formData
        );
        toast.success("Classification updated successfully.");
      } else {
        // Create
        await axios.post(`${API_URL}/api/create-classification`, formData);
        toast.success("Classification created successfully.");
      }

      refreshList();
      onHide();
    } catch (error) {
      toast.error("Error saving classification.");
      console.error("Submit error:", error);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="md" backdrop="static" centered>
      <Modal.Header closeButton>
        <Modal.Title>{selectedRow ? "Edit" : "Add"} Classification</Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Row>
            <Col md={12}>
              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter description"
                  required
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

export default ClassificationModal;
