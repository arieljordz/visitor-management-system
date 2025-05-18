import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import Sidebar from "../components/common/Sidebar";
import Footer from "../components/common/Footer";
import MainRoutes from "../routes/MainRoutes";
import { useAuth } from "../context/AuthContext";
import { FeatureFlagProvider } from "../context/FeatureFlagContext";
import { UserRoleEnum } from "../enums/enums.js";
import SubscribeButton from "../components/common/SubscribeButton";
import { DashboardProvider } from "../context/DashboardContext.jsx";

const AuthenticatedLayout = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/");
    }
  }, [user, navigate]);

  const showSubscribeButton = () => {
    if (!user) return false;
    const { role, subscription } = user;

    // Hide button for admin, staff, or subscribed users
    if (
      role === UserRoleEnum.ADMIN ||
      role === UserRoleEnum.STAFF ||
      (role === UserRoleEnum.SUBSCRIBER && subscription)
    ) {
      return false;
    }

    return true;
  };

  return (
    <div className="wrapper">
      <DashboardProvider>
        <FeatureFlagProvider>
          <Navbar />
          <Sidebar />
          <MainRoutes />
          {showSubscribeButton() && <SubscribeButton />}
          <Footer />
        </FeatureFlagProvider>
      </DashboardProvider>
    </div>
  );
};

export default AuthenticatedLayout;
