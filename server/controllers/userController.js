import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import User from "../models/User.js";
import Session from "../models/Session.js";
import {
  generateJWT,
  createSession,
  buildResponse,
} from "../utils/authUtils.js";

// User handler
export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const sessionToken = uuidv4();
    user.sessionToken = sessionToken;
    await user.save();

    // Exclude only the password
    const { password: _, ...safeUser } = user.toObject();
    req.user = safeUser;

    const token = generateJWT(user._id, sessionToken);
    await createSession(user, req, sessionToken, "local");

    res.json(buildResponse(user, token));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const googleLogin = async (req, res) => {
  const { email, password, name, picture, role, address } = req.body;

  try {
    let user = await User.findOne({ email });
    const sessionToken = uuidv4();
    const hashedPassword = await bcrypt.hash(password, 10);

    if (!user) {
      user = new User({
        email,
        password: hashedPassword,
        name,
        picture,
        role,
        address,
        sessionToken,
      });
    } else {
      user.sessionToken = sessionToken;
    }

    await user.save();

    // Exclude only the password
    const { password: _, ...safeUser } = user.toObject();
    req.user = safeUser;

    const token = generateJWT(user._id, sessionToken);
    await createSession(user, req, sessionToken, "google");

    res.json(buildResponse(user, token));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const logout = async (req, res) => {
  try {
    const userId = req.user._id; 
    const sessionToken = req.user.sessionToken;

    // 1. Clear sessionToken in user record
    await User.findByIdAndUpdate(userId, { sessionToken: null });

    // 2. Deactivate current session
    await Session.updateOne(
      { userId, sessionToken, isActive: true },
      { $set: { isActive: false } }
    );

    res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
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
    } = req.body;

    console.log("Create user:", req.body);

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Use provided password or fallback to default
    const passwordToUse = rawPassword || "DefaultPass";

    // Hash password
    const hashedPassword = await bcrypt.hash(passwordToUse, 10);

    // Create and save user
    const newUser = new User({
      email,
      password: hashedPassword,
      name,
      picture,
      role,
      address,
    });

    const savedUser = await newUser.save();

    // Exclude password
    const { password, ...safeUser } = savedUser.toObject();
    req.user = safeUser;

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
    const users = await User.find().sort({ createdAt: -1 });
    res.status(200).json({ data: users });
  } catch (err) {
    console.error("Get Users Error:", err);
    res
      .status(500)
      .json({ message: "Failed to retrieve users", error: err.message });
  }
};

// Get a user by ID
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
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
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
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
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Delete User Error:", err);
    res
      .status(500)
      .json({ message: "Failed to delete user", error: err.message });
  }
};
