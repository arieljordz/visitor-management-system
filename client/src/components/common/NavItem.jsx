import React from "react";
import { useLocation } from "react-router-dom";

const NavItem = ({
  label,
  icon,
  submenu = [],
  isOpen,
  isActive,
  onMainClick,
  onSubClick,
}) => {
  const location = useLocation();

  return (
    <li className={`nav-item border-bottom ${isActive ? "active" : ""}`}>
      <a
        href="#"
        className={`nav-link ${isActive ? "active" : ""}`}
        onClick={(e) => {
          e.preventDefault();
          onMainClick();
        }}
      >
        <i className={`nav-icon ${icon}`} />
        <p>
          {label}
          {submenu.length > 0 && (
            <i className={`right fas fa-angle-${isOpen ? "down" : "left"}`} />
          )}
        </p>
      </a>
      {submenu.length > 0 && (
        <ul
          className="nav nav-treeview"
          style={{ display: isOpen ? "block" : "none" }}
        >
          {submenu.map((sub, idx) => (
            <li className="nav-item border-bottom" key={idx}>
              <a
                href="#"
                className={`nav-link ${
                  location.pathname === sub.path ? "active" : ""
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  onSubClick(sub.path);
                }}
                style={{ paddingLeft: "30px" }} 
              >
                <i className="fas fa-angle-right nav-icon" />
                <p>{sub.label}</p>
              </a>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
};

export default NavItem;
