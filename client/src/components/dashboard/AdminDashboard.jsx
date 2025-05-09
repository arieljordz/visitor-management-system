import React, { useState, useEffect } from "react";
import { Spinner } from "react-bootstrap";
import Navpath from "../../components/common/Navpath";
import AdminDashboardStats from "./AdminDashboardStats";

const AdminDashboard = ({ user }) => {
  const [dashboardLoading, setDashboardLoading] = useState(false);

  return (
    <div className="content-wrapper">
      {/* Content Header */}
      <Navpath levelOne="Dashboard" levelTwo="Home" levelThree="Dashboard" />

      {/* Main content */}
      <section className="content">
        <div className="container-fluid">
          {dashboardLoading ? (
            <div className="text-center my-4">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>
          ) : (
            <AdminDashboardStats user={user} />
          )}
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;
