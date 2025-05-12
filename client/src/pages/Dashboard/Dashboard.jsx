import { useAuth } from "../../context/AuthContext";
import { useSpinner } from "../../context/SpinnerContext";
import { useFeatureFlags } from "../../context/FeatureFlagContext";
import { UserRoleEnum } from "../../enums/enums.js";
import SubDashboard from "../../components/dashboard/SubDashboard";
import AdminDashboard from "../../components/dashboard/AdminDashboard";
import AccessControlWrapper from "../../components/common/AccessControlWrapper.jsx";

const Dashboard = () => {
  const { user } = useAuth();
  const { setLoading } = useSpinner();
  const { flags } = useFeatureFlags();
  // console.log("user:", user);
  return (
    <AccessControlWrapper>
      {user.role === UserRoleEnum.ADMIN ? <AdminDashboard /> : <SubDashboard />}
    </AccessControlWrapper>
  );
};

export default Dashboard;
