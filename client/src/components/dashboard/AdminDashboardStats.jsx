import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { getDashboardStats } from "../../services/dashboardService.js";

const StatBox = ({ count, label, icon, bg }) => (
  <div className="col-lg-3 col-6">
    <div className={`small-box ${bg}`}>
      <div className="inner">
        <h3>{count}</h3>
        <p>{label}</p>
      </div>
      <div className="icon">
        <i className={`fas ${icon}`} />
      </div>
      <a href="#" className="small-box-footer">
        More info <i className="fas fa-arrow-circle-right" />
      </a>
    </div>
  </div>
);

const AdminDashboardStats = () => {
  const { user } = useAuth();
  const [dashboardStats, setDashboardStats] = useState(null);

  useEffect(() => {
    if (user?.userId) {
      fetchDashboardStats();
    }
  }, [user]);

  const fetchDashboardStats = async () => {
    try {
      const data = await getDashboardStats();
      // console.log("Fetch DashboardStats", data);
      setDashboardStats(data);
    } catch (err) {
      console.error("Failed to fetch dashboard stats:", err);
    }
  };

  if (!dashboardStats) return null;

  const {
    qrCodeStats = { total: 0 },
    clientCount = 0,
    visitorCount = 0,
    paymentStats = { verificationStatus: { pending: 0 } },
  } = dashboardStats;

  const statBoxes = [
    {
      count: clientCount,
      label: "Users",
      icon: "fa-users",
      bg: "bg-info",
    },
    {
      count: qrCodeStats.total,
      label: "Generated QR Codes",
      icon: "fa-qrcode",
      bg: "bg-success",
    },
    {
      count: paymentStats.verificationStatus?.pending || 0,
      label: "Pending Top-up",
      icon: "fa-clock",
      bg: "bg-warning",
    },
    {
      count: visitorCount,
      label: "Unique Visitors",
      icon: "fa-user-check",
      bg: "bg-danger",
    },
  ];

  return (
    <div className="row">
      {statBoxes.map((box, idx) => (
        <StatBox
          key={idx}
          count={box.count || 0}
          label={box.label}
          icon={box.icon}
          bg={box.bg}
        />
      ))}
    </div>
  );
};

export default AdminDashboardStats;
