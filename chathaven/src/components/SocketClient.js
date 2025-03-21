import { useEffect, useState } from "react";
import io from "socket.io-client";

const SocketClient = () => {
  const [status, setStatus] = useState("disconnected");
  const [socket, setSocket] = useState(null);
  const [usersStatus, setUsersStatus] = useState({});
  const [userId, setUserId] = useState(null);

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
    <div>
      <p>User Status: {status}</p>
      <button onClick={() => updateStatus("available")}>Set Available</button>
      <button onClick={() => updateStatus("unavailable")}>
        Set Unavailable
      </button>
      <h3>All Users' Statuses</h3>
      <div style={{ display: "flex" }}>
        {/* Available Users Column */}
        <div>
          <h4>Available</h4>
          <ul>
            {Object.keys(usersStatus).map((userId) =>
              usersStatus[userId] === "available" ? (
                <li key={userId}>{userId}</li>
              ) : null
            )}
          </ul>
        </div>

        {/* Away Users Column */}
        <div>
          <h4>Away</h4>
          <ul>
            {Object.keys(usersStatus).map((userId) =>
              usersStatus[userId] === "away" ? (
                <li key={userId}>{userId}</li>
              ) : null
            )}
          </ul>
        </div>

        {/* Unavailable Users Column */}
        <div>
          <h4>Unavailable</h4>
          <ul>
            {Object.keys(usersStatus).map((userId) =>
              usersStatus[userId] === "unavailable" ? (
                <li key={userId}>{userId}</li>
              ) : null
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SocketClient;
