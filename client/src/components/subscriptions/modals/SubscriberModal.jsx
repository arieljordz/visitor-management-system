import React, { useEffect, useState } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import { toast } from "react-toastify";
import { updateUser, createUser } from "../../../services/userService.js";
import { StatusEnum, UserRoleEnum } from "../../../enums/enums.js";

const SubscriberModal = ({ show, onHide, selectedRow, refreshList }) => {
  const initialFormData = {
    email: "",
    name: "",
    address: "",
    role: UserRoleEnum.CLIENT,
    status: StatusEnum.ACTIVE,
    classification: "",
    subscription: false,
  };

  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    if (selectedRow) {
      setFormData({
        email: selectedRow.email || "",
        name: selectedRow.name || "",
        address: selectedRow.address || "",
        role: selectedRow.role || UserRoleEnum.CLIENT,
        status: selectedRow.status || StatusEnum.ACTIVE,
        classification: selectedRow.classification || "",
        subscription: selectedRow.subscription || false,
      });
    } else {
      setFormData(initialFormData);
    }
  }, [selectedRow]);

  const resetForm = () => {
    setFormData({
      email: "",
      name: "",
      address: "",
      role: UserRoleEnum.CLIENT,
      status: StatusEnum.ACTIVE,
      classification: "",
      subscription: false,
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => {
      if (type === "checkbox") {
        if (name === "status") {
          return {
            ...prev,
            [name]: checked ? StatusEnum.ACTIVE : StatusEnum.INACTIVE,
          };
        } else if (name === "subscription") {
          return { ...prev, [name]: checked };
        }
      }

      return { ...prev, [name]: value };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isUpdate = Boolean(selectedRow?._id);

    try {
      if (isUpdate) {
        await updateUser(selectedRow._id, formData);
        toast.success("User updated successfully.");
      } else {
        await createUser(formData);
        toast.success("User created successfully.");
      }
      refreshList();
      onHide();
      resetForm();
    } catch (error) {
      console.error("Error saving user:", error);
      toast.error("Error saving user.");
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="md" backdrop="static" centered>
      {/* Header */}
      <div className="modal-header">
        <h5 className="modal-title fw-bold">
          {selectedRow ? "Edit" : "Add"} User
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
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter email"
                  required
                />
              </Form.Group>
            </Col>

            <Col md={12}>
              <Form.Group className="mb-3">
                <Form.Label>Full Name</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter full name"
                />
              </Form.Group>
            </Col>

            <Col md={12}>
              <Form.Group className="mb-3">
                <Form.Label>Address</Form.Label>
                <Form.Control
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter address"
                  required
                />
              </Form.Group>
            </Col>

            <Col md={12}>
              <Form.Group className="mb-3">
                <Form.Label>Role</Form.Label>
                <Form.Select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="form-control"
                  required
                >
                  <option value="client">Client</option>
                  <option value="admin">Admin</option>
                  <option value="staff">Staff</option>
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={12}>
              <Form.Group className="mb-3">
                <Form.Label>Classification</Form.Label>
                <Form.Control
                  type="text"
                  name="classification"
                  value={formData.classification}
                  onChange={handleChange}
                  placeholder="Enter classification"
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
                    id="subscription-switch"
                    name="subscription"
                    checked={formData.subscription === true}
                    onChange={handleChange}
                  />
                  <label
                    className="custom-control-label"
                    htmlFor="subscription-switch"
                  >
                    {formData.subscription === true
                      ? "Subscribed"
                      : "Unsubscribed"}
                  </label>
                </div>
              </div>
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

export default SubscriberModal;
