import { useState } from "react";
import { Form, Row, Col, Button, Alert } from "react-bootstrap";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { useSpinner } from "../../context/SpinnerContext";
import { UserRoleEnum, StatusEnum } from "../../enums/enums.js";

const API_URL = import.meta.env.VITE_BASE_API_URL;

const RegisterForm = ({ setIsRegistering }) => {
  const { setUser } = useAuth();
  const { setLoading } = useSpinner();
  const [message, setMessage] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    password: "",
    confirmPassword: "",
    address: "",
    classification: "",
    subscription: true,
  });

  const register = async () => {
    if (formData.password !== formData.confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      // Send registration request to backend
      const res = await axios.post(`${API_URL}/api/create-user`, {
        email: formData.email,
        name: formData.name,
        password: formData.password,
        picture: null,
        role: UserRoleEnum.SUBSCRIBER,
        address: formData.address,
        classification: formData.classification,
        subscription: formData.subscription,
        verified: false,
        status: StatusEnum.ACTIVE,
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
        classification: data.classification,
        subscription: data.subscription,
      };

      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      setMessage("Registration successful");

      // Clear form after submission
      setFormData({
        email: "",
        name: "",
        password: "",
        confirmPassword: "",
        address: "",
        classification: "",
        subscription: true,
      });

      setLoading(false);
    } catch (error) {
      console.error("Registration error:", error.response);
      setMessage(error?.response?.data?.message);
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
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
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
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
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
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
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
                placeholder="Confirm your password"
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
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                placeholder="Enter your address"
                required
              />
            </Form.Group>
          </Col>
          <Col md={12}>
            <Form.Group className="mb-3">
              <Form.Label>Classification</Form.Label>
              <Form.Control
                type="text"
                value={formData.classification}
                onChange={(e) =>
                  setFormData({ ...formData, classification: e.target.value })
                }
                placeholder="Enter your classification"
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
