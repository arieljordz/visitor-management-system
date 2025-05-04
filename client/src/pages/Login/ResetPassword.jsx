import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Card, Form, Button, Alert } from "react-bootstrap";
import axios from "axios";
import { useSpinner } from "../../context/SpinnerContext";

const API_URL = import.meta.env.VITE_BASE_API_URL;

const ResetPassword = () => {
  const { setLoading } = useSpinner();
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleReset = async (e) => {
    e.preventDefault();
    setMessage("");

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/reset-password/${token}`, {
        password: password,
      });

      setMessage(res.data.message);
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      setMessage(
        err.response?.data?.message || "Something went wrong. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="mt-5">
      <div className="d-flex justify-content-center align-items-center mt-5">
        <Card className="p-4" style={{ width: "100%", maxWidth: "400px" }}>
          <h4 className="text-center mb-4">Reset Password</h4>
          <Form onSubmit={handleReset}>
            <Form.Group className="mb-3">
              <Form.Label>New Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Confirm Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </Form.Group>
            <Button type="submit" className="w-100" variant="primary">
              Reset Password
            </Button>
          </Form>
          {message && (
            <Alert variant="info" className="mt-3 text-center">
              {message}
            </Alert>
          )}
        </Card>
      </div>
    </Container>
  );
};

export default ResetPassword;
