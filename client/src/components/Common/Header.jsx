import React from "react";
import { useTheme } from "../../context/ThemeContext"; 

function Header({ levelOne, levelTwo, levelThree }) {
  const { darkMode } = useTheme();

  const containerClass = darkMode ? "bg-dark text-light" : "bg-light text-dark";
  const breadcrumbClass = darkMode ? "breadcrumb-dark" : "";
  const textClass = darkMode ? "text-light" : "text-dark";

  return (
    <div className={`content-header py-2 px-3 rounded ${containerClass}`}>
      <div className="d-flex justify-content-start">
        <nav aria-label="breadcrumb">
          <ol className={`breadcrumb mb-0 ${breadcrumbClass}`}>
            <li className="breadcrumb-item">
              <span className={textClass}>{levelOne}</span>
            </li>
            <li className="breadcrumb-item">
              <span className={textClass}>{levelTwo}</span>
            </li>
            <li className={`breadcrumb-item active ${textClass}`} aria-current="page">
              logged as: {levelThree}
            </li>
          </ol>
        </nav>
      </div>
    </div>
  );
}

export default Header;
