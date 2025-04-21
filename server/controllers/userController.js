import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

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

  // Log the incoming data
  console.log("Received data:", req.body);

  try {
    // Find the user by email
    const user = await User.findOne({ email });

    // If no user found, return an error
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Compare the password with the hashed password in the database
    const isMatch = await bcrypt.compare(password, user.password);

    // If the password doesn't match, return an error
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate a JWT token
    const token = jwt.sign({ userId: user._id }, "your_jwt_secret_key", {
      expiresIn: "1h",
    });

    // Return the token, email, and userId to the client
    res.json({
      token,
      email: user.email,
      name: user.name,
      picture: user.picture,
      role: user.role,
      userId: user._id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const googleLogin = async (req, res) => {
  const { email, password, name, picture, role, address } = req.body;

  console.log("googleLogin data:", req.body);
  try {
    // Check if the user already exists in the database
    let user = await User.findOne({ email });

    if (!user) {
      // If user does not exist, create a new one
      user = new User({
        email,
        password,
        name,
        picture,
        role,
        address,
      });

      // Save the new user to the database
      await user.save();
    }

    // If the user exists or is newly created, generate a JWT token
    const token = jwt.sign({ userId: user._id }, "your_jwt_secret_key", {
      expiresIn: "1h",
    });

    // Return the token and user info to the frontend
    res.json({
      token,
      name: user.name,
      email: user.email,
      picture: user.picture,
      userId: user._id,
      role: user.role,
      address: user.address,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
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

// User login (authenticate user)
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Compare password with hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        email: user.email,
        name: user.name,
        role: user.role,
        address: user.address,
      },
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Failed to login", error: err.message });
  }
};
