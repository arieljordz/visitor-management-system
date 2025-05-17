import React from "react";
import moment from "moment";
import { useAuth } from "../../context/AuthContext";
import { UserRoleEnum } from "../../enums/enums.js";
import Restricted from "../../pages/Restricted/Restricted.jsx";

const AccessControlWrapper = ({ children }) => {
  const { user } = useAuth();

  const isSubscriber = user.role === UserRoleEnum.SUBSCRIBER;

  const hasValidSubscription =
    user.subscription &&
    user.expiryDate &&
    moment(user.expiryDate).isSameOrAfter(moment(), "day");

  const isOnValidTrial =
    user.isOnTrial &&
    user.trialEndsAt &&
    moment(user.trialEndsAt).isSameOrAfter(moment(), "day");

  const shouldRestrict =
    isSubscriber && !hasValidSubscription && !isOnValidTrial;

  return <>{shouldRestrict ? <Restricted /> : children}</>;
};

export default AccessControlWrapper;
