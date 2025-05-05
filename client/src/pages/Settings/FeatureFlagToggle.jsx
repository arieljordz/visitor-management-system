import { useEffect, useState } from "react";
import {
  getFeatureFlags,
  updateFeatureFlag,
} from "../../services/featureFlagService";

const FeatureFlagToggle = () => {
  const [flags, setFlags] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFlags = async () => {
      try {
        const flagData = await getFeatureFlags();
        console.log("flagData:", flagData);
        setFlags(flagData);
      } catch (error) {
        console.error("Error loading feature flags:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFlags();
  }, []);

  const handleToggle = async (key) => {
    const newValue = !flags[key];
    try {
      await updateFeatureFlag(key, newValue);
      setFlags((prev) => ({
        ...prev,
        [key]: newValue,
      }));
    } catch (error) {
      console.error(`Failed to update flag "${key}"`, error);
    }
  };

  if (loading)
    return <div className="text-center py-4">Loading feature flags...</div>;

  return (
    <div className="container mt-4">
      <h5 className="mb-3">Feature Flags</h5>
      <div className="card">
        <div className="card-body">
          {Object.entries(flags).map(([key, value]) => (
            <div
              key={key}
              className="form-group d-flex justify-content-between align-items-center border-bottom py-2"
            >
              <label className="mb-0">{key}</label>
              <div className="custom-control custom-switch">
                <input
                  type="checkbox"
                  className="custom-control-input"
                  id={`flag-${key}`}
                  checked={value}
                  onChange={() => handleToggle(key)}
                />
                <label
                  className="custom-control-label"
                  htmlFor={`flag-${key}`}
                ></label>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="alert alert-info d-flex align-items-center" role="alert">
        <i className="bi bi-info-circle-fill me-2" />
        <div>
          <strong>Note:</strong> To see the latest feature changes, just log out
          and log back in.
        </div>
      </div>
    </div>
  );
};

export default FeatureFlagToggle;
