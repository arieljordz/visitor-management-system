import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { useNavigate, useLocation } from "react-router-dom";
import ProfileModal from "../dashboard/modals/ProfileModal";
import NavItem from "./NavItem";
import { logout } from "../../services/userService";
import { getMenuByRole } from "../../services/menuConfigService";
import { UserRoleEnum } from "../../enums/enums";
import { useTheme } from "../../context/ThemeContext";
import { useFeatureFlags } from "../../context/FeatureFlagContext";
import { useSettings } from "../../context/SettingsContext";

const Sidebar = ({ user }) => {
  const { darkMode, toggleTheme } = useTheme();
  const { settings } = useSettings();
  const { flags: featureFlags, loading: flagsLoading } = useFeatureFlags();
  const [showModal, setShowModal] = useState(false);
  const [openMenus, setOpenMenus] = useState({});
  const [modules, setModules] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const userRole = user?.role || UserRoleEnum.CLIENT;

  useEffect(() => {
    fetchMenuConfig();
  }, [userRole]);

  const fetchMenuConfig = async () => {
    try {
      const menuConfig = await getMenuByRole(userRole);
      setModules(menuConfig.data.menuItems);
    } catch (err) {
      console.error("Failed to load menu config:", err);
      setModules([]);
    }
  };

  const toggleMenu = (menuLabel) => {
    setOpenMenus((prev) => ({ ...prev, [menuLabel]: !prev[menuLabel] }));
  };

  const handleMainClick = (item) => {
    if (item.submenu && item.submenu.length > 0) {
      toggleMenu(item.label);
    } else {
      handleNavigation(item.path);
    }
  };

  const handleNavigation = async (path) => {
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

  const isFeatureEnabled = (label) => {
    const key = `enable${label.replace(/\s+/g, "")}`;
    return featureFlags?.[key];
  };

  const filteredMenu = modules
    .map((item) => {
      if (item.submenu && item.submenu.length > 0) {
        const filteredSub = item.submenu.filter((sub) =>
          isFeatureEnabled(sub.label)
        );

        // Only include parent menu if at least one submenu is enabled
        return filteredSub.length > 0
          ? { ...item, submenu: filteredSub }
          : null;
      }

      // Include the item only if the feature is enabled
      return isFeatureEnabled(item.label) ? item : null;
    })
    .filter(Boolean);

  const sideBarColorClass = settings?.navBarColor
    ? settings.navBarColor
    : darkMode
    ? "dark"
    : "light";

  const textColorClass = darkMode ? "text-light" : "text-dark";
  return (
    <>
      <aside className="main-sidebar sidebar-dark-primary elevation-4">
        <a
          href="#"
          className={`brand-link bg-${sideBarColorClass} ${textColorClass}`}
          onClick={(e) => {
            e.preventDefault();
            setShowModal(true);
          }}
        >
          <img
            src="https://adminlte.io/themes/v3/dist/img/AdminLTELogo.png"
            alt="AdminLTE Logo"
            className="brand-image img-circle elevation-3"
            style={{ opacity: ".8" }}
          />
          <span className="brand-text font-weight-bold ml-4">
            {settings?.sideHeader?.toUpperCase()}
          </span>
        </a>
        <div className="sidebar">
          <nav className="mt-2">
            <ul className="nav nav-pills nav-sidebar flex-column" role="menu">
              {filteredMenu.map((item, index) => {
                const isActive =
                  location.pathname === item.path ||
                  item.submenu?.some((sub) => sub.path === location.pathname);

                return (
                  <NavItem
                    key={index}
                    {...item}
                    isOpen={openMenus[item.label]}
                    isActive={isActive}
                    onMainClick={() => handleMainClick(item)}
                    onSubClick={handleNavigation}
                  />
                );
              })}
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
