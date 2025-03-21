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

  // Listen for incoming connections and handle events
  io.on("connection", (socket) => {
    console.log("A new client connected");

    // Send a message to the client when they connect
    socket.emit("status", "available");

    // Listen for messages from the client
    socket.on("message", (message) => {
      console.log("Received message:", message);
      io.emit("status", message); // Broadcast message to all clients
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log("A client disconnected");
      io.emit("status", "unavailable"); // Notify all clients about the disconnection
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
