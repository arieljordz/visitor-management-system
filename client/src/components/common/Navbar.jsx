import React, { useContext } from "react";
import { ThemeContext } from "../../context/ThemeContext";
import DisplayBalance from "./DisplayBalance";

const Navbar = ({ user }) => {
  const { darkMode, toggleTheme } = useContext(ThemeContext);

  return (
    <nav
      className={`main-header navbar navbar-expand ${
        darkMode ? "navbar-dark bg-dark" : "navbar-white navbar-light"
      }`}
    >
      <ul className="navbar-nav">
        <li className="nav-item">
          <a className="nav-link" data-widget="pushmenu" href="#" role="button">
            <i className="fas fa-bars"></i>
          </a>
        </li>
      </ul>

      <ul className="navbar-nav ms-auto d-flex align-items-center justify-content-end w-100">
        <li className="nav-item mr-3">
          <DisplayBalance userId={user?.userId} />
        </li>
        <li className="nav-item ms-auto">
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={toggleTheme}
            title="Toggle Dark Mode"
          >
            {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
