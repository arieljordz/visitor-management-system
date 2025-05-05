import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import Sidebar from "../components/common/Sidebar";
import Footer from "../components/common/Footer";
import Spinner from "../components/common/Spinner";
import MainRoutes from "../routes/MainRoutes";
import { FeatureFlagProvider } from "../context/FeatureFlagContext";

const AuthenticatedLayout = ({ user, setUser, loading }) => {
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
        <Navbar user={user} />
        <Sidebar user={user} />
        <MainRoutes user={user} />
        <Footer />
      </FeatureFlagProvider>
    </div>
  );
};

export default AuthenticatedLayout;
