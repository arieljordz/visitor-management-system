import { useAuth } from "../../context/AuthContext.jsx";
import { useSpinner } from "../../context/SpinnerContext.jsx";
import { useFeatureFlags } from "../../context/FeatureFlagContext.jsx";
import { UserRoleEnum } from "../../enums/enums.js";
import SubPaymentHistory from "../../components/transactions/SubPaymentHistory.jsx";
import AdminPaymentHistory from "../../components/transactions/AdminPaymentHistory.jsx";
import AccessControlWrapper from "../../components/common/AccessControlWrapper.jsx";

const PaymentHistory = () => {
  const { user } = useAuth();
  const { setLoading } = useSpinner();
  const { flags } = useFeatureFlags();
  // console.log("user:", user);
  return (
    <AccessControlWrapper>
      {user.role === UserRoleEnum.ADMIN ? <AdminPaymentHistory /> : <SubPaymentHistory />}
    </AccessControlWrapper>
  );
};

export default PaymentHistory;
