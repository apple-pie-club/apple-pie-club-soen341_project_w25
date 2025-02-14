import { useState, useEffect } from "react";

const CreateTeamMenu = ({ isOpen, onClose, onCreateTeam }) => {
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [teamName, setTeamName] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetch("/api/users")
        .then((res) => res.json())
        .then((data) => setUsers(data))
        .catch((error) => console.error("Error fetching users:", error));
    }
  }, [isOpen]);

  const handleUserSelection = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSubmit = async () => {
    if (!teamName || selectedUsers.length === 0) {
      alert("Please enter a team name and select at least one user.");
      return;
    }

    try {
      const response = await fetch("/api/teams", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ teamName, members: selectedUsers }),
      });

      const result = await response.json();

      if (response.ok) {
        alert("Team created successfully!");
        onCreateTeam(result.team);
        onClose();
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error("Error creating team:", error);
      alert("An error occurred. Please try again.");
    }
  };

  if (!isOpen) return null;

    return (
        <div className="menuOverlay">
            <div className="menuContent">
                <p id="createTeamHeader">CREATE A TEAM</p>
                <input
                    id="teamNameInput"
                    type="text"
                    placeholder="Enter a team name..."
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                />
                <p className="selectMembersText">Select team members: </p>
                <p id="noteText">You will automatically be a member of this team</p>
                <div className="userList">
                    {users.map((user)=>(
                        <div className="user" key={user._id}>
                            <input
                                className="checkbox"
                                type="checkbox"
                                checked={selectedUsers.includes(user._id)}
                                onChange={() => handleUserSelection(user._id)}
                            />
                            <span className="name">{user.firstname} {user.lastname}</span>{" "} <span className="email">{user.email}</span>
                        </div>
                    ))}
                </div>
                <button id="createTeamButton" className="button" onClick={handleSubmit}>Create Team</button>
                <button id="cancelButton" className="button" onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
};

export default CreateTeamMenu;
