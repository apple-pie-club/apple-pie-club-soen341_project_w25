import { useState, useEffect } from "react";
import { FaPlus, FaUserPlus } from "react-icons/fa";

export default function DashboardPage({ user }) {
    const [channels, setChannels] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedChannel, setSelectedChannel] = useState("");
    const [selectedUser, setSelectedUser] = useState("");

    useEffect(() => {
        fetchChannels();
        fetchUsers();
    }, []);

    const fetchChannels = async () => {
        const response = await fetch("/api/channels");
        const data = await response.json();
        setChannels(data);
    };

    const fetchUsers = async () => {
        const response = await fetch("/api/auth/users");
        const data = await response.json();
        setUsers(data);
    };

    const handleCreateChannel = async () => {
        const channelName = prompt("Enter channel name:");
        if (!channelName) return;

        const response = await fetch("/api/channels", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: channelName }),
        });

        if (response.ok) {
            alert("Channel created successfully!");
            fetchChannels();
        } else {
            alert("Error creating channel");
        }
    };

    const handleAddUserToChannel = async () => {
        if (!selectedChannel || !selectedUser) {
            alert("Please select a channel and a user.");
            return;
        }

        const response = await fetch(`/api/channels/${selectedChannel}/addUser`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: selectedUser }),
        });

        if (response.ok) {
            alert("User added successfully!");
            fetchChannels();
        } else {
            alert("Error adding user");
        }
    };

    return (
        <div id="dashboardContainer">
            <div id="sidebar">
                <ul id="channelList">
                    <li id="channelHeader">
                        CHANNELS
                        {user.isGlobalAdmin && (
                            <div id="addChannel" onClick={handleCreateChannel}>
                                <FaPlus /> Add Channel
                            </div>
                        )}
                    </li>
                    {channels.map(channel => (
                        <li key={channel._id} className="channelName">
                            {channel.name}
                            {user.isGlobalAdmin && (
                                <FaUserPlus
                                    onClick={() => setSelectedChannel(channel._id)}
                                    style={{ marginLeft: "10px", cursor: "pointer" }}
                                />
                            )}
                        </li>
                    ))}
                </ul>
            </div>

            {user.isGlobalAdmin && (
                <div id="userSelection">
                    <h3>Add User to Channel</h3>
                    <select onChange={(e) => setSelectedUser(e.target.value)}>
                        <option value="">Select User</option>
                        {users.map(user => (
                            <option key={user._id} value={user._id}>{user.email}</option>
                        ))}
                    </select>
                    <button onClick={handleAddUserToChannel}>Add User</button>
                </div>
            )}
        </div>
    );
}
