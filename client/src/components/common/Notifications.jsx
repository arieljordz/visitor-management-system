import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import socket from "../../utils/socket";
import {
  getNotifications,
  getNotificationsById,
  markAsRead,
  markAsReadById,
} from "../../services/notificationService.js";
import { UserRoleEnum } from "../../enums/enums.js";

const Notifications = ({ user }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      let data = [];

      if (user?.role === UserRoleEnum.ADMIN) {
        data = await getNotifications();
      } else {
        data = await getNotificationsById(user?.userId);
      }

      setNotifications(data);
      countUnreadNotifications(data);
    } catch (error) {
      // console.error("Error fetching notifications:", error);
    }
  };

  useEffect(() => {
    if (!user) return;
  
    fetchNotifications();
  
    socket.on("new-notification", handleNewNotification);
  
    return () => {
      socket.off("new-notification", handleNewNotification);
    };
  }, [user]);

  const handleNewNotification = (data) => {
    const notification = {
      _id: Date.now(),
      message: data.message,
      dateCreated: new Date().toISOString(),
      read: false,
    };

    setNotifications((prev) => [notification, ...prev]);
    setUnreadCount((prev) => prev + 1);
  };

  const countUnreadNotifications = (notifications) => {
    const unread = notifications.filter((notification) =>
      user.role === UserRoleEnum.ADMIN
        ? !notification.isAdminRead
        : !notification.isClientRead
    ).length;

    setUnreadCount(unread);
  };

  const handleOpenDropdown = () => {
    setUnreadCount(0);
    markAllAsRead();
  };

  const markAllAsRead = async () => {
    try {
      if (user.role === UserRoleEnum.ADMIN) {
        await markAsRead();
      } else {
        await markAsReadById(user.userId);
      }
      setNotifications((prev) =>
        prev.map((notification) => ({
          ...notification,
          isAdminRead: user.role === UserRoleEnum.ADMIN ? true : notification.isAdminRead,
          isClientRead:
            user.role !== UserRoleEnum.ADMIN ? true : notification.isClientRead,
        }))
      );
    } catch (error) {
      // console.error("Error marking notifications as read:", error);
    }
  };

  const handleNotificationClick = (message) => {
    if (user.role === UserRoleEnum.ADMIN && message.toLowerCase().includes("top-up")) {
      navigate("/admin/verifications");
    } else {
      navigate("/dashboard");
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
              <button
                className="dropdown-item d-flex justify-content-between align-items-start"
                onClick={() => handleNotificationClick(n.message)}
                style={{ border: "none", background: "none", textAlign: "left" }}
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
              </button>
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
