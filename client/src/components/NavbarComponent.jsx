import React, { useState } from "react";
import {
  Navbar,
  Nav,
  Button,
  Dropdown,
  Container,
  Modal,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa"; // user icon

const NavbarComponent = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [showProfileModal, setShowProfileModal] = useState(false);

  const handleLogout = () => {
    onLogout();
    navigate("/"); // Navigate to home page on logout
  };

  const handleProfileClick = () => {
    setShowProfileModal(true); // Show profile modal when clicked
  };

  const handleCloseProfile = () => {
    setShowProfileModal(false); // Close profile modal
  };

  return (
    <>
      <Navbar bg="dark" variant="dark" expand="lg">
        <Navbar.Brand className="ps-3 pe-4">
          Visitor Management System
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse className="justify-content-end">
          {user ? (
            <div className="ms-auto">
              <Dropdown align="end">
                <Dropdown.Toggle
                  as="span"
                  id="dropdown-user"
                  className="d-flex align-items-center"
                  style={{ cursor: "pointer" }}
                >
                  {/* <FaUserCircle size={20} color={darkMode ? "#000" : "#fff"} /> */}
                  <FaUserCircle size={20} color="#fff" />
                </Dropdown.Toggle>

                <Dropdown.Menu className="py-1">
                  <Dropdown.Item className="small">🌗 Theme</Dropdown.Item>
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
            </div>
          ) : (
            <Nav>
              <Nav.Link href="/">Login</Nav.Link>
            </Nav>
          )}
        </Navbar.Collapse>
      </Navbar>

      {/* Profile Modal */}
      <Modal show={showProfileModal} onHide={handleCloseProfile} centered>
        <Modal.Header closeButton>
          <Modal.Title>User Profile</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* Profile Image */}
          <div className="mb-3">
            <img
              src="https://lh3.googleusercontent.com/a/ACg8ocKxuJ_PmdxYOOQLuZeGSplZ5nTMNiCxdsAji7BclFeaLsC7jHuK=s96-c"
              alt="Profile"
              className={`rounded-circle border border-2 img-fluid`}
              width="100"
              height="100"
            />
          </div>
          {/* You can add more profile details here if needed */}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseProfile}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default NavbarComponent;
