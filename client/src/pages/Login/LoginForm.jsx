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
    setTimeout(() => {
      setLoading(false);
      if (data.verified) {
        if (data.role === UserRoleEnum.ADMIN) navigate("/admin/dashboard");
        else if (data.role === UserRoleEnum.STAFF) navigate("/staff/scan-qr");
        else navigate("/dashboard");
      } else {
        navigate("/");
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

      const { accessToken, ...userData } = res.data;

      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("user", JSON.stringify(userData));

      setUser(userData);
      setMessage("Login successful");
      navigateByRole(userData);
    } catch (error) {
      setMessage("Login failed");
      console.error("Login error:", error.response);
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
        role: UserRoleEnum.CLIENT,
        address: "N/A",
      };

      const res = await axios.post(
        `${API_URL}/api/google-login-user`,
        userData,
        { withCredentials: true } // allows refreshToken to be set in cookie
      );

      const { accessToken, ...user } = res.data;

      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("user", JSON.stringify(user));
      setUser(user);

      setMessage(
        user.verified
          ? "Google login successful."
          : "Google mail registration successful. Please verify it to your email."
      );

      navigateByRole(user);
    } catch (error) {
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
