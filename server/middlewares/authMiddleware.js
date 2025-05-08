import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Session from "../models/Session.js";

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) return res.status(401).json({ message: "Unauthorized" });

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { userId, sessionToken } = decoded;

    const session = await Session.findOne({ userId, sessionToken, isActive: true });
    if (!session) {
      return res.status(401).json({ message: "Session invalidated" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired. Please login again." });
    }
    return res.status(401).json({ message: "Invalid token" });
  }
};

export default authenticate;
