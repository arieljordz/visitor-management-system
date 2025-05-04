import React, { useEffect, useState } from "react";
import socket from "../../utils/socket";
import { getBalance } from "../../services/balanceService.js";
import { UserRoleEnum } from "../../enums/enums.js";

const DisplayBalance = ({ user }) => {
  const [balance, setBalance] = useState(0.0);
  const [isFetching, setIsFetching] = useState(false);

  const fetchBalance = async () => {
    setIsFetching(true);
    try {
      const data = await getBalance(user.userId);
      // console.log("data:", data);
      const parsedBalance = parseFloat(data?.balance);
      const safeBalance = isNaN(parsedBalance) ? 0.0 : parsedBalance;
      setBalance(safeBalance);
    } catch (err) {
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
  }, [user]);

  return (
    <>
      {user?.role === UserRoleEnum.CLIENT && (
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
