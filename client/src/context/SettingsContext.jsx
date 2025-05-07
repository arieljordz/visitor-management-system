import { createContext, useState, useContext, useEffect } from "react";
import { getSettings, upsertSettings } from "../services/settingsService.js";
import { useSpinner } from "./SpinnerContext";

const SettingsContext = createContext();

export const useSettings = () => useContext(SettingsContext);

export const SettingProvider = ({ children }) => {
  const { setLoading } = useSpinner();
  const [settings, setSettings] = useState({});

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await getSettings();
      setSettings(data);
    } catch (error) {
      console.error("Error fetching settings", error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (formData) => {
    try {
      setLoading(true);
      const data = await upsertSettings(formData);
      setSettings(data);
    } catch (error) {
      console.error("Error saving settings", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, saveSettings, fetchSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};
