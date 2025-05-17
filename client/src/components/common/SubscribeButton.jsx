import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "react-bootstrap";
import { FaCreditCard } from "react-icons/fa";

const SubscribeButton = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/subscribe");
  };

  return (
    <Button
      type="button"
      variant="primary"
      className="subscribe-floating-btn"
      onClick={handleClick}
    >
      <i className="fas fa-credit-card mr-2"></i>
      Subscribe Now
    </Button>
  );
};

export default SubscribeButton;
