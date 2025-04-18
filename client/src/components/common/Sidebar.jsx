import React, { useState } from "react";
import Swal from "sweetalert2";
import { useNavigate, useLocation } from "react-router-dom";

const Sidebar = ({ user, setUser }) => {
  console.log("User:", user);
  const userRole = user?.role || "client";
  const [openMenus, setOpenMenus] = useState({});
  const navigate = useNavigate();
  const location = useLocation();

  const toggleMenu = (menu) => {
    setOpenMenus((prev) => ({ ...prev, [menu]: !prev[menu] }));
  };

  const handleClick = (path) => {
    if (path === "/") {
      Swal.fire({
        title: "Are you sure?",
        text: "You will be logged out!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, logout!",
      }).then((result) => {
        if (result.isConfirmed) {
          localStorage.removeItem("user");
          setUser(null);
          navigate(path);
        }
      });
    } else {
      navigate(path);
    }
  };

  const renderNavItem = (label, icon, submenu = [], key, path) => {
    const isOpen = openMenus[key];

    // Check if the current path matches the menu item path
    const isActive = location.pathname === path;

    return (
      <li
        className={`nav-item border-bottom ${isActive ? "active" : ""}`}
        key={key}
      >
        <a
          href="#"
          className={`nav-link ${isActive ? "active" : ""}`}
          onClick={() => (submenu.length ? toggleMenu(key) : handleClick(path))}
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
                  onClick={() => handleClick(sub.path)}
                >
                  <i className="far fa-circle nav-icon" />
                  <p>{sub.label}</p>
                </a>
              </li>
            ))}
          </ul>
        )}
      </li>
    );
  };

  const clientMenu = [
    renderNavItem(
      "Dashboard",
      "fas fa-home",
      [],
      "client-dashboard",
      "/dashboard"
    ),
    renderNavItem(
      "Transactions",
      "fas fa-money-check-alt",
      [
        { label: "Payment History", path: "/transactions/payment-history" },
        {
          label: "Generated QR Codes",
          path: "/transactions/generated-qr-codes",
        },
      ],
      "client-transactions"
    ),
    renderNavItem(
      "My Wallet",
      "fas fa-wallet",
      [],
      "client-wallet",
      "/my-wallet"
    ),
    renderNavItem("Logout", "fas fa-sign-out-alt", [], "client-logout", "/"),
  ];

  const adminMenu = [
    renderNavItem(
      "Dashboard",
      "fas fa-home",
      [],
      "admin-dashboard",
      "/admin/dashboard"
    ),
    renderNavItem(
      "Transactions",
      "fas fa-money-check-alt",
      [
        {
          label: "Payment History",
          path: "/admin/transactions/payment-history",
        },
        {
          label: "Generated QR Codes",
          path: "/admin/transactions/generated-qr-codes",
        },
      ],
      "admin-transactions"
    ),
    renderNavItem(
      "Verifications",
      "fas fa-user-check",
      [],
      "admin-verifications",
      "/admin/verifications"
    ),
    renderNavItem(
      "File Maintenance",
      "fas fa-folder",
      [
        { label: "Proofs", path: "/admin/file-maintenance/proofs" },
        {
          label: "Payment Methods",
          path: "/admin/file-maintenance/payment-methods",
        },
        {
          label: "Classifications",
          path: "/admin/file-maintenance/classifications",
        },
        { label: "Fees", path: "/admin/file-maintenance/fees" },
        { label: "Accounts", path: "/admin/file-maintenance/accounts" },
      ],
      "admin-file-maintenance"
    ),
    renderNavItem("Logout", "fas fa-sign-out-alt", [], "admin-logout", "/"),
  ];

  const staffMenu = [
    renderNavItem(
      "Scan QR Code",
      "fas fa-qrcode",
      [],
      "staff-scan",
      "/staff/scan"
    ),
    renderNavItem("Logout", "fas fa-sign-out-alt", [], "staff-logout", "/"),
  ];

  const menu =
    userRole === "admin"
      ? adminMenu
      : userRole === "client"
      ? clientMenu
      : staffMenu;

  return (
    <aside className="main-sidebar sidebar-dark-primary elevation-4">
      <a href="#" className="brand-link">
        <img
          src="https://adminlte.io/themes/v3/dist/img/AdminLTELogo.png"
          alt="AdminLTE Logo"
          className="brand-image img-circle elevation-3"
          style={{ opacity: ".8" }}
        />
        <span className="brand-text font-weight-light">
          {user?.name?.split(" ")[0]}
        </span>
      </a>
      <div className="sidebar">
        <nav className="mt-2">
          <ul className="nav nav-pills nav-sidebar flex-column" role="menu">
            {menu}
          </ul>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
