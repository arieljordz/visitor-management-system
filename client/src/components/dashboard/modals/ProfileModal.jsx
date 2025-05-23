import React from "react";
import { Modal } from "react-bootstrap";

const ProfileModal = ({ show, onClose, user }) => {
  const formattedRole = user?.role
    ? user?.role.charAt(0).toUpperCase() + user?.role.slice(1)
    : "N/A";

  const profilePicture = user?.picture || "https://via.placeholder.com/100";
  // Format dateAdded (March 22, 2025)
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(user?.createdAt || Date.now()));

  const formattedAddress = "N/A";

  return (
    <Modal show={show} onHide={onClose} centered>
      {/* Header */}
      <div className="modal-header">
        <h5 className="modal-title fw-bold">User Profile</h5>
        <button type="button" className="close" onClick={onClose}>
          <span>&times;</span>
        </button>
      </div>

      {/* Body */}
      <div className="modal-body text-center">
        <div className="mb-3">
          <img
            src={profilePicture || "https://via.placeholder.com/100"}
            alt="Profile"
            className="rounded-circle img-fluid border border-secondary"
            style={{ width: "100px", height: "100px", objectFit: "cover" }}
          />
        </div>

        <h5 className="fw-bold mb-1">{user?.name || "N/A"}</h5>
        <p className="text-muted mb-2 small">{user?.email || "N/A"}</p>

        <div className="border p-3 rounded text-start small">
          <p className="mb-1">
            <strong>Role:</strong> {formattedRole}
          </p>
          <p className="mb-1">
            <strong>Date Added:</strong> {formattedDate}
          </p>
          <p className="mb-0">
            <strong>Address:</strong> {formattedAddress}
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default ProfileModal;
