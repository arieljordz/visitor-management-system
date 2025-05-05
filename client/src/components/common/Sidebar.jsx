import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { useNavigate, useLocation } from "react-router-dom";
import ProfileModal from "../dashboard/modals/ProfileModal";
import NavItem from "./NavItem";
import menuConfig from "../../configs/menuConfig";
import { logout } from "../../services/userService.js";
import { getFeatureFlags } from "../../services/featureFlagService";
import { UserRoleEnum } from "../../enums/enums.js";

const Sidebar = ({ user }) => {
  const [showModal, setShowModal] = useState(false);
  const userRole = user?.role || UserRoleEnum.CLIENT;
  const [openMenus, setOpenMenus] = useState({});
  const [featureFlags, setFeatureFlags] = useState({});
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchFlags = async () => {
      try {
        const flags = await getFeatureFlags();
        setFeatureFlags(flags);
      } catch (err) {
        console.error("Failed to load feature flags", err);
      }
    };
    fetchFlags();
  }, []);

  const toggleMenu = (menu) => {
    setOpenMenus((prev) => ({ ...prev, [menu]: !prev[menu] }));
  };

  const handleClick = async (path) => {
    if (path === "/") {
      const isConfirmed = await Swal.fire({
        title: "Are you sure?",
        text: "You will be logged out!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, logout!",
      }).then((result) => result.isConfirmed);
      if (isConfirmed) {
        await logout();
        localStorage.removeItem("user");
        navigate(path);
      }
    } else {
      navigate(path);
    }
  };

  const handleShowModal = (e) => {
    e.preventDefault();
    setShowModal(true);
  };

  const filteredMenu = menuConfig[userRole].map((item) => {
    // Filter submenus
    if (item.submenu) {
      const filteredSub = item.submenu.filter((sub) => {
        if (sub.label === "Payment History" && featureFlags.disablePaymentHistory) return false;
        if (sub.label === "Proofs" && featureFlags.disableProofs) return false;
        return true;
      });
      return { ...item, submenu: filteredSub };
    }

    // Filter top-level items
    if (item.label === "My Wallet" && featureFlags.disableMyWallet) return null;
    if (item.label === "Verifications" && featureFlags.disableVerifications) return null;

    return item;
  }).filter(Boolean); // Remove nulls

  return (
    <>
      <aside className="main-sidebar sidebar-dark-primary elevation-4">
        <a href="#" className="brand-link" onClick={handleShowModal}>
          <img
            src="https://adminlte.io/themes/v3/dist/img/AdminLTELogo.png"
            alt="AdminLTE Logo"
            className="brand-image img-circle elevation-3"
            style={{ opacity: ".8" }}
          />
          <span className="brand-text font-weight-bold ml-4">VMS-APP</span>
        </a>
        <div className="sidebar">
          <nav className="mt-2">
            <ul className="nav nav-pills nav-sidebar flex-column" role="menu">
              {filteredMenu.map((item, index) => (
                <NavItem
                  key={index}
                  {...item}
                  isOpen={openMenus[item.label]}
                  isActive={
                    location.pathname === item.path ||
                    item.submenu?.some((sub) => sub.path === location.pathname)
                  }
                  onClick={() =>
                    item.submenu ? toggleMenu(item.label) : handleClick(item.path)
                  }
                  toggleMenu={handleClick}
                />
              ))}
            </ul>
          </nav>
        </div>
      </aside>

      <ProfileModal
        show={showModal}
        onClose={() => setShowModal(false)}
        user={user}
      />
    </>
  );
};

export default Sidebar;
