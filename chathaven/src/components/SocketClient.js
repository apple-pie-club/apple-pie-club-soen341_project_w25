import { useEffect, useState } from "react";
import io from "socket.io-client";

const SocketClient = () => {
  const [status, setStatus] = useState("disconnected");
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Create a socket connection to the WebSocket server
    const socketIo = io("http://localhost:3001"); // Adjust the URL if deploying

    // Set the socket instance when it's connected
    setSocket(socketIo);

    // Listen for status updates from the server
    socketIo.on("status", (newStatus) => {
      console.log("Status received from server:", newStatus);
      setStatus(newStatus); // Update the status state with the new status
    });

    // Listen for status updates from other users
    socketIo.on("userStatusUpdate", (userId, newStatus) => {
      console.log("User status updated:", userId, newStatus);
      setUsersStatus((prevState) => ({
        ...prevState,
        [userId]: newStatus, // Update the status of the user in the list
      }));
    });

    // Handle WebSocket errors
    socketIo.on("connect_error", (error) => {
      console.error("Connection error:", error);
    });

    // Cleanup when the component is unmounted
    return () => {
      if (socketIo) {
        socketIo.disconnect();
        console.log("Disconnected from WebSocket");
      }
    };
  }, []); // To ensure this runs only once

  // useEffect to send status updates to the server whenever status changes
  useEffect(() => {
    if (socket && socket.connected) {
      console.log("Emitting new status:", status);
      socket.emit("message", status); // Send the updated status to the server
    }
  }, [status, socket]); // Trigger this whenever 'status' or 'socket' changes

  // Function to send a user status update
  const updateStatus = (newStatus) => {
    if (socket && socket.connected) {
      socket.emit("message", newStatus); // Send status to server
      console.log(`Status updated to: ${newStatus}`);
    }
  };

  return (
    <div>
      <p>User Status: {status}</p>
      <button onClick={() => updateStatus("available")}>Set Available</button>
      <button onClick={() => updateStatus("unavailable")}>
        Set Unavailable
      </button>
    </div>
  );
};

export default SocketClient;
