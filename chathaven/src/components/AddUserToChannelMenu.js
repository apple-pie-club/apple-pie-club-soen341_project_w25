import { useState, useEffect } from "react";

export default function AddUserToChannelMenu({ 
  isOpen, 
  onClose, 
  selectedChannel, 
  selectedTeam, 
  onAddUser 
}) {
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");

  useEffect(() => {
    if (isOpen && selectedTeam && selectedChannel) {
      fetch(`/api/available-users?teamId=${selectedTeam._id}&channelId=${selectedChannel._id}`, {
        method: "GET",
        credentials: "include",
      })
        .then((res) => res.json())
        .then((data) => {
          console.log("Available Users for channel:", data);
          setAvailableUsers(data);
        })
        .catch((error) => console.error("Error fetching available users:", error));
    }
  }, [isOpen, selectedTeam, selectedChannel]);

  if (!isOpen) return null;

  return (
    <div className="menuOverlay">
      <div className="menuContent">
        <h3 id="createChannelHeader">Add User to {selectedChannel?.name}</h3>

        {availableUsers.length > 0 ? (
          <>
            <select
              id="teamNameInput"
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
            >
              <option value="">-- Select a user --</option>
              {availableUsers.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.firstname} {user.lastname} ({user.email})
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
                  if (selectedUser) {
                    onAddUser(selectedChannel._id, selectedUser);
                  } else {
                    alert("Please select a user.");
                  }
                }}
              >
                Confirm
              </button>
              
            </div>
          </>
        ) : (
            <>
          <p id="noteText">
            No users available to add.
          </p>
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