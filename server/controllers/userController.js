import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";
import { addDays } from "date-fns";
import User from "../models/User.js";
import Session from "../models/Session.js";
import {
  generateAccessToken,
  generateRefreshToken,
  createSession,
  buildResponse,
} from "../utils/authUtils.js";
import { sendEmail } from "../utils/mailer.js";
import { evaluateUserStatus } from "../utils/statusUtils.js";
import { StatusEnum, UserRoleEnum, PasswordEnum, PlanTypeEnum } from "../enums/enums.js";
import { sendVerificationEmail } from "../services/sendEmailService.js";

// User handler
export const login = async (req, res) => {
  const { email, password } = req.body;

  // console.log("LOGIN ATTEMPT", email, password);

  try {
    // Step 1: Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Email not found" });
    }

    // Step 2: Check if password is set
    if (!user.password) {
      return res.status(401).json({ message: "Password not set" });
    }

    // Step 3: Validate password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // Step 4: Check account status
    if (user.status !== StatusEnum.ACTIVE) {
      return res.status(403).json({ message: "Account is inactive" });
    }

    // ** New Step: Evaluate and update user subscription, trial, and QR code status **
    await evaluateUserStatus(user);

    // Step 5: Generate session and tokens
    const sessionToken = uuidv4();
    const refreshToken = generateRefreshToken(user._id);
    const accessToken = generateAccessToken(user._id, sessionToken);

    // Step 6: Create session
    await createSession(user._id, sessionToken, refreshToken, req);

    // Step 7: Return response
    const { password: _, ...userData } = user.toObject();

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // console.log("Found user:", userData);
    res.status(200).json(buildResponse(userData, accessToken));
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const googleLogin = async (req, res) => {
  const {
    email,
    password,
    name,
    picture,
    role = UserRoleEnum.SUBSCRIBER,
    address,
    categoryType = "N/A",
    subscription = false,
    expiryDate = null,
    verified = true,
    status = StatusEnum.ACTIVE,
  } = req.body;

  try {
    let user = await User.findOne({ email });
    const isNewUser = !user;
    const sessionToken = uuidv4();
    const refreshToken = generateRefreshToken(user?._id || null);

    if (isNewUser) {
      const hashedPassword = password
        ? await bcrypt.hash(password, 10)
        : undefined;
      // const expiryDate = addDays(new Date(), 30); // Trial period

      user = new User({
        email,
        password: hashedPassword,
        name,
        picture,
        role,
        address,
        categoryType,
        subscription,
        expiryDate,
        verified,
        status,
      });

      await user.save(); // Save new user before creating session
    }

    // Evaluate and update subscription, trial, and QR codes before token generation
    await evaluateUserStatus(user);

    const accessToken = generateAccessToken(user._id, sessionToken);

    // Save session token and refresh token
    await createSession(user._id, sessionToken, refreshToken, req);

    const { password: _, ...safeUser } = user.toObject();

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Optionally send verification email here if needed
    // if (isNewUser || !user.verified) {
    // await sendVerificationEmail({ name, email });
    // }

    // console.log("safeUser:", safeUser);
    res.status(200).json(buildResponse(safeUser, accessToken));
  } catch (error) {
    console.error("Google Login Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const refreshToken = async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) {
    return res.status(401).json({ message: "No refresh token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user || user.refreshToken !== token) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    const sessionToken = uuidv4(); // Rotate session token (optional)
    user.sessionToken = sessionToken;
    await user.save();

    const accessToken = generateAccessToken(user._id, sessionToken);

    res.json({
      accessToken,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        // any other fields you want to send
      },
    });
  } catch (err) {
    return res.status(403).json({ message: "Token expired or invalid" });
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
    const userId = req.user?._id;

    // Validate Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authorization header missing or malformed" });
    }

    const token = authHeader.split(" ")[1];

    // Decode token to extract sessionToken
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    const sessionToken = decoded.sessionToken;

    // Deactivate session
    const sessionUpdate = await Session.updateOne(
      { userId, sessionToken, isActive: true },
      { $set: { isActive: false } }
    );

    if (sessionUpdate.matchedCount === 0) {
      return res.status(404).json({ message: "Session not found or already logged out" });
    }

    // Optionally clear the refresh token cookie
    res.clearCookie("refreshToken", {
      httpOnly: true,
      sameSite: "Strict",
      secure: process.env.NODE_ENV === "production",
    });

    return res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout Error:", error);
    return res.status(500).json({ message: "Logout failed", error: error.message });
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
      role = UserRoleEnum.SUBSCRIBER,
      address,
      userId,
      department,
      categoryType,
      subscription = false,
      expiryDate = null,
      verified = false,
      status = StatusEnum.ACTIVE,
    } = req.body;

    // console.log("role:", role);
    let subscriberId = null;

    if (role !== UserRoleEnum.SUBSCRIBER) {
      // Only assign subscriberId if creating a non-subscriber
      subscriberId = userId;
    }

    // Validate required fields
    if (!email || !address) {
      return res.status(400).json({
        message: "Email and address are required fields",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const password = rawPassword || PasswordEnum.DEFAULT_PASS;
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      email,
      password: hashedPassword,
      name,
      picture,
      role,
      address,
      subscriberId,
      department,
      categoryType,
      subscription,
      expiryDate,
      verified,
      status,
    });

    const savedUser = await newUser.save();
    const { password: _, ...safeUser } = savedUser.toObject();

    // Optionally send verification email here if needed
    // if (!savedUser.verified) {
    // await sendVerificationEmail({ name: savedUser.name, email: savedUser.email });
    // }

    res.status(201).json({
      message: "User created successfully",
      data: safeUser,
    });
  } catch (err) {
    console.error("Create User Error:", err);
    res.status(500).json({
      message: "Failed to create user",
      error: err.message,
    });
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
    const users = await User.find({ status: StatusEnum.ACTIVE }).select(
      "-password"
    );
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
    // Query the Session model for active sessions with active status
    const activeSessions = await Session.find({ isActive: true })
      .populate("userId", "-password") // Populate user details excluding password
      .exec();

    // Extract the users from the session data
    const activeUsers = activeSessions.map((session) => session.userId);

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

// Get a user by Role
export const getUsersByRole = async (req, res) => {
  const rolesQuery = req.query.roles;

  try {
    if (!rolesQuery) {
      return res.status(400).json({ message: "No roles provided" });
    }

    const roles = rolesQuery.split(",").map((r) => r.trim());

    // Validate all provided roles
    const invalidRoles = roles.filter(
      (role) => !Object.values(UserRoleEnum).includes(role)
    );
    if (invalidRoles.length > 0) {
      return res.status(400).json({
        message: `Invalid roles provided: ${invalidRoles.join(", ")}`,
      });
    }

    // Fetch users with any of the provided roles
    const usersByRoles = await User.find({ role: { $in: roles } })
      .select("-password")
      .populate("subscriberId", "name email");

    if (usersByRoles.length === 0) {
      return res
        .status(404)
        .json({ message: "No users found for the specified roles" });
    }

    res.status(200).json({ data: usersByRoles });
  } catch (error) {
    console.error("Get Users by Roles Error:", error);
    res.status(500).json({
      message: "Failed to retrieve users by roles",
      error: error.message,
    });
  }
};

export const getUsersStaff = async (req, res) => {
  try {
    const { id } = req.query;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid or missing user ID." });
    }

    // Find users with role 'staff' and subscriberId === id
    const staffUsers = await User.find({
      role: UserRoleEnum.STAFF,
      subscriberId: id,
    })
      .select("-password")
      .populate("subscriberId", "name email");

    if (staffUsers.length === 0) {
      return res
        .status(404)
        .json({ message: "No staff users found for this subscriber." });
    }

    res.status(200).json({ data: staffUsers });
  } catch (error) {
    console.error("Get Staff Users Error:", error);
    res.status(500).json({
      message: "Failed to retrieve staff users for subscriber.",
      error: error.message,
    });
  }
};

// Update a user
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params; // User ID from route params
    const updates = { ...req.body };

    // Only hash the password if it's being changed
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }

    // Validate the role and status (if applicable)
    if (updates.role && !Object.values(UserRoleEnum).includes(updates.role)) {
      return res.status(400).json({ message: "Invalid role provided" });
    }

    if (updates.status && !Object.values(StatusEnum).includes(updates.status)) {
      return res.status(400).json({ message: "Invalid status provided" });
    }

    // Handle subscription and expiry date
    if (typeof updates.subscription === "boolean") {
      if (updates.subscription === true) {
        updates.expiryDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
      } else {
        updates.expiryDate = null; // clear expiryDate if subscription is false
      }
    }

    // Perform the update operation
    const updatedUser = await User.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).select("-password"); // Exclude password from the returned user object

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

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

// Free Trial Activation
export const activateFreeTrial = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("UserId:", id);

    // ✅ Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user ID format." });
    }

    // ✅ Find the user
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // ✅ Check if user has already taken the trial
    if (user.isOnTrial || user.trialStartedAt || user.trialEndsAt) {
      return res
        .status(400)
        .json({ message: "Free trial has already been used." });
    }

    // ✅ Activate trial
    const trialDays = 3;
    const now = new Date();
    const trialEndsAt = new Date(
      now.getTime() + trialDays * 24 * 60 * 60 * 1000
    );

    user.planType = PlanTypeEnum.FREE_TRIAL;
    user.isOnTrial = true;
    user.trialStartedAt = now;
    user.trialEndsAt = trialEndsAt;
    // user.expiryDate = trialEndsAt;
    user.subscription = false;

    await user.save();

    return res.status(200).json({
      message: "Free trial activated successfully.",
      user,
    });
  } catch (err) {
    console.error("Error activating free trial:", err);
    return res.status(500).json({ message: "Internal server error." });
  }
};
