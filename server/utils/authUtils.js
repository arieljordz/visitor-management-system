import jwt from "jsonwebtoken";
import Session from "../models/Session.js";

// Access token: short-lived
export const generateAccessToken = (userId, sessionToken) => {
  return jwt.sign({ userId, sessionToken }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRATION,
  });
};

// Refresh token: long-lived
export const generateRefreshToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });
};

export const createSession = async (userId, sessionToken, refreshToken, req) => {
  try {
    // Deactivate previous sessions
    await Session.updateMany(
      { userId, isActive: true },
      { $set: { isActive: false } }
    );

    // Set expiry date (7 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Create new session
    await Session.create({
      userId,
      sessionToken,
      refreshToken,
      expiresAt,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"] || "unknown",
      isActive: true,
    });
  } catch (error) {
    console.error("Session Creation Error:", error);
    throw error;
  }
};

export const buildResponse = (user, token) => ({
  token,
  name: user.name,
  email: user.email,
  picture: user.picture,
  userId: user._id,
  role: user.role,
  address: user.address,
  verified: user.verified,
  sessionToken: user.sessionToken,
});
