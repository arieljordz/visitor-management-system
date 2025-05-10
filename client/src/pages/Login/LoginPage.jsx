import { useState } from "react";
import { Card, Container } from "react-bootstrap";
import { Link } from "react-router-dom";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

const LoginPage = () => {
  const [isRegistering, setIsRegistering] = useState(false);

  return (
    <Container className="mt-5">
      <div className="d-flex justify-content-center align-items-center mt-5">
        <Card
          className="p-4"
          style={{ width: "100%", maxWidth: isRegistering ? "700px" : "400px" }}
        >
          {isRegistering ? (
            <RegisterForm setIsRegistering={setIsRegistering} />
          ) : (
            <>
              <LoginForm setIsRegistering={setIsRegistering} />
              <div className="text-center mt-2">
                <Link to="/forgot-password">Forgot Password?</Link>
              </div>
            </>
          )}
        </Card>
      </div>
    </Container>
  );
};

export default LoginPage;
