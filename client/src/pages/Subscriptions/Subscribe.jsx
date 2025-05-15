import React, { useState } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import { useSpinner } from "../../context/SpinnerContext";
import ChoosePlanPage from "./ChoosePlanPage";
import PaymentPage from "./PaymentPage";
import SuccessPendingPage from "./SuccessPendingPage";
import { activateFreeTrial } from "../../services/userService.js";

const steps = {
  CHOOSE_PLAN: 1,
  PAYMENT: 2,
  SUCCESS: 3,
};

const Subscribe = () => {
  const { user } = useAuth();
  const { setLoading } = useSpinner();

  const [step, setStep] = useState(steps.CHOOSE_PLAN);
  const [selectedPlan, setSelectedPlan] = useState("");
  const [successTitle, setSuccessTitle] = useState("");
  const [successMessages, setSuccessMessages] = useState([]);

  const handlePlanSelect = async (plan) => {
    setSelectedPlan(plan);

    if (plan === "Free") {
      setLoading(true);
      try {
        await activateFreeTrial(user?.userId);

        setSuccessTitle("🎉 Free Trial Activated");
        setSuccessMessages([
          "You now have access to all features for the next 3 days.",
          "Enjoy exploring the system!"
        ]);

        setStep(steps.SUCCESS);
      } catch (error) {
        console.error("Error in activating free trial:", error);
        toast.error(
          error?.response?.data?.message ||
          error.message ||
          "Failed to activate free trial."
        );
      } finally {
        setLoading(false);
      }
    } else {
      // Preset messages for the subscription success page (can be reused later after payment)
      setSuccessTitle("✅ Payment Submitted");
      setSuccessMessages([
        "Your subscription is currently pending verification.",
        "We will notify you once it's approved."
      ]);

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
            setSuccessTitle={setSuccessTitle}
            setSuccessMessages={setSuccessMessages}
          />
        );
      case steps.SUCCESS:
        return (
          <SuccessPendingPage
            title={successTitle}
            messages={successMessages}
          />
        );
      default:
        return null;
    }
  };

  return <>{renderStep()}</>;
};

export default Subscribe;
