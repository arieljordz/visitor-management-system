import { useState } from "react";
import {
  Button,
  Form,
  Alert,
  Card,
  Container,
  Row,
  Col,
} from "react-bootstrap";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";

const API_URL = import.meta.env.VITE_BASE_API_URL;

const Login = ({ user, setUser, setLoading }) => {
  const [message, setMessage] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    password: "",
    confirmPassword: "",
    address: "",
  });

  const navigate = useNavigate();

  const navigateByRole = (role) => {
    setTimeout(() => {
      setLoading(false);
      if (role === "admin") {
        navigate("/admin/dashboard");
      } else if (role === "staff") {
        navigate("/staff/scan-qr");
      } else {
        navigate("/dashboard");
      }
    }, 800);
  };

  const login = async () => {
    try {
      setLoading(true);
      const res = await axios.post(`${API_URL}/api/login-user`, {
        email: username,
        password,
      });

      const userData = {
        userId: res.data.userId,
        email: res.data.email,
        name: res.data.name,
        picture: res.data.picture,
        role: res.data.role,
      };

      localStorage.setItem("user", JSON.stringify(res.data));
      setUser(res.data);
      setMessage("Login successful");
      navigateByRole(res.data.role);
    } catch (error) {
      setMessage("Login failed");
      setLoading(false);
    }
  };

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
        role: "client",
        address: formData.address,
      });

      const { data } = res.data; // Your API returns `{ message, data }`

      const userData = {
        userId: data._id,
        email: data.email,
        name: data.name,
        picture: data.picture,
        role: data.role,
        address: data.address,
      };

      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      setMessage("Registration successful");
      // navigateByRole(userData.role);
      setIsRegistering(false);
    } catch (error) {
      const msg = error.response?.data?.message || "Registration failed";
      setMessage(msg);
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    isRegistering ? register() : login();
  };

  const handleGoogleLoginSuccess = async (credentialResponse) => {
    try {
      setLoading(true);
      const decoded = jwtDecode(credentialResponse.credential);
      const userData = {
        name: decoded.name,
        password: decoded.name,
        email: decoded.email,
        picture: decoded.picture,
        role: "client",
        address: "N/A",
      };

      const res = await axios.post(`${API_URL}/api/google-login-user`, userData);

      localStorage.setItem("user", JSON.stringify(res.data));
      setUser(res.data);
      setMessage("Google login successful");
      navigateByRole(res.data.role);
    } catch (error) {
      setMessage("Google login failed");
      setLoading(false);
    }
  };

  const handleGoogleLoginError = () => {
    setMessage("Google login failed");
  };

  return (
    <Container className="mt-5">
      <div className="d-flex justify-content-center align-items-center mt-5">
        <Card
          className="p-4"
          style={{
            width: "100%",
            maxWidth: isRegistering ? "700px" : "400px",
          }}
        >
          <Form onSubmit={handleSubmit}>
            <h3 className="text-center mb-4">
              {isRegistering ? "Register" : "Login"}
            </h3>

            {!isRegistering ? (
              <>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your email"
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                  />
                </Form.Group>
              </>
            ) : (
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
                      placeholder="Enter your name"
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
                        setFormData({
                          ...formData,
                          confirmPassword: e.target.value,
                        })
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
              </Row>
            )}

            <Button type="submit" className="w-100" variant="primary">
              {isRegistering ? "Register" : "Login"}
            </Button>

            <div className="mt-3 text-center">
              {isRegistering ? (
                <span>
                  Already have an account?{" "}
                  <Button
                    variant="link"
                    onClick={() => setIsRegistering(false)}
                  >
                    Login here
                  </Button>
                </span>
              ) : (
                <span>
                  Don't have an account?{" "}
                  <Button variant="link" onClick={() => setIsRegistering(true)}>
                    Register here
                  </Button>
                </span>
              )}
            </div>

            <div className="text-center my-3">
              <hr />
              <span>OR</span>
              <hr />
            </div>

            <div className="d-flex justify-content-center">
              <GoogleLogin
                onSuccess={handleGoogleLoginSuccess}
                onError={handleGoogleLoginError}
              />
            </div>
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

export default Login;
