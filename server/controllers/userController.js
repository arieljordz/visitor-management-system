import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { logAudit } from "../utils/auditLogger.js";

// User registration handler
export const register = async (req, res) => {
  const { email, password, name, picture, role, address } = req.body;

  // Log the incoming data
  console.log("Received data:", req.body);

  try {
    // Validate input
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Prepare user data
    const userData = {
      email,
      password: await bcrypt.hash(password, 10), // Hash password
      name: name || null,
      picture: picture || null,
      role: role || "client", // Default to "client" if not provided
      address: address || null,
    };

    // Create and save the new user
    const newUser = new User(userData);
    await newUser.save();

    // Return success response
    return res.status(201).json({
      message: "Registration successful",
      email: newUser.email,
      name: newUser.name,
      picture: newUser.picture,
      userId: newUser._id,
      role: newUser.role,
      address: newUser.address,
    });
  } catch (error) {
    console.error("Error during registration:", error);
    return res
      .status(500)
      .json({ message: "Server error, please try again later" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  console.log("Received data:", req.body);

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate a unique session token
    const newSessionToken = uuidv4();
    user.sessionToken = newSessionToken;
    await user.save();

    // Sign JWT with the session token
    const token = jwt.sign(
      { userId: user._id, sessionToken: newSessionToken },
      "your_jwt_secret_key",
      { expiresIn: "1h" }
    );

    // ✅ Log successful login
    await logAudit({
      userId: user._id,
      action: "LOGIN",
      ipAddress: req.ip,
      details: { method: "local", email },
    });

    res.json({
      token,
      email: user.email,
      name: user.name,
      picture: user.picture,
      userId: user._id,
      role: user.role,
      address: user.address,
      sessionToken: user.sessionToken,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const googleLogin = async (req, res) => {
  const { email, password, name, picture, role, address } = req.body;

  try {
    let user = await User.findOne({ email });

    const newSessionToken = uuidv4(); // generate unique session token

    if (!user) {
      user = new User({
        email,
        password,
        name,
        picture,
        role,
        address,
        sessionToken: newSessionToken,
      });
    } else {
      // Invalidate previous sessions by updating sessionToken
      user.sessionToken = newSessionToken;
    }

    await user.save();

    const token = jwt.sign(
      { userId: user._id, sessionToken: newSessionToken },
      "your_jwt_secret_key",
      { expiresIn: "1h" }
    );

    // ✅ Log Google login
    await logAudit({
      userId: user._id,
      action: "GOOGLE_LOGIN",
      ipAddress: req.ip,
      details: { method: "google", email },
    });

    res.json({
      token,
      name: user.name,
      email: user.email,
      picture: user.picture,
      userId: user._id,
      role: user.role,
      address: user.address,
      sessionToken: user.sessionToken,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const logout = async (req, res) => {
  try {
    const userId = req.user._id;
    await User.findByIdAndUpdate(userId, { sessionToken: null });
    res.json({ message: "Logged out successfully" });
  } catch (error) {
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
    // Check if user exists
    const existingUser = await User.findOne({ email });
    console.log("existingUser:", existingUser);
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const passwordToUse = rawPassword || "DefaultPass";

    // Hash password
    const hashedPassword = await bcrypt.hash(passwordToUse, 10);

    // Create new user
    const newUser = new User({
      email,
      password: hashedPassword,
      name,
      picture,
      role,
      address,
    });

    const savedUser = await newUser.save();
    res.status(201).json({
      message: "User created successfully",
      data: savedUser,
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
