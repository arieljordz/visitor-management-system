import React from "react";
import { useTheme } from "../context/ThemeContext"; // adjust path as needed

function Header({ levelOne, levelTwo, levelThree }) {
  const { darkMode } = useTheme();

  const textClass = darkMode ? "text-light" : "text-dark";

  return (
    <div className={`content-header ${darkMode ? "bg-dark" : "bg-light"} py-2 px-3 rounded`}>
      <div className="d-flex justify-content-start">
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb mb-0">
            <li className="breadcrumb-item">
              <span className={textClass}>{levelOne}</span>
            </li>
            <li className="breadcrumb-item">
              <span className={textClass}>{levelTwo}</span>
            </li>
            <li className={`breadcrumb-item ${textClass}`} aria-current="page">
              {levelThree}
            </li>
          </ol>
        </nav>
      </div>
    </div>
  );
}

export default Header;
