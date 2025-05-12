import React, { useState } from "react";
import ChoosePlanPage from "./ChoosePlanPage";
import PaymentPage from "./PaymentPage";
import SuccessPendingPage from "./SuccessPendingPage";

const Subscribe = () => {
  const [step, setStep] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState("");

  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan);
    setStep(2);
  };

  return (
    <>
      {step === 1 && <ChoosePlanPage onSelect={handlePlanSelect} />}
      {step === 2 && <PaymentPage setStep={setStep} selectedPlan={selectedPlan} />}
      {step === 3 && <SuccessPendingPage />}
    </>
  );
};

export default Subscribe;
