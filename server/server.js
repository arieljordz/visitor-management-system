import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import cookieParser from "cookie-parser";
import { fileURLToPath } from "url";
import http from "http";
import { Server } from "socket.io";
import routes from "./routes/index.js";
import { startStatusJob } from "./schedulers/statusCronJob.js";

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Set the server port
const PORT = process.env.PORT || 5000;

// --- Directory Setup ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- HTTP Server Setup ---
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.BASE_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

// --- Middleware Setup ---
app.use(
  cors({
    origin: process.env.BASE_URL, // your Vite frontend dev server
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, // enable sending/receiving cookies
  })
);

// Parse incoming requests with JSON payload
app.use(express.json());

app.use(cookieParser());

// Serve static files from "uploads" folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// CORS headers to support cross-origin communication
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  res.setHeader("Cross-Origin-Embedder-Policy", "unsafe-none");
  next();
});

// --- Socket.IO Connection Logic ---
io.on("connection", (socket) => {
  console.log(`🟢 New socket connection: ${socket.id}`);

  socket.on("join", ({ userId, role }) => {
    socket.join(userId);
    if (role === "admin") {
      socket.join("admin");
    }
    console.log(
      `${role} joined room: ${userId}${role === "admin" ? " and admin" : ""}`
    );
  });

  socket.on("disconnect", () => {
    console.log(`🔴 Socket disconnected: ${socket.id}`);
  });
});

// Make Socket.IO accessible in routes (for emitting events)
app.set("io", io);

// --- Routes Setup ---
app.use("/api", routes); // Import routes from your 'routes' folder

// --- MongoDB Connection ---
mongoose
  .connect(process.env.MONGO_URI, {})
  .then(() => {
    console.log("✅ MongoDB connected");

    // Start the server after successful DB connection
    server.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
      // 🔁 Start the scheduled job for QR status updates
      startStatusJob();
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
  });
