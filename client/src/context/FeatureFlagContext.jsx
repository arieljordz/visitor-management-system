import { createContext, useContext, useEffect, useState } from "react";
import { getFeatureFlags } from "../services/featureFlagService.js";

const FeatureFlagContext = createContext({});

export const useFeatureFlags = () => useContext(FeatureFlagContext);

export const FeatureFlagProvider = ({ children }) => {
  const [flags, setFlags] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchFlags = async () => {
    try {
      const flagData = await getFeatureFlags();
      setFlags(flagData);
    } catch (error) {
      console.error("Failed to load feature flags", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlags();
  }, []);

  return (
    <FeatureFlagContext.Provider value={{ flags, refreshFlags: fetchFlags, loading }}>
      {children}
    </FeatureFlagContext.Provider>
  );
};
