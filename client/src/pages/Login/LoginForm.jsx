import { useState } from "react";
import { Form, Button, Alert } from "react-bootstrap";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useSpinner } from "../../context/SpinnerContext";
import { UserRoleEnum, PasswordEnum } from "../../enums/enums.js";

const API_URL = import.meta.env.VITE_BASE_API_URL;

const LoginForm = ({ setUser, setIsRegistering }) => {
  const { setLoading } = useSpinner();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const navigateByRole = (data) => {
    if (!data) return;

    setLoading(true);

    setTimeout(() => {
      setLoading(false);

      if (!data.verified) {
        navigate("/");
        return;
      }

      switch (data.role) {
        case UserRoleEnum.ADMIN:
          navigate("/dashboard");
          break;
        case UserRoleEnum.SUBSCRIBER:
          navigate("/dashboard");
          break;
        case UserRoleEnum.STAFF:
          navigate("/scan-qr");
          break;
        default:
          navigate("/dashboard");
      }
    }, 800);
  };

  const login = async () => {
    try {
      setLoading(true);

      const res = await axios.post(
        `${API_URL}/api/login-user`,
        {
          email: username,
          password,
        },
        { withCredentials: true } // Important: allows cookie to be set by backend
      );

      localStorage.setItem("accessToken", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data));

      setUser(res.data);
      console.log("login user:", res.data);
      setMessage(
        res.data.verified ? "Login successful." : "Email not yet verified."
      );
      navigateByRole(res.data);
    } catch (error) {
      setMessage("Login failed");
      console.error("Login error:", error);
      setLoading(false);
    }
  };

  const handleGoogleLoginSuccess = async (credentialResponse) => {
    try {
      setLoading(true);

      const decoded = jwtDecode(credentialResponse.credential);

      const userData = {
        name: decoded.name,
        password: PasswordEnum.DEFAULT_PASS,
        email: decoded.email,
        picture: decoded.picture,
        role: UserRoleEnum.SUBSCRIBER,
        address: "N/A",
      };

      const res = await axios.post(
        `${API_URL}/api/google-login-user`,
        userData,
        { withCredentials: true } // allows refreshToken to be set in cookie
      );

      localStorage.setItem("accessToken", res.data?.token);
      localStorage.setItem("user", JSON.stringify(res.data));
      setUser(res.data);

      console.log("Google user:", res);
      setMessage(
        res.data?.verified
          ? "Google login successful."
          : "Google mail registration successful. Please verify it to your email."
      );

      navigateByRole(res.data);
    } catch (error) {
      console.error("Login error:", error);
      setMessage("Google login failed");
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    login();
  };

  return (
    <>
      <Form onSubmit={handleSubmit}>
        <h3 className="text-center mb-4">Login</h3>

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
            onSuccess={handleGoogleLoginSuccess}
            onError={() => setMessage("Google login failed")}
          />
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

export default LoginForm;
