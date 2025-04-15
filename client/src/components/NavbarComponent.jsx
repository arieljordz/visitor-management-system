import React, { useState, useEffect } from "react";
import {
  Navbar,
  Nav,
  Button,
  Dropdown,
  Container,
  Modal,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";

const NavbarComponent = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  useEffect(() => {
    document.body.className = darkMode
      ? "bg-dark text-light"
      : "bg-light text-dark";
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const handleLogout = () => {
    onLogout();
    navigate("/");
  };

  const handleProfileClick = () => setShowProfileModal(true);
  const handleCloseProfile = () => setShowProfileModal(false);
  const toggleTheme = () => setDarkMode((prev) => !prev);

  // Navbar style: invert background, keep white text in nav, brand/icon text follows theme
  const navbarBg = darkMode ? "light" : "dark";
  const navbarVariant = "light";

  // Set text/icon color based on theme
  const brandColor = darkMode ? "text-dark" : "text-light";
  const iconColor = darkMode ? "#000" : "#fff";

  return (
    <>
      <Navbar bg={navbarBg} variant={navbarVariant} expand="lg" sticky="top">
        <Container fluid>
          {/* Brand Title with dynamic text color */}
          <Navbar.Brand className={`fw-bold ${brandColor}`}>
            Visitor Management System
          </Navbar.Brand>

          <Navbar.Toggle aria-controls="navbar-nav" />
          <Navbar.Collapse id="navbar-nav" className="justify-content-end">
            {user ? (
              <Dropdown align="end">
                <Dropdown.Toggle
                  as="div"
                  id="dropdown-user"
                  className="d-flex align-items-center"
                  style={{ cursor: "pointer" }}
                >
                  {/* FaUserCircle with dynamic icon color */}
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
            ) : (
              <Nav>
                <Nav.Link href="/" className={brandColor}>
                  Login
                </Nav.Link>
              </Nav>
            )}
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Profile Modal */}
      <Modal show={showProfileModal} onHide={handleCloseProfile} centered>
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="w-100 text-center">User Profile</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          <div className="d-flex flex-column align-items-center">
            <img
              src="/images/palos.png"
              alt="Profile"
              className="rounded-circle border border-3 shadow mb-3"
              width="120"
              height="120"
            />
            {/* You can include more user info here like name/email */}
            <h5 className="mb-0">{user.name ? user.name : "John Doe"}</h5>
            <small className="text-muted">{user.email}</small>
          </div>
        </Modal.Body>
        <Modal.Footer className="border-0 justify-content-end">
          {/* <Button variant="secondary" onClick={handleCloseProfile}>
            Close
          </Button> */}
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default NavbarComponent;
