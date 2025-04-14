import { useState } from "react";
import { Button, Form, Alert, Card } from "react-bootstrap";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";

const API_URL = import.meta.env.VITE_BASE_API_URL;

const LoginForm = ({ setUser, setBalance, message, setMessage }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");

  const navigate = useNavigate();

  // Manual login function
  const login = async () => {
    try {
      const res = await axios.post(`${API_URL}/api/login`, {
        email: username,
        password,
      });

      // Save user data in localStorage
      const userData = {
        name: res.data.name,
        email: res.data.email,
        picture: res.data.picture,
        userId: res.data.userId,
      };

      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      setMessage("Login successful");

      navigate("/dashboard");
    } catch (error) {
      setMessage("Login failed");
    }
  };

  // Manual registration function
  const register = async () => {
    if (password !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    try {
      const res = await axios.post(`${API_URL}/api/register`, {
        email: username,
        password,
        name: null,
        picture: null,
      });

      // Save user data in localStorage
      const userData = {
        name: res.data.name,
        email: res.data.email,
        picture: res.data.picture,
        userId: res.data.userId,
      };

      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      setMessage("Registration successful");

      navigate("/dashboard");
    } catch (error) {
      setMessage("Registration failed");
    }
  };

  // Google login success
  const handleGoogleLoginSuccess = async (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential);
      const userData = {
        name: decoded.name,
        password: decoded.name,
        email: decoded.email,
        picture: decoded.picture,
      };
  
      // Check if the user exists in the database
      const res = await axios.post(`${API_URL}/api/google-login`, userData);
  
      // Save user data in localStorage
      localStorage.setItem("user", JSON.stringify(res.data));
      setUser(res.data);
      setMessage("Google login successful");
  
      navigate("/dashboard");
    } catch (error) {
      setMessage("Google login failed");
    }
  };
  

  // Google login failure
  const handleGoogleLoginError = () => {
    setMessage("Google login failed");
  };

  return (
    <div className="d-flex justify-content-center align-items-center mt-5">
      <Card className="p-4" style={{ width: "100%", maxWidth: "400px" }}>
        <Form>
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

          <Button
            className="w-100"
            variant="primary"
            onClick={isRegistering ? register : login}
          >
            {isRegistering ? "Register" : "Login"}
          </Button>

          <div className="mt-3 text-center">
            {isRegistering ? (
              <span>
                Already have an account?{" "}
                <Button variant="link" onClick={() => setIsRegistering(false)}>
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

          {/* Google Login Button */}
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
  );
};

export default LoginForm;
