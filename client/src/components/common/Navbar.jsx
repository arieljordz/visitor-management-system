import React, { useContext } from "react";
import { ThemeContext } from "../../context/ThemeContext";
import DisplayBalance from "./DisplayBalance";
import Notifications from "./Notifications";
import { useFeatureFlags } from "../../context/FeatureFlagContext";

const Navbar = ({ user, setUser }) => {
  const { darkMode, toggleTheme } = useContext(ThemeContext);
  const { flags } = useFeatureFlags(); 

  return (
    <nav
      className={`main-header navbar navbar-expand fixed-top ${
        darkMode ? "navbar-dark bg-dark" : "navbar-white navbar-light"
      }`}
    >
      {/* Left navbar links */}
      <ul className="navbar-nav">
        <li className="nav-item">
          <a className="nav-link" data-widget="pushmenu" href="#" role="button">
            <i className="fas fa-bars"></i>
          </a>
        </li>
        <li className="nav-item d-none d-sm-inline-block">
          <span className="nav-link fw-bold">Visitor Management System</span>
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
          <Notifications user={user} />
        </li>

        {/* Dark Mode Toggle */}
        <li className="nav-item ml-1">
          <button
            className="btn btn-sm btn-outline-secondary"
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
