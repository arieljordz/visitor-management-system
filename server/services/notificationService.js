import Notification from "../models/Notification.js";

// Function to create a new notification
export const createNotification = async (
  userId,
  transaction,
  type,
  message,
  role
) => {
  const notification = new Notification({
    userId,
    transaction,
    type,
    message,
    role,
  });

  // Save and return the created notification
  const savedNotification = await notification.save();
  return savedNotification; // Return the notification object
};

// Function to emit notification via Socket.IO
export const emitNotification = (io, target, message) => {
  io.to(target).emit("new-notification", { userId: target, message });
};
