import React, { useEffect, useState } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import axios from "axios";
import { toast } from "react-toastify";
import { useTheme } from "../context/ThemeContext";

const API_URL = import.meta.env.VITE_BASE_API_URL;

const PaymentMethodModal = ({ show, onHide, selectedRow, refreshList }) => {
  const { darkMode } = useTheme();
  const modalClass = darkMode ? "bg-dark text-light" : "bg-white text-dark";

  const initialFormData = {
    method: "",
    accountName: "",
    accountNumber: "",
    bankName: "",
  };

  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    if (selectedRow) {
      setFormData({
        method: selectedRow.method || "",
        accountName: selectedRow.accountName || "",
        accountNumber: selectedRow.accountNumber || "",
        bankName: selectedRow.bankName || "",
      });
    } else {
      setFormData(initialFormData);
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
        await axios.put(`${API_URL}/api/update-payment-method/${selectedRow._id}`, formData);
        toast.success("Payment method updated successfully.");
      } else {
        // Create
        await axios.post(`${API_URL}/api/create-payment-method`, formData);
        toast.success("Payment method created successfully.");
      }

      refreshList();
      onHide();
    } catch (error) {
      toast.error("Error saving payment method.");
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
        <Modal.Title>{selectedRow ? "Edit" : "Add"} Payment Method</Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body className={modalClass}>
          <Row>
            <Col md={12}>
              <Form.Group className="mb-3">
                <Form.Label>Method</Form.Label>
                <Form.Select
                  name="method"
                  value={formData.method}
                  onChange={handleChange}
                  required
                >
                  <option value="">-- Select Method --</option>
                  <option value="GCash">GCash</option>
                  <option value="PayMaya">PayMaya</option>
                  <option value="Bank">Bank</option>
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={12}>
              <Form.Group className="mb-3">
                <Form.Label>Account Name</Form.Label>
                <Form.Control
                  type="text"
                  name="accountName"
                  value={formData.accountName}
                  onChange={handleChange}
                  placeholder="Enter account name"
                  required
                />
              </Form.Group>
            </Col>

            <Col md={12}>
              <Form.Group className="mb-3">
                <Form.Label>Account Number</Form.Label>
                <Form.Control
                  type="text"
                  name="accountNumber"
                  value={formData.accountNumber}
                  onChange={handleChange}
                  placeholder="Enter account number"
                  required
                />
              </Form.Group>
            </Col>

            {formData.method === "Bank" && (
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Bank Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="bankName"
                    value={formData.bankName}
                    onChange={handleChange}
                    placeholder="Enter bank name"
                    required
                  />
                </Form.Group>
              </Col>
            )}
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

export default PaymentMethodModal;
