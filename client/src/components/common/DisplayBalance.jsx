import React, { useEffect, useState } from "react";
import axios from "axios";
import socket from "../../utils/socket";

const API_URL = import.meta.env.VITE_BASE_API_URL;

const DisplayBalance = ({ user }) => {
  const [balance, setBalance] = useState(0.0);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState(null);

  const fetchBalance = async () => {
    setIsFetching(true);
    try {
      const { data } = await axios.get(
        `${API_URL}/api/check-balance/${user.userId}`
      );
      const parsedBalance = parseFloat(data?.balance);
      const safeBalance = isNaN(parsedBalance) ? 0.0 : parsedBalance;
      setBalance(safeBalance);
      setError(null);
    } catch (err) {
      setError("Failed to fetch balance.");
      setBalance(0.0);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    if (!user?.userId) return;

    fetchBalance();

    // 🔔 Listen for real-time balance updates
    const handleBalanceUpdate = ({ userId, newBalance }) => {
      if (userId === user.userId) {
        setBalance(newBalance);
      }
    };

    socket.on("balance-updated", handleBalanceUpdate);

    // Cleanup
    return () => {
      socket.off("balance-updated", handleBalanceUpdate);
    };
  }, []);

  if (error) {
    return <span className="text-danger">{error}</span>;
  }

  return (
    <>
      {user?.role === "client" && (
        <span
          className="fw-bold me-3 d-flex align-items-center gap-2"
          style={{ transition: "opacity 0.3s ease" }}
        >
          💰 Current Balance:
          <span className="text-success ml-2">₱{balance.toFixed(2)}</span>
          {isFetching && (
            <div
              className="spinner-border spinner-border-sm text-secondary"
              role="status"
            >
              <span className="visually-hidden">Refreshing...</span>
            </div>
          )}
        </span>
      )}
    </>
  );
};

export default DisplayBalance;
