import React, { createContext, useContext, useState, useEffect } from "react";
import { getDashboardStats } from "../services/dashboardService.js";
import { useAuth } from "./AuthContext.jsx";

const DashboardContext = createContext();

export const DashboardProvider = ({ children }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.userId) {
      fetchDashboardStats();
    }
  }, [user]);

  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      const data = await getDashboardStats();
      setStats(data?.stats || {});
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardContext.Provider value={{ stats, loading, refreshDashboard: fetchDashboardStats }}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => useContext(DashboardContext);
