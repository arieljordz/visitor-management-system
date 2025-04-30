import React, { useEffect, useState } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import { toast } from "react-toastify";
import {
  updatePaymentMethod,
  createPaymentMethod,
} from "../../../services/paymentMethodService.js";

const PaymentMethodModal = ({ show, onHide, selectedRow, refreshList }) => {
  const [formData, setFormData] = useState({
    description: "",
    status: "active",
  });

  useEffect(() => {
    if (selectedRow) {
      setFormData({
        description: selectedRow.description || "",
        status: selectedRow.status || "active",
      });
    } else {
      resetForm();
    }
  }, [selectedRow]);

  const resetForm = () => {
    setFormData({
      description: "",
      status: "active",
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (checked ? "active" : "inactive") : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isUpdate = Boolean(selectedRow?._id);

    try {
      if (isUpdate) {
        await updatePaymentMethod(selectedRow._id, formData);
        toast.success("Payment method updated successfully.");
      } else {
        await createPaymentMethod(formData);
        toast.success("Payment method created successfully.");
      }

      refreshList();
      onHide();
      resetForm();
    } catch (error) {
      console.error("Submit error:", error);
      toast.error("Error saving payment method.");
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="md" backdrop="static" centered>
      {/* Header */}
      <div className="modal-header">
        <h5 className="modal-title fw-bold">
          {selectedRow ? "Edit" : "Add"} Payment Method
        </h5>
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
          <Row className="g-3">
            <Col md={12} className="mb-2">
              <Form.Group>
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

            <Col md={12}>
              <div className="form-group">
                <div className="custom-control custom-switch">
                  <input
                    type="checkbox"
                    className="custom-control-input"
                    id="payment-status-switch"
                    name="status"
                    checked={formData.status === "active"}
                    onChange={handleChange}
                  />
                  <label
                    className="custom-control-label"
                    htmlFor="payment-status-switch"
                  >
                    {formData.status === "active" ? "Active" : "Inactive"}
                  </label>
                </div>
              </div>
            </Col>
          </Row>
        </div>

        {/* Footer */}
        <div className="modal-footer justify-content-end">
          <Button variant="secondary" onClick={onHide}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            {selectedRow ? "Update" : "Save"}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default PaymentMethodModal;
