import { useAuth } from "../../context/AuthContext.jsx";
import { useSpinner } from "../../context/SpinnerContext.jsx";
import { useFeatureFlags } from "../../context/FeatureFlagContext.jsx";
import { UserRoleEnum } from "../../enums/enums.js";
import SubGeneratedQRCodes from "../../components/transactions/SubGeneratedQRCodes.jsx";
import AdminGeneratedQRCodes from "../../components/transactions/AdminGeneratedQRCodes.jsx";
import AccessControlWrapper from "../../components/common/AccessControlWrapper.jsx";

const GeneratedQRCodes = () => {
  const { user } = useAuth();
  const { setLoading } = useSpinner();
  const { flags } = useFeatureFlags();
  // console.log("user:", user);
  return (
    <AccessControlWrapper>
      {user.role === UserRoleEnum.ADMIN ? <AdminGeneratedQRCodes /> : <SubGeneratedQRCodes />}
    </AccessControlWrapper>
  );
};

export default GeneratedQRCodes;
