import React from "react";
import { useAuth } from "../../context/AuthContext";
import { UserRoleEnum } from "../../enums/enums.js";
import Restricted from "../../pages/Restricted/Restricted.jsx";

const AccessControlWrapper = ({ children }) => {
  const { user } = useAuth();

  const isSubscriber = user.role === UserRoleEnum.SUBSCRIBER;
  const hasSubscription = !!user.subscription;
  const isOnTrial = user.isOnTrial;

  const shouldRestrict =
    isSubscriber && !hasSubscription && !isOnTrial;

  return <>{shouldRestrict ? <Restricted /> : children}</>;
};

export default AccessControlWrapper;
