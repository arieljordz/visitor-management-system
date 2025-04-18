import React, { useEffect, useState } from "react";
import axios from "axios";

const DisplayBalance = ({ userId, pollInterval = 30000 }) => {
  const [balance, setBalance] = useState(0.0);

  const fetchBalance = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_BASE_API_URL}/api/check-balance/${userId}`);
      const parsedBalance = parseFloat(res.data?.balance);
      setBalance(isNaN(parsedBalance) ? 0.0 : parsedBalance);
    } catch (error) {
      console.error("Balance fetch error:", error);
      setBalance(0.0);
    }
  };

  useEffect(() => {
    if (!userId) return;

    fetchBalance();
    const interval = setInterval(fetchBalance, pollInterval);
    return () => clearInterval(interval);
  }, [userId]);

  return (
    <span className="fw-bold me-3">
      💰 Current Balance:{" "}
      <span className="text-success">₱{balance.toFixed(2)}</span>
    </span>
  );
};

export default DisplayBalance;
