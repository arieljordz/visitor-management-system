import jwt from "jsonwebtoken";
import User from "../models/User.js";

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) return res.status(401).json({ message: "Unauthorized" });

  const token = authHeader.split(" ")[1];
  const refreshToken = req.cookies.refreshToken; // Assuming you're sending refresh token as a cookie

  try {
    // First, verify the access token
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
      // Token is expired, try to refresh with the refresh token
      if (!refreshToken) {
        return res.status(401).json({ message: "Refresh token is missing" });
      }

      try {
        const decodedRefresh = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        
        // Generate new access token
        const user = await User.findById(decodedRefresh.userId);
        if (!user) {
          return res.status(401).json({ message: "Invalid refresh token" });
        }

        const newAccessToken = jwt.sign(
          { userId: user._id, sessionToken: user.sessionToken },
          process.env.JWT_SECRET,
          { expiresIn: process.env.JWT_EXPIRATION }
        );

        res.setHeader("Authorization", `Bearer ${newAccessToken}`); // Send the new access token

        req.user = user; // Set user for the next middleware
        next();
      } catch (refreshError) {
        console.error("Refresh token error:", refreshError.message);
        return res.status(401).json({ message: "Invalid or expired refresh token" });
      }
    } else {
      return res.status(401).json({ message: "Invalid token" });
    }
  }
};

export default authenticate;
