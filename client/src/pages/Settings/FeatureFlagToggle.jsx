import { useState } from "react";
import { updateFeatureFlag } from "../../services/featureFlagService";
import { useFeatureFlags } from "../../context/FeatureFlagContext";

const FeatureFlagToggle = () => {
  const { flags, refreshFlags, loading } = useFeatureFlags();
  const [updating, setUpdating] = useState(false);

  const handleToggle = async (key) => {
    const newValue = !flags[key];
    try {
      setUpdating(true);
      await updateFeatureFlag(key, newValue);
      await refreshFlags(); // Refresh the global context flags
    } catch (error) {
      console.error(`Failed to update flag "${key}"`, error);
    } finally {
      setUpdating(false);
    }
  };

  if (loading || !flags || Object.keys(flags).length === 0)
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
                  disabled={updating}
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
