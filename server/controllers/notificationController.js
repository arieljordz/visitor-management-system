import mongoose from "mongoose";
import Notification from "../models/Notification.js";
import { UserRoleEnum } from "../enums/enums.js";

// Create a new notification
export const createNotification = async (req, res) => {
  const { userId, transaction, type, message } = req.body;

  try {
    const notification = new Notification({
      userId,
      transaction,
      type,
      message,
    });
    await notification.save();

    // Populate user for immediate use in frontend
    await notification.populate("userId", "name email");

    return res.status(201).json(notification);
  } catch (error) {
    console.error("Error creating notification:", error);
    return res.status(500).json({ message: "Failed to create notification" });
  }
};

// Get notifications for a specific user (with user populated)
export const getNotificationsById = async (req, res) => {
  const { userId } = req.params;
  try {
    const notifications = await Notification.find({ userId, role: UserRoleEnum.SUBSCRIBER })
      .populate("userId", "name email")
      .sort({ dateCreated: -1 })
      .limit(5);

    return res.status(200).json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return res.status(500).json({ message: "Failed to fetch notifications" });
  }
};

// Get all notifications (with user populated)
export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ role: "admin" })
      .populate("userId", "name email")
      .sort({ dateCreated: -1 })
      .limit(5);

    return res.status(200).json(notifications);
  } catch (error) {
    console.error("Error fetching top-up notifications:", error);
    return res
      .status(500)
      .json({ message: "Failed to fetch top-up notifications" });
  }
};

// Mark notification as read by user
export const markAsReadById = async (req, res) => {
  const { userId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "Invalid userId." });
  }

  try {
    // Update all notifications for this user
    const result = await Notification.updateMany(
      { userId },
      { isClientRead: true }
    );

    // console.log("result:", result);
    if (result.modifiedCount === 0) {
      return res
        .status(404)
        .json({ message: "No notifications to mark as read" });
    }

    return res
      .status(200)
      .json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error("Error updating notifications:", error);
    return res
      .status(500)
      .json({ message: "Failed to mark notifications as read" });
  }
};

// Mark notification as read (general)
export const markAsRead = async (req, res) => {
  try {
    // Find all unread notifications and update their 'read' status to true
    const notifications = await Notification.updateMany(
      { isAdminRead: false },
      { $set: { isAdminRead: true } },
      { new: true }
    );

    // console.log("notifications:", notifications);
    if (notifications.modifiedCount === 0) {
      return res.status(404).json({ message: "No unread notifications found" });
    }

    return res.status(200).json({ message: "Notifications marked as read" });
  } catch (error) {
    console.error("Error updating notifications:", error);
    return res
      .status(500)
      .json({ message: "Failed to mark notifications as read" });
  }
};
