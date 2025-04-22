import React, { useContext, useEffect, useState, useRef } from "react";
import { ThemeContext } from "../../context/ThemeContext";
import DisplayBalance from "./DisplayBalance";
import axios from "axios";
import Notifications from "./Notifications";

const API_URL = import.meta.env.VITE_BASE_API_URL;

const Navbar = ({ user, setUser }) => {
  const { darkMode, toggleTheme } = useContext(ThemeContext);

  // console.log("Nav user:", user);

  return (
    <nav
      className={`main-header navbar navbar-expand ${
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
      <ul className="navbar-nav mx-auto d-sm-none">
        <li className="nav-item">
          <DisplayBalance user={user} />
        </li>
      </ul>

      {/* Right navbar links */}
      <ul className="navbar-nav ml-auto align-items-center">
        {/* Balance on desktop */}
        <li className="nav-item d-none d-sm-inline-block mr-2">
          <DisplayBalance user={user} />
        </li>
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
