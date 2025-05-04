import { useState } from "react";
import { Form, Row, Col, Button, Alert } from "react-bootstrap";
import axios from "axios";
import { UserRoleEnum } from "../../enums/enums.js";

const API_URL = import.meta.env.VITE_BASE_API_URL;

const RegisterForm = ({ setUser, setLoading, setIsRegistering }) => {
  const [message, setMessage] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    password: "",
    confirmPassword: "",
    address: "",
    verified: true,
  });

  const register = async () => {
    if (formData.password !== formData.confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(`${API_URL}/api/create-user`, {
        email: formData.email,
        name: formData.name,
        password: formData.password,
        picture: null,
        role: UserRoleEnum.CLIENT,
        address: formData.address,
        verified: true,
      });

      const { data } = res.data;
      const userData = {
        userId: data._id,
        email: data.email,
        name: data.name,
        picture: data.picture,
        role: data.role,
        address: data.address,
        verified: data.verified,
      };

      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      setMessage("Registration successful");
      setIsRegistering(false);
      setLoading(false);
    } catch (error) {
      const msg = error.response?.data?.message || "Registration failed";
      setMessage(msg);
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    register();
  };

  return (
    <>
      <Form onSubmit={handleSubmit}>
        <h3 className="text-center mb-4">Register</h3>
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter your email"
                required
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Fullname</Form.Label>
              <Form.Control
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter your fullname"
                required
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Enter your password"
                required
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Confirm Password</Form.Label>
              <Form.Control
                type="password"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                placeholder="confirm your password"
                required
              />
            </Form.Group>
          </Col>
          <Col md={12}>
            <Form.Group className="mb-3">
              <Form.Label>Address</Form.Label>
              <Form.Control
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Enter your address"
                required
              />
            </Form.Group>
          </Col>
        </Row>

        <Button type="submit" className="w-100" variant="primary">
          Register
        </Button>

        <div className="mt-3 text-center">
          Already have an account?{" "}
          <Button variant="link" onClick={() => setIsRegistering(false)}>
            Login here
          </Button>
        </div>
      </Form>

      {message && (
        <Alert variant="info" className="mt-3 text-center">
          {message}
        </Alert>
      )}
    </>
  );
};

export default RegisterForm;
