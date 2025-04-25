import jwt from "jsonwebtoken";
import User from "../models/User.js";

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  // console.log("authHeader:", authHeader);
  if (!authHeader) return res.status(401).json({ message: "Unauthorized" });

  const token = authHeader.split(" ")[1];
  // console.log("TOKEN RAW:", token);
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId);

    if (!user || user.sessionToken !== decoded.sessionToken) {
      return res.status(401).json({ message: "Session invalidated" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("JWT verification error:", error.message);

    if (error.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ message: "Token expired. Please login again." });
    }

    return res.status(401).json({ message: "Invalid token" });
  }
};

export default authenticate;
