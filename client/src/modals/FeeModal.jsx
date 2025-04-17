import React, { useEffect, useState } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import axios from "axios";
import { toast } from "react-toastify";
import { useTheme } from "../context/ThemeContext";

const API_URL = import.meta.env.VITE_BASE_API_URL;

const FeeModal = ({ show, onHide, selectedRow, refreshList }) => {
  const { darkMode } = useTheme();
  const modalClass = darkMode ? "bg-dark text-light" : "bg-white text-dark";

  const [formData, setFormData] = useState({
    fee: 0,
    active: true,
  });

  useEffect(() => {
    if (selectedRow) {
      setFormData({
        fee: selectedRow.fee ?? 0,
        active: selectedRow.active ?? true,
      });
    } else {
      setFormData({
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
          formData
        );
        toast.success("Fee updated successfully.");
      } else {
        // Create
        await axios.post(`${API_URL}/api/create-fee`, formData);
        toast.success("Fee created successfully.");
      }

      refreshList();
      onHide();
    } catch (error) {
      toast.error("Error saving classification.");
      console.error("Submit error:", error);
    }
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="md"
      backdrop="static"
      centered
      contentClassName={modalClass}
    >
      <Modal.Header closeButton className={modalClass}>
        <Modal.Title>{selectedRow ? "Edit" : "Add"} Fee</Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body className={modalClass}>
          <Row>
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

        <Modal.Footer className={modalClass}>
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
