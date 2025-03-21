"use client";

import { useEffect, useState } from "react";
import { useSocket } from "./SocketContext";

const SocketClient = () => {
  const { socket, userId, status, usersStatus, userNames, updateStatus } =
    useSocket();

  const handleStatusChange = (newStatus) => {
    updateStatus(newStatus); // Call the updateStatus method from context
  };

  useEffect(() => {
    if (socket && userId) {
      socket.emit("message", userId, "available"); // Emit the 'available' status when the user connects
    }
  }, [socket, userId]);

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
                <li key={userId}>{userNames[userId] || userId}</li>
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
                <li key={userId}>{userNames[userId] || userId}</li>
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
                <li key={userId}>{userNames[userId] || userId}</li>
              ) : null
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SocketClient;
