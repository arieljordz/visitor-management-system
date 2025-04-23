import React, { useEffect, useState } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import { toast } from "react-toastify";
import { updateClassification, addClassification } from "../../../services/classificationService.js";

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

    const isUpdate = Boolean(selectedRow?._id);
    const successMessage = isUpdate
      ? "Classification updated successfully."
      : "Classification created successfully.";

    try {
      if (isUpdate) {
        await updateClassification(user.token, selectedRow._id, formData);
      } else {
        await addClassification(user.token, formData);
      }

      toast.success(successMessage);
      refreshList();
      onHide();
    } catch (error) {
      console.error("Submit error:", error);
      toast.error("Error saving classification.");
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
