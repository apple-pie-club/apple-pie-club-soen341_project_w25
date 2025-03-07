import { useState, useEffect } from "react";
import "./styles/DMs.css"
const CreateDMMenu = ({ isOpen, onClose }) => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");

  // Fetch users when the menu is opened
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/users");

        if (!response.ok) {
          throw new Error(
            `Failed to fetch users: ${response.status} ${response.statusText}`
          );
        }

        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  // Handle form submission to create a DM
  const handleSubmit = async () => {
    console.log("Selected User ID:", selectedUser); // Debug

    if (!selectedUser) {
      alert("Please select a user.");
      return;
    }

    try {
      const response = await fetch("/api/dms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ selectedUserId: selectedUser }),
      });

      const result = await response.json();

      if (response.ok) {
        alert("DM created successfully!");
        onClose();
        window.location.reload();
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error("Error creating DM:", error);
      alert("An error occurred. Please try again.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="menuOverlay">
      <div className="menuContent">
        <p id="createDMHeader">Create a Direct Message</p>

        <label htmlFor="userSelect">Select a user:</label>
        <select
          id="userSelect"
          value={selectedUser}
          onChange={(e) => setSelectedUser(e.target.value)}
        >
          <option value="">-- Select a user --</option>
          {users.map((user) => (
            <option key={user._id} value={user._id}>
              {user.firstname} {user.lastname} ({user.email})
            </option>
          ))}
        </select>

        <button id="createDMButton" className="button" onClick={handleSubmit}>
          Start DM
        </button>
        <button id="cancelButton" className="button" onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default CreateDMMenu;
