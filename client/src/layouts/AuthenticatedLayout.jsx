import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import Sidebar from "../components/common/Sidebar";
import Footer from "../components/common/Footer";
import MainRoutes from "../routes/MainRoutes";
import { useAuth } from "../context/AuthContext";
import { FeatureFlagProvider } from "../context/FeatureFlagContext";

const AuthenticatedLayout = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/");
    }
  }, [user, navigate]);

  return (
    <div className="wrapper">
      <FeatureFlagProvider>
        <Navbar />
        <Sidebar />
        <MainRoutes />
        <Footer />
      </FeatureFlagProvider>
    </div>
  );
};

export default AuthenticatedLayout;
