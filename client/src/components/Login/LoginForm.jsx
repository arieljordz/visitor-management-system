import { useState } from "react";
import { Button, Form, Alert, Card, Container } from "react-bootstrap";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";

const API_URL = import.meta.env.VITE_BASE_API_URL;

const LoginForm = ({ setUser, setLoading }) => {
  const [message, setMessage] = useState("");
  const [username, setUsername] = useState("");
  const [fullname, setFullname] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");

  const navigate = useNavigate();

  const navigateByRole = (role) => {
    setTimeout(() => {
      setLoading(false); // ✅ Hide spinner after navigation
      if (role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/dashboard");
      }
    }, 800);
  };

  const login = async () => {
    try {
      setLoading(true);
      const res = await axios.post(`${API_URL}/api/login`, {
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

      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      setMessage("Login successful");
      navigateByRole(userData.role);
    } catch (error) {
      setMessage("Login failed");
      setLoading(false);
    }
  };

  const register = async () => {
    if (password !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(`${API_URL}/api/register`, {
        email: username,
        name: fullname,
        password,
        picture: null,
        role: "client",
      });

      const userData = {
        userId: res.data.userId,
        email: res.data.email,
        name: res.data.name,
        picture: res.data.picture,
        role: res.data.role,
      };

      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      setMessage("Registration successful");
      navigateByRole(userData.role);
    } catch (error) {
      setMessage("Registration failed");
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
      };

      const res = await axios.post(`${API_URL}/api/google-login`, userData);

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
      <div className="d-flex justify-content-center">
        <div className="d-flex justify-content-center align-items-center mt-5">
          <Card className="p-4" style={{ width: "100%", maxWidth: "400px" }}>
            <Form onSubmit={handleSubmit}>
              <h3 className="text-center mb-4">
                {isRegistering ? "Register" : "Login"}
              </h3>

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

              {isRegistering && (
                <Form.Group className="mb-3">
                  <Form.Label>Fullname</Form.Label>
                  <Form.Control
                    type="text"
                    value={fullname}
                    onChange={(e) => setFullname(e.target.value)}
                    placeholder="Enter your name"
                    required
                  />
                </Form.Group>
              )}

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

              {isRegistering && (
                <Form.Group className="mb-3">
                  <Form.Label>Confirm Password</Form.Label>
                  <Form.Control
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    required
                  />
                </Form.Group>
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
                    <Button
                      variant="link"
                      onClick={() => setIsRegistering(true)}
                    >
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
              <Alert variant="info" className="mt-3">
                {message}
              </Alert>
            )}
          </Card>
        </div>
      </div>
    </Container>
  );
};

export default LoginForm;
