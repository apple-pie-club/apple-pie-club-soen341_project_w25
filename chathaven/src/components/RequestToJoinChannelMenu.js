import { useState, useEffect } from "react";

export default function RequestToJoinChannelMenu({ 
  isOpen, 
  onClose, 
  selectedTeam, 
  userId 
}) {
  const [availableChannels, setAvailableChannels] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState("");

  useEffect(() => {
    if (isOpen && selectedTeam && userId) {
      console.log("Modal Opened - Fetching Available Channels...");
      console.log("Selected Team ID:", selectedTeam?._id);
      console.log("User ID:", userId);

      fetch(`/api/team-channels?teamId=${selectedTeam._id}`, {
        method: "GET",
        credentials: "include",
      })
        .then((res) => {
          console.log("Fetching team channels...");
          return res.json();
        })
        .then((teamChannels) => {
          console.log("Team Channels Received:", teamChannels);

          // Fetch user channels
          fetch(`/api/user-channels`, {
            method: "GET",
            credentials: "include",
          })
            .then((res) => {
              console.log("Fetching user channels...");
              return res.json();
            })
            .then((userChannels) => {
              console.log("User Channels Received:", userChannels);

              // Convert userChannels to a Set for faster lookup
              const userChannelIds = new Set(userChannels.map(channel => channel._id));
              console.log("User is part of these channels:", [...userChannelIds]);

              // Filter channels to exclude ones the user is already a member of
              const filteredChannels = teamChannels.filter(channel => !userChannelIds.has(channel._id));

              console.log("Available Channels for Request:", filteredChannels);
              setAvailableChannels(filteredChannels);
            })
            .catch((error) => console.error("Error fetching user channels:", error));
        })
        .catch((error) => console.error("Error fetching team channels:", error));
    }
  }, [isOpen, selectedTeam, userId]);

  if (!isOpen) return null;

  return (
    <div className="menuOverlay">
      <div className="menuContent">
        <h3 id="createChannelHeader">Request to Join a Channel</h3>

        {availableChannels.length > 0 ? (
          <>
            <select
              id="teamNameInput"
              value={selectedChannel}
              onChange={(e) => setSelectedChannel(e.target.value)}
            >
              <option value="">-- Select a channel --</option>
              {availableChannels.map((channel) => (
                <option key={channel._id} value={channel._id}>
                  {channel.name}
                </option>
              ))}
            </select>
            <div className="buttonContainer">
              <button className="button" onClick={onClose}>
                Close
              </button>
            <button
                className="button"
                onClick={() => {
                    if (!selectedChannel) {
                      alert("Please select a channel.");
                      return;
                    }

                    fetch("/api/channel-requests", {
                        method: "POST",
                        credentials: "include",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ channelId: selectedChannel, teamId: selectedTeam._id }),
                    })
                    .then((res) => res.json())
                    .then((data) => {
                        alert("The request has been sent to the channel admin.");
                        onClose();
                    })
                    .catch((error) => console.error("Error sending request:", error));
                }}
            >
            Confirm
            </button>
              
            </div>
          </>
        ) : (
          <>
            <p id="noteText">No channels available to join.</p>
            <div className="buttonContainer">
              <button className="button" onClick={onClose}>
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}