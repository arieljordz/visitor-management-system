import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

// User registration handler
export const register = async (req, res) => {
  const { email, password, name, picture } = req.body;

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

    // If Google login data is provided, use it. Otherwise, use default values
    const userData = {
      email,
      password: await bcrypt.hash(password, 10), // Hash password if it's a normal registration
      name: name || null,
      picture: picture || null,
    };

    // Create the new user
    const newUser = new User(userData);

    // Save the new user
    await newUser.save();

    // Return a success message with user data
    return res.status(201).json({
      message: "Registration successful",
      email: newUser.email,
      name: newUser.name,
      picture: newUser.picture,
      userId: newUser._id,
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
      userId: user._id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const googleLogin = async (req, res) => {
  const { email, password, name, picture } = req.body;

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
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const pay = async (req, res) => {
  const { userId } = req.body;
  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ message: "User not found" });

  user.balance = 0;
  await user.save();
  res.json({ message: "Payment successful" });
};

export const generateQR = async (req, res) => {
  const qrData = `visitor-${req.params.userId}`;
  const qrCode = `https://api.qrserver.com/v1/create-qr-code/?data=${qrData}&size=150x150`;
  res.json({ qrCode });
};
