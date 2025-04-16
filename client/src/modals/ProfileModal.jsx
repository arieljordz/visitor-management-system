import React from "react";
import { Modal } from "react-bootstrap";
import { useTheme } from "../context/ThemeContext";

const ProfileModal = ({ show, onClose, user }) => {
  const { darkMode } = useTheme();

  const theme = darkMode ? "bg-dark text-light" : "bg-white text-dark";
  const modalBgClass = darkMode ? "bg-dark text-light" : "bg-white";
  const borderColor = darkMode ? "border-light" : "border-dark";
  const emailTextClass = darkMode ? "text-light" : "text-muted";

  const formattedRole = user.role
    ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
    : "N/A";

  const profilePicture = user.picture || "https://via.placeholder.com/100";
  // Format dateAdded (March 22, 2025)
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(user?.createdAt || Date.now()));
  
  const formattedAddress = "N/A";

  return (
    <Modal
      className="modal-sm"
      show={show}
      onHide={onClose}
      centered
      contentClassName={modalBgClass}
    >
      {/* Header */}
      <Modal.Header closeButton className={modalBgClass}>
        <Modal.Title className="fw-bold">User Profile</Modal.Title>
      </Modal.Header>

      {/* Body */}
      <Modal.Body className="text-center">
        <div className="mb-3">
          <img
            src={profilePicture}
            alt="Profile"
            className={`rounded-circle border border-2 ${borderColor} img-fluid`}
            width="100"
            height="100"
          />
        </div>

        <h5 className="fw-bold mb-1">{user?.name || "N/A"}</h5>
        <p className={`mb-2 small ${emailTextClass}`}>{user?.email || "N/A"}</p>

        <div className="border p-3 rounded text-start small">
          <p className="mb-1">
            <strong>Role:</strong> {formattedRole}
          </p>
          <p className="mb-1">
            <strong>Date Added:</strong> {formattedDate}
          </p>
          <p className="mb-1">
            <strong>Addrress:</strong> {formattedAddress}
          </p>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default ProfileModal;
