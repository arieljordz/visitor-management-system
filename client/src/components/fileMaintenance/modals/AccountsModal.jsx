import React, { useEffect, useState } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import axios from "axios";
import { toast } from "react-toastify";

const API_URL = import.meta.env.VITE_BASE_API_URL;

const AccountsModal = ({ show, onHide, selectedRow, refreshList }) => {
  const initialFormData = {
    email: "",
    name: "",
    address: "",
    role: "client", // Default role is 'client'
  };

  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    if (selectedRow) {
      setFormData({
        email: selectedRow.email || "",
        name: selectedRow.name || "",
        address: selectedRow.address || "",
        role: selectedRow.role || "client",
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
        await axios.put(
          `${API_URL}/api/update-user/${selectedRow._id}`,
          formData
        );
        toast.success("User updated successfully.");
      } else {
        // Create
        await axios.post(`${API_URL}/api/create-user`, formData);
        toast.success("User created successfully.");
      }

      refreshList();
      onHide();
    } catch (error) {
      toast.error("Error saving user.");
      console.error("Submit error:", error);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="md" backdrop="static" centered>
      <Modal.Header closeButton>
        <Modal.Title>{selectedRow ? "Edit" : "Add"} User</Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body>
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
                  required
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

export default AccountsModal;
