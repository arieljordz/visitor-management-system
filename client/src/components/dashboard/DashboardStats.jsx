import React from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { UserRoleEnum } from "../../enums/enums.js";
import { useDashboard } from "../../context/DashboardContext.jsx";

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

const DashboardStats = () => {
  const { user } = useAuth();
  const { stats, loading } = useDashboard();

  if (loading || !stats) return null;

  const isAdmin = user?.role === UserRoleEnum.ADMIN;

  const statBoxes = isAdmin
    ? [
        { count: stats.subscriberCount || 0, label: "Subscribers", icon: "fa-users", bg: "bg-info" },
        { count: stats.totalQRCodes || 0, label: "Generated QR Codes", icon: "fa-qrcode", bg: "bg-success" },
        { count: stats.pendingSubscriptions || 0, label: "Pending Verifications", icon: "fa-clock", bg: "bg-warning" },
        { count: stats.totalVisitors || 0, label: "Total Visitors", icon: "fa-user-check", bg: "bg-danger" },
      ]
    : [
        { count: stats.totalQRCodes || 0, label: "Generated QR Codes", icon: "fa-qrcode", bg: "bg-success" },
        { count: stats.activeQRCodes || 0, label: "Active QR Codes", icon: "fa-bolt", bg: "bg-primary" },
        { count: stats.expiredQRCodes || 0, label: "Expired QR Codes", icon: "fa-clock", bg: "bg-secondary" },
        { count: stats.visitorCount || 0, label: "Your Visitors", icon: "fa-user-friends", bg: "bg-danger" },
      ];

  return (
    <div className="row">
      {statBoxes.map((box, idx) => (
        <StatBox key={idx} count={box.count} label={box.label} icon={box.icon} bg={box.bg} />
      ))}
    </div>
  );
};

export default DashboardStats;
