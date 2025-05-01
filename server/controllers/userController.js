import bcrypt from "bcryptjs";
import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";
import User from "../models/User.js";
import Session from "../models/Session.js";
import {
  generateAccessToken,
  generateRefreshToken,
  createSession,
  buildResponse,
} from "../utils/authUtils.js";
import { sendEmail } from "../utils/mailer.js";

// User handler
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (
      !user ||
      !user.password ||
      !(await bcrypt.compare(password, user.password))
    ) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (user.status !== "active") {
      return res.status(403).json({ message: "Account is inactive" });
    }

    const sessionToken = uuidv4();
    const accessToken = generateAccessToken(user._id, sessionToken);
    const refreshToken = generateRefreshToken(user._id);

    user.sessionToken = sessionToken;
    user.refreshToken = refreshToken;
    await user.save();

    const { password: _, ...safeUser } = user.toObject();
    await createSession(user, req, sessionToken, "local");

    // Send refresh token via HttpOnly cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json(buildResponse(safeUser, accessToken));
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const googleLogin = async (req, res) => {
  const { email, password, name, picture, role = "client", address } = req.body;

  try {
    let user = await User.findOne({ email });
    const sessionToken = uuidv4();
    const hashedPassword = password
      ? await bcrypt.hash(password, 10)
      : undefined;

    const isNewUser = !user;

    if (isNewUser) {
      user = new User({
        email,
        password: hashedPassword,
        name,
        picture,
        role,
        address,
        verified: false,
        status: "active",
        sessionToken,
      });
    } else {
      user.sessionToken = sessionToken;
    }

    const accessToken = generateAccessToken(user._id, sessionToken);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save();

    const { password: _, ...safeUser } = user.toObject();

    // Send refresh token as cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    if (isNewUser || !user.verified) {
      const verificationUrl = `${process.env.BASE_API_URL}/api/google-login-verify-user?email=${encodeURIComponent(email)}`;
      const subject = "Verify Your Email";

      const message = `
        <div>
          <p>Hello ${name},</p>
          <p>Please verify your email address by clicking the link below:</p>
          <p>
            <a href="${verificationUrl}" style="color: #1a73e8; text-decoration: underline;" target="_blank" rel="noopener noreferrer">
              Verify Email
            </a>
          </p>
          <p>Or copy and paste the link into your browser:</p>
          <p style="word-break: break-all;">${verificationUrl}</p>
          <p><strong>Note:</strong> Your default password is: <code>DefaultPass123!</code></p>
          <p>You can change your password after logging in.</p>
          <p>If you did not request this, please ignore this email.</p>
        </div>
      `;

      await sendEmail({ to: email, subject, html: message });
    } else {
      await createSession(user, req, sessionToken, "google");
    }

    res.json(buildResponse(safeUser, accessToken));
  } catch (error) {
    console.error("Google Login Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const refreshToken = async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ message: "No refresh token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user || user.refreshToken !== token) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    const sessionToken = uuidv4(); // Optional: rotate session
    user.sessionToken = sessionToken;
    await user.save();

    const accessToken = generateAccessToken(user._id, sessionToken);
    res.json({ token: accessToken });
  } catch (err) {
    res.status(403).json({ message: "Token expired or invalid" });
  }
};

