import { useState } from "react";
import { updateFeatureFlag } from "../../services/featureFlagService";
import { useFeatureFlags } from "../../context/FeatureFlagContext";
import { useSpinner } from "../../context/SpinnerContext";

const FeatureFlagToggle = () => {
  const { flags, refreshFlags, loading } = useFeatureFlags();
  const { setLoading } = useSpinner();
  const [updating, setUpdating] = useState(false);

  const handleToggle = async (key) => {
    const newValue = !flags[key];
    try {
      setLoading(true);
      setUpdating(true);
      await updateFeatureFlag(key, newValue);
      await refreshFlags(); // Refresh the global context flags
    } catch (error) {
      console.error(`Failed to update flag "${key}"`, error);
    } finally {
      setUpdating(false);
      setLoading(false);
    }
  };

  const formatKeyLabel = (key) => {
    return key
      .replace(/^enable/i, "") // Remove 'enable' at the start (case-insensitive)
      .replace(/([a-z])([A-Z])/g, "$1 $2") // Add space between camelCase boundaries
      .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2") // Handle acronym + Capital transitions
      .replace(/^./, (str) => str.toUpperCase()); // Capitalize the first letter
  };

  if (loading || !flags || Object.keys(flags).length === 0)
    return <div className="text-center py-4">Loading feature flags...</div>;

  return (
    <div className="container mt-4">
      <h3 className="mb-2">Feature Flags</h3>
      <div className="card">
        <div className="card-body">
          {Object.entries(flags).map(([key, value], index) => (
            <div
              key={key}
              className={`form-group d-flex justify-content-between align-items-center border-bottom py-2 mb-0 ${
                index === 0 ? "border-top" : ""
              }`}
            >
              <label className="mb-0">{formatKeyLabel(key)}</label>
              <div className="custom-control custom-switch">
                <input
                  type="checkbox"
                  className="custom-control-input"
                  id={`flag-${key}`}
                  checked={value}
                  onChange={() => handleToggle(key)}
                  disabled={updating}
                />
                <label
                  className="custom-control-label cursor-pointer"
                  htmlFor={`flag-${key}`}
                ></label>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* <div className="alert alert-info d-flex align-items-center" role="alert">
        <i className="bi bi-info-circle-fill me-2" />
        <div>
          <strong>Note:</strong> To see the latest feature changes, just log out
          and log back in.
        </div>
      </div> */}
    </div>
  );
};

export default FeatureFlagToggle;
