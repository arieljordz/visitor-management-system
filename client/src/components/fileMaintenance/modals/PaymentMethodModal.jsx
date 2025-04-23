import React, { useEffect, useState } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import { toast } from "react-toastify";
import {
  updatePaymentMethod,
  createPaymentMethod,
} from "../../../services/paymentMethodService.js";

const PaymentMethodModal = ({ show, onHide, selectedRow, refreshList }) => {
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

    const isUpdate = Boolean(selectedRow?._id);
    const successMessage = isUpdate
      ? "Payment method updated successfully."
      : "Payment method created successfully.";

    try {
      if (isUpdate) {
        await updatePaymentMethod(selectedRow._id, formData);
      } else {
        await createPaymentMethod(formData);
      }

      toast.success(successMessage);
      refreshList();
      onHide();
    } catch (error) {
      console.error("Submit error:", error);
      toast.error("Error saving payment method.");
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="md" backdrop="static" centered>
      <Modal.Header closeButton>
        <Modal.Title>{selectedRow ? "Edit" : "Add"} Payment Method</Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Row>
            <Col md={12}>
              <Form.Group className="mb-3">
                <Form.Label>Method</Form.Label>
                <Form.Select
                  name="method"
                  value={formData.method}
                  onChange={handleChange}
                  className="form-control"
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

export default PaymentMethodModal;
