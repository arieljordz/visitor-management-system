import React, { useEffect, useState } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import { toast } from "react-toastify";
import {
  updatePaymentAccount,
  createPaymentAccount,
} from "../../../services/paymentAccountService.js";
import { getActivePaymentMethods } from "../../../services/paymentMethodService.js";

const PaymentAccountModal = ({ show, onHide, selectedRow, refreshList }) => {
  const initialFormData = {
    method: "",
    accountName: "",
    accountNumber: "",
    bankName: "",
    status: "active",
  };

  const [formData, setFormData] = useState(initialFormData);
  const [paymentMethods, setPaymentMethods] = useState([]);

  useEffect(() => {
    if (selectedRow) {
      setFormData({
        method: selectedRow.method || "",
        accountName: selectedRow.accountName || "",
        accountNumber: selectedRow.accountNumber || "",
        bankName: selectedRow.bankName || "",
        status: selectedRow.status || "active",
      });
    } else {
      setFormData(initialFormData);
    }
  }, [selectedRow]);

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      const data = await getActivePaymentMethods();
      setPaymentMethods(data || []);
    } catch (err) {
      console.error("Error fetching PaymentMethods:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "status") {
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

    // Bank validation
    if (formData.method.toLowerCase() === "bank" && !formData.bankName.trim()) {
      toast.error("Bank name is required for Bank method.");
      return;
    }

    try {
      if (selectedRow?._id) {
        await updatePaymentAccount(selectedRow._id, formData);
        toast.success("Payment account updated successfully.");
      } else {
        await createPaymentAccount(formData);
        toast.success("Payment account created successfully.");
      }

      refreshList();
      onHide();
    } catch (error) {
      console.error("Submit error:", error);
      toast.error("Error saving payment account.");
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="md" backdrop="static" centered>
      {/* Header */}
      <div className="modal-header">
        <h5 className="modal-title fw-bold">
          {selectedRow ? "Edit" : "Add"} Payment Account
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
            <Col md={12} className="mb-2">
              <Form.Group>
                <Form.Label>Method</Form.Label>
                <Form.Select
                  name="method"
                  value={formData.method}
                  onChange={handleChange}
                  className="form-control"
                  required
                >
                  <option value="">-- Select Method --</option>
                  {paymentMethods.map((item, index) => (
                    <option key={index} value={item.description}>
                      {item.description}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={12} className="mb-2">
              <Form.Group>
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

            <Col md={12} className="mb-2">
              <Form.Group>
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

            {formData.method.toLowerCase() === "bank" && (
              <Col md={12} className="mb-2">
                <Form.Group>
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

export default PaymentAccountModal;
