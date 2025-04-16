import React, { useState } from "react";
import { Navbar, Nav, Dropdown, Container, Modal } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import { useTheme } from "../context/ThemeContext";
import ProfileModal from "../modals/ProfileModal";

const NavbarComponent = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const { darkMode, toggleTheme } = useTheme();

  const handleLogout = () => {
    onLogout();
    navigate("/");
  };

  const handleProfileClick = () => setShowProfileModal(true);
  const handleCloseProfile = () => setShowProfileModal(false);

  const navbarBg = darkMode ? "light" : "dark";
  const navbarVariant = darkMode ? "light" : "dark";
  const textColor = darkMode ? "text-dark" : "text-light";
  const iconColor = darkMode ? "#000" : "#fff";

  const renderNavLinks = () => (
    <Nav className="me-auto">
      <Nav.Link className={textColor} onClick={() => navigate("/dashboard")}>
        Dashboard
      </Nav.Link>
      <Nav.Link className={textColor} onClick={() => navigate("/transactions")}>
        Transactions
      </Nav.Link>
      {user.role === "admin" && (
        <Nav.Link
          className={textColor}
          onClick={() => navigate("/file-maintenance")}
        >
          File Maintenance
        </Nav.Link>
      )}
    </Nav>
  );

  const renderUserDropdown = () => (
    <Dropdown align="end">
      <Dropdown.Toggle
        as="div"
        id="dropdown-user"
        className="d-flex align-items-center"
        style={{ cursor: "pointer" }}
      >
        <FaUserCircle size={24} color={iconColor} />
      </Dropdown.Toggle>
      <Dropdown.Menu className="py-1">
        <Dropdown.Item className="small" onClick={toggleTheme}>
          🌗 Theme: {darkMode ? "Dark" : "Light"}
        </Dropdown.Item>
        <Dropdown.Divider className="m-0" />
        <Dropdown.Item className="small" onClick={handleProfileClick}>
          👤 Profile
        </Dropdown.Item>
        <Dropdown.Divider className="m-0" />
        <Dropdown.Item className="small" onClick={handleLogout}>
          ⬅️ Logout
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );

  return (
    <>
      <Navbar bg={navbarBg} variant={navbarVariant} expand="lg" fixed="top">
        <Container>
          <Navbar.Brand
            className={`fw-bold ${textColor}`}
            style={{ cursor: "pointer" }}
            onClick={() => navigate("/dashboard")}
          >
            Visitor Management System
          </Navbar.Brand>

          <Navbar.Toggle aria-controls="navbar-nav" />
          <Navbar.Collapse id="navbar-nav">
            {user && renderNavLinks()}
            <Nav className="ms-auto">
              {user ? (
                renderUserDropdown()
              ) : (
                <Nav.Link href="/" className={textColor}>
                  Login
                </Nav.Link>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      {/* Profile Modal */}
      {showProfileModal && (
        <ProfileModal
          show={showProfileModal}
          onClose={handleCloseProfile}
          user={user}
        />
      )}
    </>
  );
};

export default NavbarComponent;
