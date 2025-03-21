const express = require("express");
const next = require("next");
const http = require("http");
const socketIo = require("socket.io");

// Initialize Next.js app
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();

  // Create an HTTP server for Socket.io
  const httpServer = http.createServer(server);

  // Initialize Socket.io server
  const io = socketIo(httpServer, {
    cors: {
      origin: "http://localhost:3000", // Allow the frontend running on port 3000
      methods: ["GET", "POST"],
      credntials: true,
    },
  });

  const usersStatus = {}; // Object to store the status of each user by their userId

  // Listen for incoming connections and handle events
  io.on("connection", (socket) => {
    console.log("A new client connected");

    // Send the current statuses of all users to the new client
    socket.emit("initialUserStatus", usersStatus); // Emit current statuses to the newly connected client

    // Listen for the user's id when they connect (via frontend)
    socket.on("userId", (userId) => {
      console.log("User connected with ID:", userId);
      usersStatus[userId] = "available"; // Set initial status to "available"

      // Send initial status to the user
      socket.emit("status", "available");
    });

    // Listen for status updates from the user
    socket.on("message", (userId, message) => {
      console.log(`User ${userId} updated status to:`, message);
      usersStatus[userId] = message;
      io.emit("userStatusUpdate", userId, message); // Broadcast message to all users
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log("A client disconnected");
      // Only update the status of the user who disconnected
      for (let userId in usersStatus) {
        if (usersStatus[userId] === socket.id) {
          usersStatus[userId] = "unavailable"; // Mark user as unavailable
          io.emit("userStatusUpdate", userId, "unavailable"); // Notify all clients
        }
      }
    });
  });

  // Handle Next.js page requests
  server.all("*", (req, res) => {
    return handle(req, res); // Let Next.js handle the requests
  });

  // Start the server on port 3001
  httpServer.listen(3001, (err) => {
    if (err) throw err;
    console.log("> Ready on http://localhost:3001");
  });
});
