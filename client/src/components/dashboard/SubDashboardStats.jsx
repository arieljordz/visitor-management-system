import React, { useState, useEffect } from "react";
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

const SubDashboardStats = ({ user }) => {
  const [dashboardStats, setDashboardStats] = useState(null);

  useEffect(() => {
    if (user?.userId) {
      fetchDashboardStats();
    }
  }, [user]);

  const fetchDashboardStats = async () => {
    try {
      const data = await getDashboardStats();
      setDashboardStats(data);
    } catch (err) {
      console.error("Failed to fetch dashboard stats:", err);
    }
  };

  if (!dashboardStats) return null;

  const {
    qrCodeStats = { total: 0, active: 0, used: 0 },
    visitorCount = 0,
  } = dashboardStats;

  // Configuration for boxes
  const statBoxes = [
    {
      count: qrCodeStats.total,
      label: "Generated QR Codes",
      icon: "fa-qrcode",
      bg: "bg-info",
    },
    {
      count: qrCodeStats.active,
      label: "Active QR Codes",
      icon: "fa-check-circle",
      bg: "bg-success",
    },
    {
      count: qrCodeStats.used,
      label: "Used QR Codes",
      icon: "fa-history",
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

export default SubDashboardStats;
