import React, { useEffect, useState } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import { toast } from "react-toastify";
import {
  updateDepartment,
  createDepartment,
} from "../../../services/departmentService.js";

const DepartmentModal = ({ show, onHide, selectedRow, refreshList }) => {
  const initialFormData = {
    description: "",
    status: "active",
  };

  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    if (selectedRow) {
      setFormData({
        description: selectedRow.description || "",
        status: selectedRow.status || "active",
      });
    } else {
      setFormData(initialFormData);
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
    if (type === "checkbox" && name === "status") {
      setFormData((prev) => ({
        ...prev,
        status: checked ? "active" : "inactive",
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isUpdate = Boolean(selectedRow?._id);

    try {
      if (isUpdate) {
        await updateDepartment(selectedRow._id, formData);
        toast.success("Department updated successfully.");
      } else {
        await createDepartment(formData);
        toast.success("Department created successfully.");
      }

      refreshList();
      onHide();
      resetForm();
    } catch (error) {
      console.error("Submit error:", error);
      toast.error("Error saving Department.");
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="md" backdrop="static" centered>
      {/* Header */}
      <div className="modal-header">
        <h5 className="modal-title fw-bold">
          {selectedRow ? "Edit" : "Add"} Department
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

export default DepartmentModal;
