import { createContext, useContext, useState, useEffect } from "react";
import io from "socket.io-client";

// Create a context to store socket and user data
const SocketContext = createContext();

export const useSocket = () => {
  return useContext(SocketContext); // Custom hook to access the socket context
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [userId, setUserId] = useState(null);
  const [status, setStatus] = useState("disconnected");
  const [usersStatus, setUsersStatus] = useState({});
  const [userNames, setUserNames] = useState({});

  useEffect(() => {
    // Step 1 is to fetch the user Id from the API
    const fetchUserId = async () => {
      try {
        const response = await fetch("/api/user", {
          method: "GET",
          credentials: "include",
        });
        const data = await response.json();
        setUserId(data._id); // Setting the userId
      } catch (error) {
        console.error("Error fetching user data in SocketClient: ", error);
      }
    };

    fetchUserId();

    // Create a socket connection to the WebSocket server
    const socketIo = io("http://localhost:3001"); // Adjust the URL if deploying

    // Set the socket instance when it's connected
    setSocket(socketIo);

    // Listen for initial user statuses when the client connects
    socketIo.on("initialUserStatus", (statusUpdates) => {
      console.log("Received initial user statuses:", statusUpdates);
      setUsersStatus(statusUpdates); // Set all users' statuses initially
    });

    // Send the userId to the server upon connection
    if (userId) {
      console.log(
        "The userId sent to the server upon connection from SocketClient is ",
        userId
      );
      socketIo.emit("userId", userId); // Emit the userId to associate it with the WebSocket connection
    }

    // Listen for status updates from the server
    socketIo.on("status", (newStatus) => {
      console.log("Status received from server:", newStatus);
      setStatus(newStatus); // Update the status state with the new status
    });

    // Listen for status updates from other users
    socketIo.on("userStatusUpdate", (userId, newStatus) => {
      console.log(`User status for ${userId} is updated:`, newStatus);
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
  }, [userId]);

  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        const response = await fetch("/api/users", { method: "GET" });
        const data = await response.json();
        const usersMap = {};
        data.forEach((user) => {
          usersMap[user._id] = `${user.firstname} ${user.lastname}`;
        });
        setUserNames(usersMap); // Store all user names in state
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchAllUsers();
  }, []);

  // useEffect to send status updates to the server whenever status changes
  useEffect(() => {
    if (userId) {
      if (socket && socket.connected) {
        console.log("Emitting new status:", status);
        socket.emit("message", userId, status); // Send the updated status to the server
      }
    }
  }, [status, socket]); // Trigger this whenever 'status' or 'socket' changes

  // Function to send a user status update
  const updateStatus = (newStatus) => {
    if (userId) {
      if (socket && socket.connected) {
        socket.emit("message", userId, newStatus); // Send status to server
        console.log(`Status updated to: ${newStatus}`);
      }
    }
  };

  return (
    <SocketContext.Provider
      value={{ socket, userId, status, usersStatus, userNames, updateStatus }}
    >
      {children}
    </SocketContext.Provider>
  );
};
