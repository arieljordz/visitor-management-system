import React, { useEffect, useState } from "react";
import socket from "../../utils/socket";
import {
  getNotifications,
  getNotificationsById,
  markAsRead,
  markAsReadById,
} from "../../services/notificationService.js";

const Notifications = ({ user }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // console.log("user:", user);
  const fetchNotifications = async () => {
    try {
      let data = [];

      if (user?.role === "admin") {
        data = await getNotifications();
      } else {
        data = await getNotificationsById(user?.userId);
      }

      // console.log("response:", data);
      setNotifications(data);
      countUnreadNotifications(data);
    } catch (error) {
      // console.error("Error fetching notifications:", error);
    }
  };
  // Fetch notifications when the component mounts or when user changes
  useEffect(() => {
    // Fetch notifications on mount and when the user changes
    fetchNotifications();

    // Listen for new notifications via Socket.IO
    socket.on("new-notification", handleNewNotification);

    // Clean up listener when component unmounts
    return () => {
      socket.off("new-notification", handleNewNotification);
    };
  }, [user]);

  // Handle new notifications from Socket.IO
  const handleNewNotification = (data) => {
    const notification = {
      _id: Date.now(),
      message: data.message,
      dateCreated: new Date().toISOString(),
      read: false,
    };

    console.log("🔔 Received new notification:", data);
    // Add the new notification to the top of the list
    setNotifications((prev) => [notification, ...prev]);
    setUnreadCount((prev) => prev + 1);
  };

  // Count unread notifications
  const countUnreadNotifications = (notifications) => {
    const unread = notifications.filter((notification) =>
      user.role === "admin"
        ? !notification.isAdminRead
        : !notification.isClientRead
    ).length;

    setUnreadCount(unread);
  };

  // Handle opening the notification dropdown (mark as read)
  const handleOpenDropdown = () => {
    setUnreadCount(0);
    markAllAsRead();
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      if (user.role === "admin") {
        await markAsRead();
      } else {
        await markAsReadById(user.userId);
      }
      setNotifications((prev) =>
        prev.map((notification) => ({
          ...notification,
          isAdminRead: user.role === "admin" ? true : notification.isAdminRead,
          isClientRead:
            user.role !== "admin" ? true : notification.isClientRead,
        }))
      );
    } catch (error) {
      // console.error("Error marking notifications as read:", error);
    }
  };

  return (
    <>
      <a
        className="nav-link"
        data-toggle="dropdown"
        href="#"
        onClick={handleOpenDropdown}
      >
        <i className="far fa-bell" />
        {unreadCount > 0 && (
          <span className="badge badge-danger navbar-badge">{unreadCount}</span>
        )}
      </a>
      <div
        className="dropdown-menu dropdown-menu-lg dropdown-menu-right"
        style={{ left: "inherit", right: 0 }}
      >
        <span className="dropdown-item dropdown-header">
          {notifications.length} Notifications
        </span>
        <div className="dropdown-divider" />

        {notifications.length === 0 ? (
          <div className="dropdown-item text-center text-muted">
            No new notifications
          </div>
        ) : (
          notifications.map((n) => (
            <div key={n._id} className="d-flex flex-column">
              <a
                href="#"
                className="dropdown-item d-flex justify-content-between align-items-start"
              >
                <div className="d-flex align-items-start">
                  <i className="fas fa-wallet mr-2 text-success text-sm" />
                  <span
                    className="message-text"
                    style={{
                      whiteSpace: "normal",
                      wordWrap: "break-word",
                      fontSize: "0.875rem",
                    }}
                  >
                    {n.message}
                  </span>
                </div>
                <span className="text-muted text-sm ml-2 d-none d-md-inline">
                  {new Date(n.dateCreated).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </span>
              </a>
              <div className="dropdown-divider" />
            </div>
          ))
        )}

        <a href="#" className="dropdown-item dropdown-footer">
          See All Notifications
        </a>
      </div>
    </>
  );
};

export default Notifications;
