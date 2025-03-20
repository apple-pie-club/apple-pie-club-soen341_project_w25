import { useState, useEffect } from "react";
import "./styles/Dashboard.css";

export default function CreateChannelMenu({ isOpen, onClose, teamMembers, onCreateChannel, teamId }) {
  const [channelName, setChannelName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [creatorId, setCreatorId] = useState("");

  useEffect(() => {
    fetch("/api/user", { credentials: "include" })
      .then(res => res.json())
      .then(data => setCreatorId(data._id))
      .catch(err => console.error("Error fetching user data:", err));
  }, []);

  const handleCreate = () => {
    if (channelName === "") {
      window.alert("Missing Channel Name");
    } else {
      const newChannel = {
        channelName,
        teamId,
        members: [...selectedMembers, creatorId],
      };
      onCreateChannel(newChannel);
      onClose();
    }
  };

  const toggleMemberSelection = (memberId) => {
    if (selectedMembers.includes(memberId)) {
      setSelectedMembers(selectedMembers.filter((id) => id !== memberId));
    } else {
      setSelectedMembers([...selectedMembers, memberId]);
    }
  };

  return (
    isOpen && (
      <div className="menuOverlay">
        <div className="menuContent">
          <div id="createChannelHeader">
            <p>Create Channel</p>
          </div>
          <div className="menuBody">
            <input
              id="channelNameInput"
              type="text"
              value={channelName}
              onChange={(e) => setChannelName(e.target.value)}
              placeholder="Enter channel name"
            />
            <p className="selectMembersText">Select channel members:</p>
            <p id="noteText">You will automatically be admin of this channel</p>
            <div className="userList">
              {teamMembers.map((member) => (
                <div className="user" key={member._id}>
                  <input
                    type="checkbox"
                    checked={selectedMembers.includes(member._id)}
                    onChange={() => toggleMemberSelection(member._id)}
                  />
                  <span className="name">{member.firstname} {member.lastname}</span> <span className="email">{member.email}</span>
                </div>
              ))}
            </div>
          </div>
          <button className="button" onClick={handleCreate}>Create Channel</button>
          <button className="button" onClick={onClose}>Cancel</button>
        </div>
      </div>
    )
  );
}