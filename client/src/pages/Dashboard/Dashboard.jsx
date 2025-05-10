import { useAuth } from "../../context/AuthContext";
import { useSpinner } from "../../context/SpinnerContext";
import { useFeatureFlags } from "../../context/FeatureFlagContext";
import { UserRoleEnum } from "../../enums/enums.js";
import SubDashboard from "../../components/dashboard/SubDashboard";
import AdminDashboard from "../../components/dashboard/AdminDashboard";

const Dashboard = () => {
  const { user } = useAuth();
  const { setLoading } = useSpinner();
  const { flags } = useFeatureFlags();
  return (
    <>
      {user.role === UserRoleEnum.ADMIN && <AdminDashboard />}
      <SubDashboard />
    </>
  );
};

export default Dashboard;
