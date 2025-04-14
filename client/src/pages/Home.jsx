import { useState } from "react";
import { Container } from "react-bootstrap";
import LoginForm from "../components/LoginForm";

const Home = ({ setUser, user }) => {
  const [balance, setBalance] = useState(null);
  const [qrCode, setQrCode] = useState(null);
  const [message, setMessage] = useState("");

  return (
    <Container className="mt-5">
      {/* If no user is logged in, display LoginForm centered */}
      {!user ? (
        <div className="d-flex justify-content-center">
          <LoginForm
            setUser={setUser}
            setBalance={setBalance}
            message={message}
            setMessage={setMessage}
          />
        </div>
      ) : (
        // If user is logged in, redirect to /dashboard
        <></>
      )}
    </Container>
  );
};

export default Home;
