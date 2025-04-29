import jwt from "jsonwebtoken";
import Session from "../models/Session.js";

export const generateJWT = (userId, sessionToken) => {
  return jwt.sign({ userId, sessionToken }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRATION,
  });
};

export const createSession = async (user, req, sessionToken, method) => {
  await Session.updateMany(
    { userId: user._id, isActive: true },
    { $set: { isActive: false } }
  );

  await Session.create({
    userId: user._id,
    sessionToken,
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"],
  });
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
