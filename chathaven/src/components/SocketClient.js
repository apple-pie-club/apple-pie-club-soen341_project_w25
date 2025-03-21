"use client";

import { useEffect, useState } from "react";
import { useSocket } from "./SocketContext";

const SocketClient = () => {
  const { socket, userId, status, usersStatus, userNames, updateStatus } =
    useSocket();
  const [lastActiveTimeMap, setLastActiveTimeMap] = useState({}); // Store the last active time of each user

  const handleStatusChange = (newStatus) => {
    updateStatus(newStatus); // Call the updateStatus method from context
  };

  // Fetch all users' last active times from the server
  useEffect(() => {
    const fetchLastActiveTimes = async () => {
      try {
        const response = await fetch("/api/lastactivetime");
        const data = await response.json(); // Make sure this returns an array

        // Check if the response is an array before using reduce
        if (Array.isArray(data)) {
          const lastActiveTimeMap = data.reduce((acc, user) => {
            acc[user.userId] = user.lastActiveTime; // Populate the map with userId and their last active time
            return acc;
          }, {});

          setLastActiveTimeMap(lastActiveTimeMap);

          console.log(lastActiveTimeMap); // Log the map for verification
        } else {
          console.error("API response is not an array:", data);
        }
      } catch (error) {
        console.error("Error fetching last active time:", error);
      }
    };

    // Call fetchLastActiveTimes to fetch the data and process it
    fetchLastActiveTimes();
  }, [usersStatus]); // Re-fetch when usersStatus changes (optional)

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
                <li key={userId}>
                  {userNames[userId] || userId}
                  {lastActiveTimeMap[userId] && (
                    <span>
                      {" "}
                      (Last active:{" "}
                      {new Date(lastActiveTimeMap[userId]).toLocaleString()})
                    </span>
                  )}
                </li>
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
