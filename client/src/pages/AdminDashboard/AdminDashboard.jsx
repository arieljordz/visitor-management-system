import React from "react";
import Navpath from "../../components/common/Navpath";
import AdminDashboardStats from "./AdminDashboardStats";

const AdminDashboard = ({ user, setUser }) => {
  return (
    <div className="content-wrapper">
      {/* Content Header */}
      <Navpath levelOne="Dashboard" levelTwo="Home" levelThree="Dashboard" />

      {/* Main content */}
      <section className="content">
        <div className="container-fluid">
         <AdminDashboardStats user={user}/>
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;
