import React from "react";
import { useAuth } from "../../context/AuthContext";
import { UserRoleEnum } from "../../enums/enums.js";
import Restricted from "../../pages/Restricted/Restricted.jsx";

const AccessControlWrapper = ({ children }) => {
  const { user } = useAuth();
  const hasAccess = user.role === UserRoleEnum.ADMIN || user.subscription;

  return <>{hasAccess ? children : <Restricted />}</>;
};

export default AccessControlWrapper;
