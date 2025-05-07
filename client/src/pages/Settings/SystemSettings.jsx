import { useState, useEffect } from "react";
import { useSettings } from "../../context/SettingsContext";
import { useSpinner } from "../../context/SpinnerContext";

const SystemSettings = () => {
  const { settings, saveSettings, fetchSettings } = useSettings();
  const { setLoading } = useSpinner();

  const [formData, setFormData] = useState({
    title: "",
    header: "",
    sideHeader: "",
    navBarColor: "",
    sideBarColor: "",
    favicon: "",
  });

  // Predefined color options for navBarColor and sideBarColor
  const colorOptions = [
    "primary",
    "secondary",
    "success",
    "warning",
    "danger",
    "dark",
    "info",
  ];

  // Populate formData when setting is updated
  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await saveSettings(formData);
      await fetchSettings();
    } catch (error) {
      console.error("Failed to save settings", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    try {
      await fetchSettings();
    } catch (error) {
      console.error("Error refreshing settings", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h3>System Settings</h3>
        <button className="btn btn-outline-primary" onClick={handleRefresh}>
          Refresh Settings
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {["title", "header", "sideHeader"].map((field) => (
          <div className="mb-1" key={field}>
            <label className="form-label text-capitalize">{field}</label>
            <input
              type="text"
              name={field}
              value={formData[field] || ""}
              onChange={handleChange}
              className="form-control"
              placeholder={`Enter ${field}`}
              required
            />
          </div>
        ))}

        {["navBarColor", "sideBarColor"].map((field) => (
          <div className="mb-1" key={field}>
            <label className="form-label text-capitalize">{field}</label>
            <select
              name={field}
              value={formData[field] || ""}
              onChange={handleChange}
              className="form-control"
              required
            >
              <option value="">Select {field}</option>
              {colorOptions.map((color) => (
                <option key={color} value={color}>
                  {color}
                </option>
              ))}
            </select>
          </div>
        ))}

        <div className="mb-1">
          <label className="form-label text-capitalize">favicon</label>
          <input
            type="text"
            name="favicon"
            value={formData.favicon || ""}
            onChange={handleChange}
            className="form-control"
            placeholder="Enter favicon URL"
          />
          {formData.favicon && (
            <div className="mt-2">
              <small>Preview:</small>
              <img
                src={formData.favicon}
                alt="Favicon preview"
                style={{ width: 32, height: 32, marginLeft: 8 }}
              />
            </div>
          )}
        </div>

        <div className="d-flex justify-content-end mb-3">
          <button type="submit" className="btn btn-success">
            Save Settings
          </button>
        </div>
      </form>
    </div>
  );
};

export default SystemSettings;
