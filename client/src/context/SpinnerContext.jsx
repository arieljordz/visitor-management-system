import React, { createContext, useState, useContext } from "react";

const SpinnerContext = createContext();

export const useSpinner = () => useContext(SpinnerContext);

export const SpinnerProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);

  return (
    <SpinnerContext.Provider value={{ loading, setLoading }}>
      {loading && (
        <div className="spinner-overlay">
          <div className="spinner-border text-light" role="status" />
        </div>
      )}
      {children}
    </SpinnerContext.Provider>
  );
};
