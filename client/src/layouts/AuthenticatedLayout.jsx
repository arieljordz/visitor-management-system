import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import Sidebar from "../components/common/Sidebar";
import Footer from "../components/common/Footer";
import Spinner from "../components/common/Spinner";
import MainRoutes from "../routes/MainRoutes";
import { useAuth } from "../context/AuthContext";
import { FeatureFlagProvider } from "../context/FeatureFlagContext";
import { useSpinner } from "../context/SpinnerContext";

const AuthenticatedLayout = () => {
  const { user } = useAuth();
  const { loading } = useSpinner();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/");
    }
  }, [user, navigate]);

  if (loading) return <Spinner />;

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
