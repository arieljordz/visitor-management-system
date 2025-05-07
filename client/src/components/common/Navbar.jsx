import React, { useContext } from "react";
import { ThemeContext } from "../../context/ThemeContext";
import DisplayBalance from "./DisplayBalance";
import Notifications from "./Notifications";
import { useFeatureFlags } from "../../context/FeatureFlagContext";
import { useSettings } from "../../context/SettingsContext";

const Navbar = ({ user }) => {
  const { darkMode, toggleTheme } = useContext(ThemeContext);
  const { flags } = useFeatureFlags();
  const { settings } = useSettings();

  const lightTextColors = [
    "primary",
    "secondary",
    "success",
    "danger",
    "dark",
    "info",
  ];
  
  const getTextColorClass = (navColor) => {
    // Special handling for 'warning' navbar color (set text to black)
    if (navColor === "warning") return "text-dark";
    
    // Default behavior for light navbar colors (e.g., primary, success)
    return lightTextColors.includes(navColor) ? "text-light" : "text-dark";
  };
  
  const navBarColor = settings?.navBarColor;
  
  const navBarColorClass = navBarColor
    ? `navbar-${navBarColor} bg-${navBarColor}`  // Correctly assigns bg-warning, etc.
    : darkMode
    ? "bg-dark"
    : "navbar-light bg-light";
  
  const textColorClass = getTextColorClass(navBarColor);
  const iconButtonClass = textColorClass === "text-light" ? "btn-outline-light" : "btn-outline-dark";

  return (
    <nav
      className={`main-header navbar navbar-expand fixed-top ${navBarColorClass}`}
    >
      {/* Left navbar links */}
      <ul className="navbar-nav">
        <li className="nav-item">
          <a
            className={`nav-link ${textColorClass}`}
            data-widget="pushmenu"
            href="#"
            role="button"
          >
            <i className="fas fa-bars"></i>
          </a>
        </li>
        <li className="nav-item d-none d-sm-inline-block">
          <span className={`nav-link fw-bold ${textColorClass}`}>
            {settings.title}
          </span>
        </li>
      </ul>

      {/* Centered balance on mobile */}
      {!flags.enableSubscription && (
        <ul className="navbar-nav mx-auto d-sm-none">
          <li className="nav-item">
            <DisplayBalance user={user} />
          </li>
        </ul>
      )}

      {/* Right navbar links */}
      <ul className="navbar-nav ml-auto align-items-center">
        {/* Balance on desktop */}
        {!flags.enableSubscription && (
          <li className="nav-item d-none d-sm-inline-block mr-2">
            <DisplayBalance user={user} />
          </li>
        )}
        {/* Notifications */}
        <li className="nav-item dropdown">
          <Notifications user={user} textColorClass={textColorClass} />
        </li>

        {/* Dark Mode Toggle */}
        <li className="nav-item ml-1">
          <button
            className={`btn btn-sm ${iconButtonClass}`}
            onClick={toggleTheme}
            title="Toggle Dark Mode"
          >
            {darkMode ? "☀️" : "🌙"}
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
