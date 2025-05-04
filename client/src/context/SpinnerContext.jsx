import React, { createContext, useState, useContext } from "react";
import Spinner from "../components/common/Spinner";

const SpinnerContext = createContext();

export const useSpinner = () => useContext(SpinnerContext);

export const SpinnerProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);

  return (
    <SpinnerContext.Provider value={{ loading, setLoading }}>
      {loading && <Spinner />}
      {children}
    </SpinnerContext.Provider>
  );
};
