import React, { useState } from "react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useSpinner } from "../../context/SpinnerContext";
import ChoosePlanPage from "./ChoosePlanPage";
import PaymentPage from "./PaymentPage";
import { activateFreeTrial } from "../../services/userService.js";

const steps = {
  CHOOSE_PLAN: 1,
  PAYMENT: 2,
};

const Subscribe = () => {
  const { user, updateUser } = useAuth();
  const { setLoading } = useSpinner();
  const navigate = useNavigate();

  const [step, setStep] = useState(steps.CHOOSE_PLAN);
  const [selectedPlan, setSelectedPlan] = useState("");

  const handleFreeTrialActivation = async () => {
    setLoading(true);
    try {
      const data = await activateFreeTrial(user?.userId);
      updateUser(data.user);
      setLoading(false);
      const result = await Swal.fire({
        title: "Free Trial Activated",
        text: "You now have full access to all features for the next 3 days. Enjoy exploring the platform!",
        icon: "success",
        confirmButtonText: "Go to Dashboard",
        showCancelButton: true,
        reverseButtons: false,
      });

      if (result.isConfirmed) {
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Error activating free trial:", error);
      toast.error(
        error?.response?.data?.message ||
          error.message ||
          "Failed to activate free trial."
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan);
    if (plan === "Free Trial") {
      handleFreeTrialActivation();
    } else {
      setStep(steps.PAYMENT);
    }
  };

  const renderStep = () => {
    switch (step) {
      case steps.CHOOSE_PLAN:
        return <ChoosePlanPage onSelect={handlePlanSelect} />;
      case steps.PAYMENT:
        return (
          <PaymentPage
            setStep={setStep}
            selectedPlan={selectedPlan}
            steps={steps}
          />
        );
      default:
        return null;
    }
  };

  return <>{renderStep()}</>;
};

export default Subscribe;
