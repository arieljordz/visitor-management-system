import React, { useState, useEffect } from "react";
import Navpath from "../../components/common/Navpath";
import DashboardStats from "./DashboardStats";

const AdminDashboard = () => {
  return (
    <div className="content-wrapper">
      {/* Content Header */}
      <Navpath levelOne="Dashboard" levelTwo="Home" levelThree="Dashboard" />

      {/* Main content */}
      <section className="content">
        <div className="container-fluid">
          <DashboardStats />
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;
