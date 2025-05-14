import React from "react";
import { useAuth } from "../../context/AuthContext";
import { UserRoleEnum } from "../../enums/enums.js";
import Restricted from "../../pages/Restricted/Restricted.jsx";

const AccessControlWrapper = ({ children }) => {
  const { user } = useAuth();

  const isSubscriberWithoutSubscription =
    user.role === UserRoleEnum.SUBSCRIBER && !user.subscription;

  return <>{isSubscriberWithoutSubscription ? <Restricted /> : children}</>;
};

export default AccessControlWrapper;
