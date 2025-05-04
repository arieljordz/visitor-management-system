import React, { useEffect, useState } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import { toast } from "react-toastify";
import { updateFee, createFee } from "../../../services/feeService.js";

const FeeModal = ({ show, onHide, selectedRow, refreshList }) => {
  const [formData, setFormData] = useState({
    description: "",
    fee: 0,
    feeCode: "",
    status: "active",
  });

  useEffect(() => {
    if (selectedRow) {
      setFormData({
        description: selectedRow.description || "",
        fee: selectedRow.fee || 0,
        feeCode: selectedRow.feeCode || 0,
        status: selectedRow.status || "active",
      });
    } else {
      resetForm();
    }
  }, [selectedRow]);

  const resetForm = () => {
    setFormData({
      description: "",
      fee: 0,
      feeCode: "",
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
        await updateFee(selectedRow._id, formData);
        toast.success("Fee updated successfully.");
      } else {
        await createFee(formData);
        toast.success("Fee created successfully.");
      }
      refreshList();
      onHide();
      resetForm();
    } catch (error) {
      console.error("Submit Error:", error);
      toast.error("Failed to save fee. Please try again.");
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="md" backdrop="static" centered>
      {/* Header */}
      <div className="modal-header">
        <h5 className="modal-title fw-bold">
          {selectedRow ? "Edit" : "Add"} Fee
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
                <Form.Label>Fee Description</Form.Label>
                <Form.Control
                  type="text"
                  name="description"
                  placeholder="Enter description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6} className="mb-2">
              <Form.Group>
                <Form.Label>Fee Code</Form.Label>
                <Form.Control
                  type="text"
                  name="feeCode"
                  placeholder="Enter code"
                  value={formData.feeCode}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6} className="mb-2">
              <Form.Group>
                <Form.Label>Fee Amount</Form.Label>
                <Form.Control
                  type="number"
                  name="fee"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  value={formData.fee}
                  onChange={handleChange}
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
                    id="status-switch"
                    name="status"
                    checked={formData.status === "active"}
                    onChange={handleChange}
                  />
                  <label
                    className="custom-control-label"
                    htmlFor="status-switch"
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

export default FeeModal;
