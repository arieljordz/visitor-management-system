import { createContext, useContext, useEffect, useState } from "react";
import { getFeatureFlags } from "../services/featureFlagService.js";

const FeatureFlagContext = createContext({});

export const useFeatureFlags = () => useContext(FeatureFlagContext);

export const FeatureFlagProvider = ({ children }) => {
  const [flags, setFlags] = useState({});

  useEffect(() => {
    const fetchFlags = async () => {
      try {
        const flagData = await getFeatureFlags();
        setFlags(flagData);
      } catch (error) {
        console.error("Failed to load feature flags", error);
      }
    };

    fetchFlags();
  }, []);

  return (
    <FeatureFlagContext.Provider value={flags}>
      {children}
    </FeatureFlagContext.Provider>
  );
};
