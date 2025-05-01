import { useState } from "react";
import { Container, Card, Form, Button, Alert } from "react-bootstrap";
import axios from "axios";

const API_URL = import.meta.env.VITE_BASE_API_URL;

const ForgotPassword = ({ setLoading }) => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/forgot-password`, { email });
      setMessage(res.data.message || "Password reset instructions sent.");
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to send reset email.";
      setMessage(msg);
    } finally {
        setLoading(false); 
      }
  };

  return (
    <Container className="mt-5">
      <div className="d-flex justify-content-center align-items-center mt-5">
        <Card className="p-4" style={{ width: "100%", maxWidth: "400px" }}>
          <h4 className="text-center mb-4">Forgot Password</h4>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Email Address</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter your registered email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Form.Group>
            <Button type="submit" className="w-100" variant="primary">
              Send Reset Link
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

export default ForgotPassword;
