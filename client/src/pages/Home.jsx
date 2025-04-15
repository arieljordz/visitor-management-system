import { useState } from "react";
import { Container } from "react-bootstrap";
import LoginForm from "../components/LoginForm";

const Home = ({ setUser, user }) => {
  const [balance, setBalance] = useState(null);
  const [qrCode, setQrCode] = useState(null);
  const [message, setMessage] = useState("");

  return (
    <Container className="mt-5">
         <div className="d-flex justify-content-center">
          <LoginForm
            setUser={setUser}
            setBalance={setBalance}
            message={message}
            setMessage={setMessage}
          />
        </div>
    </Container>
  );
};

export default Home;
