import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_BASE_API_URL;

// Create the BalanceContext
export const BalanceContext = createContext();

// Custom hook to use BalanceContext
export const useBalance = () => useContext(BalanceContext);

// Provider Component
export const BalanceProvider = ({ children }) => {
  const [balance, setBalance] = useState(0.0);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState(null);

  const fetchBalance = async (userId) => {
    if (!userId) return;
    
    setIsFetching(true);
    try {
      const response = await axios.get(`${API_URL}/api/check-balance/${userId}`);
      const parsedBalance = parseFloat(response.data?.balance);
      const newBalance = isNaN(parsedBalance) ? 0.0 : parsedBalance;
      setBalance(newBalance);
      setError(null);
      return newBalance;
    } catch (err) {
      setError("Failed to fetch balance.");
      return balance;
    } finally {
      setIsFetching(false);
    }
  };

  return (
    <BalanceContext.Provider value={{ balance, isFetching, error, fetchBalance }}>
      {children}
    </BalanceContext.Provider>
  );
};