export const verifyEmail = async (req, res) => {
  const { email } = req.query;

  try {
    const user = await User.findOne({ email });

    if (!user) return res.status(404).send("User not found.");
    if (user.verified)
      return res.redirect(`${process.env.BASE_URL}/email-verification`);

    user.verified = true;
    await user.save();

    // Redirect to frontend after successful verification
    res.redirect(`${process.env.BASE_URL}/email-verification`);
  } catch (error) {
    console.error("Email Verification Error:", error);
    res.status(500).send("Server error.");
  }
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(404)
        .json({ message: "No user found with that email." });

    const token = crypto.randomBytes(32).toString("hex");
    user.resetToken = token;
    user.resetTokenExpires = Date.now() + 1000 * 60 * 60; // 1 hour
    await user.save();

    const resetUrl = `${process.env.BASE_URL}/reset-password/${token}`;
    const subject = "Reset your password";
    const message = `
    <div>
      <p>You requested a password reset.</p>
      <p>Click the link below to reset your password. This link is valid for 1 hour:</p>
      <p>
        <a href="${resetUrl}" style="color: #1a73e8; text-decoration: underline;" target="_blank" rel="noopener noreferrer">
          Reset Password
        </a>
      </p>
      <p>Or copy and paste the link into your browser:</p>
      <p style="word-break: break-all;">${resetUrl}</p>
      <p>If you did not request this, please ignore this email.</p>
    </div>
  `;

    await sendEmail({
      to: email,
      subject,
      html: message,
    });

    res.json({ message: "Password reset email sent successfully." });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user.password = hashedPassword;
    user.resetToken = null;
    user.resetTokenExpires = null;

    await user.save();

    res.json({ message: "Password reset successful. You can now log in." });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const logout = async (req, res) => {
  try {
    const userId = req.user._id;
    const sessionToken = req.user.sessionToken;

    await User.findByIdAndUpdate(userId, { sessionToken: null });
    await Session.updateOne(
      { userId, sessionToken, isActive: true },
      { $set: { isActive: false } }
    );

    res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout Error:", error);
    res.status(500).json({ message: "Logout failed" });
  }
};

// Create a new user
export const createUser = async (req, res) => {
  try {
    const {
      email,
      password: rawPassword,
      name,
      picture,
      role,
      address,
      verified,
      status,
    } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const password = rawPassword || "DefaultPass123!";
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      email,
      password: hashedPassword,
      name,
      picture,
      role,
      address,
      verified,
      status: status || "active",
    });

    const savedUser = await newUser.save();
    const { password: _, ...safeUser } = savedUser.toObject();

    res
      .status(201)
      .json({ message: "User created successfully", data: safeUser });
  } catch (err) {
    console.error("Create User Error:", err);
    res
      .status(500)
      .json({ message: "Failed to create user", error: err.message });
  }
};

// Get all users
export const getUsers = async (req, res) => {
  try {
    const users = await User.find({}, "-password").sort({ createdAt: -1 });
    res.status(200).json({ data: users });
  } catch (err) {
    console.error("Get Users Error:", err);
    res
      .status(500)
      .json({ message: "Failed to retrieve users", error: err.message });
  }
};

// Get all active users by Status
export const getActiveUsers = async (req, res) => {
  try {
    const users = await User.find({ status: "active" }).select("-password");
    res.status(200).json({ data: users });
  } catch (error) {
    console.error("Get Active Users Error:", error);
    res.status(500).json({
      message: "Failed to retrieve active users",
      error: error.message,
    });
  }
};

// Get all active users BySession
export const getActiveUsersBySession = async (req, res) => {
  try {
    const activeUsers = await User.find({ sessionToken: { $ne: null } }).select(
      "-password"
    );
    res.status(200).json({ data: activeUsers });
  } catch (error) {
    console.error("Get Active Users Error:", error);
    res.status(500).json({
      message: "Failed to retrieve active users",
      error: error.message,
    });
  }
};

// Get a user by ID
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ data: user });
  } catch (err) {
    console.error("Get User by ID Error:", err);
    res
      .status(500)
      .json({ message: "Failed to retrieve user", error: err.message });
  }
};

// Update a user
export const updateUser = async (req, res) => {
  try {
    const updates = { ...req.body };

    // Only hash password if it's being changed
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!updatedUser)
      return res.status(404).json({ message: "User not found" });

    res
      .status(200)
      .json({ message: "User updated successfully", data: updatedUser });
  } catch (err) {
    console.error("Update User Error:", err);
    res
      .status(500)
      .json({ message: "Failed to update user", error: err.message });
  }
};

// Delete a user
export const deleteUser = async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser)
      return res.status(404).json({ message: "User not found" });

    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Delete User Error:", err);
    res
      .status(500)
      .json({ message: "Failed to delete user", error: err.message });
  }
};
