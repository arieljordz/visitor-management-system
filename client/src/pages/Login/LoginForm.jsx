import { useState } from "react";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import { Form, Button, Alert } from "react-bootstrap";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../../context/AuthContext";
import { UserRoleEnum, PasswordEnum } from "../../enums/enums.js";

const LoginForm = ({ setIsRegistering }) => {
  const navigate = useNavigate();
  const { login, googleLogin } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(email, password, navigate);
    if (!result.success) {
      setMessage(result.message || "Login failed");
    }
  };

const handleGoogleSuccess = async ({ credential }) => {
  if (!credential) {
    setMessage("Google login failed: No credential provided");
    return;
  }

  try {
    const decoded = jwtDecode(credential);
    console.log("Google JWT decoded:", decoded);

    // Construct the user data expected by your backend
    const userPayload = {
    name: decoded.name,
    password: PasswordEnum.DEFAULT_PASS,
    email: decoded.email,
    picture: decoded.picture,
    role: UserRoleEnum.SUBSCRIBER,
    address: "N/A",
    };

    const result = await googleLogin(userPayload, navigate);
    console.log("result:", result);
    if (!result.success) {
      setMessage(result.message || "Google login failed");
    }
  } catch (error) {
    console.error("Error decoding Google credential:", error);
    setMessage("Google login failed: Invalid credential");
  }
};


  return (
    <>
      <Form onSubmit={handleSubmit}>
        <h3 className="text-center mb-4">Login</h3>

        <Form.Group className="mb-3">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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

        <Button type="submit" className="w-100" variant="primary">
          Login
        </Button>

        <div className="mt-3 text-center">
          Don't have an account?{" "}
          <Button variant="link" onClick={() => setIsRegistering(true)}>
            Register here
          </Button>
        </div>

        <div className="text-center my-3">
          <hr />
          <span>OR</span>
          <hr />
        </div>

        <div className="d-flex justify-content-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setMessage("Google login failed")}
          />
        </div>
      </Form>

      {message && (
        <Alert variant="danger" className="mt-3 text-center">
          {message}
        </Alert>
      )}
    </>
  );
};

export default LoginForm;
