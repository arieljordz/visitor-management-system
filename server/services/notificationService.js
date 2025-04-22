import Notification from "../models/Notification.js";

// Function to create a new notification
export const createNotification = async (
  userId,
  transaction,
  type,
  message
) => {
  const notification = new Notification({
    userId,
    transaction,
    type,
    message,
  });

  // Save and return the created notification
  const savedNotification = await notification.save();
  return savedNotification; // Return the notification object
};

// Function to emit notification via Socket.IO
export const emitNotification = (io, userId, message) => {
  io.emit("new-notification", { userId, message });
};
