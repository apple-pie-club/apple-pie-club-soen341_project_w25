import { useState, useEffect } from "react";
import { FaArrowUp, FaUserSlash } from "react-icons/fa";
import { RxCross2 } from "react-icons/rx";
import { HiQuestionMarkCircle } from "react-icons/hi2";
import { MdExitToApp } from "react-icons/md";
import "./styles/Dashboard.css";


export default function CMsWindow({ selectedChannel, messageAreaClass }) {
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");
    const [loggedInUserId, setLoggedInUserId] = useState(null);
    const [users, setUsers] = useState({});
    const [members, setMembers] = useState([]);
    const [isChannelAdmin, setIsChannelAdmin] = useState(false);
    const [isChannelMemberListOpen, setIsChannelMemberListOpen] = useState(false);
    // Fetch all users
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch("/api/users", { method: "GET", credentials: "include" });
                if (!response.ok) throw new Error("Failed to fetch users");

                const data = await response.json();
                console.log("Fetched Users:", data);

                const usersMap = {};
                data.forEach(user => {
                    usersMap[user._id] = user.firstname && user.lastname
                        ? `${user.firstname} ${user.lastname}`
                        : user.email;
                });

                setUsers(usersMap);
            } catch (error) {
                console.error("Error fetching users:", error);
            }
        };

        fetchUsers();
    }, []);

    // Fetch logged-in user ID & admin status
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await fetch("/api/user", { method: "GET", credentials: "include" });
                if (!response.ok) throw new Error("Failed to fetch user data");

                const data = await response.json();
                console.log("Logged-in User:", data);
                setLoggedInUserId(data._id);

                if (data.isChannelAdmin) {
                    setIsChannelAdmin(true);
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
            }
        };

        fetchUserData();
    }, []);

    // Fetch Channel Members & Prevent Duplicate Admins
    useEffect(() => {
        if (selectedChannel && selectedChannel._id) {
            console.log("Selected Channel:", selectedChannel);
            // Ensure the admin user appears **only once**
            const uniqueMembers = [...new Set(selectedChannel.members || [])];
            setMembers(uniqueMembers);
        } else {
            setMembers([]);
        }
    }, [selectedChannel, users]); // Re-run when users change

    // Fetch Messages
    useEffect(() => {
        const fetchMessages = async () => {
            if (!selectedChannel || !selectedChannel._id) {
                console.error(" Error: selectedChannel is null or missing _id.");
                return;
            }

            setMessages([]);
            const channelId = selectedChannel._id;
            console.log(`Fetching messages for channel: ${channelId}`);

            try {
                const response = await fetch(`/api/channelsmessages?channelId=${channelId}`, {
                    method: "GET",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                });

                if (!response.ok) throw new Error(`Failed to fetch messages: ${response.status}`);

                const data = await response.json();
                console.log("Messages fetched:", data);
                setMessages(data);
            } catch (error) {
                console.error("Error fetching messages:", error);
            }
        };

        fetchMessages();
    }, [selectedChannel]);

    //  Handle Sending Messages
    const handleSendMessage = async () => {
        if (!message.trim()) return;

        if (!selectedChannel || !selectedChannel._id) {
            console.error("Error: selectedChannel is null or missing _id.");
            return;
        }

        const channelId = selectedChannel._id;
        console.log("Sending message to: ", channelId);

        try {
            const response = await fetch("/api/channelsmessages", {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ channelId, text: message }),
            });

            const result = await response.json();

            if (!response.ok) {
                console.error(`Error sending message: ${result.error}`);
                alert(`Error: ${result.error}`);
                return;
            }

            console.log("Message sent successfully:", result.newMessage);
            setMessages((prevMessages) => [...prevMessages, result.newMessage]);
            setMessage("");
        } catch (error) {
            console.error("Error sending message:", error);
            alert("An error occurred. Please try again.");
        }
    };

    const handleOpenChannelMemberList = () =>{
        setIsChannelMemberListOpen((prev) => !prev);
    };

    // Handle Banning Users (Admin Only)
    const handleBanUser = async (userId) => {
        if (!selectedChannel || !selectedChannel._id) {
            console.error("Cannot ban user: selectedChannel is null or missing _id.");
            return;
        }

        if (userId === loggedInUserId) {
            alert(" You cannot ban yourself!");
            return;
        }

        console.log(` Attempting to ban user ${userId} from channel ${selectedChannel._id}`);

        try {
            const response = await fetch("/api/channels", {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "banUser", channelId: selectedChannel._id, userIdToBan: userId }),
            });

            const result = await response.json();

            if (!response.ok) {
                console.error(` Error banning user: ${result.error}`);
                alert(`Error: ${result.error}`);
                return;
            }

            console.log(` User ${userId} banned successfully!`);
            setMembers(prevMembers => prevMembers.filter(member => member !== userId));

        } catch (error) {
            console.error(" Error banning user:", error);
            alert("An error occurred. Please try again.");
        }
    };

    return (
        <div id="messageWindow">
            <div id="channelSidebarMembersOverlay"style={{ display: isChannelMemberListOpen ? "flex" : "none" }}>
            <div id="channelSidebarMembers" className={isChannelMemberListOpen? "open":"closed"}>
                <h3>Channel Members <RxCross2 className="closeButton" onClick={handleOpenChannelMemberList} /></h3> 
                <ul>
                    {members.length > 0 ? (
                        members.map((memberId) => (
                            <li key={memberId} className="memberListItem">
                                <span>{users[memberId] || `Unknown User (${memberId})`}</span>
                                {loggedInUserId === memberId ? 
                                (<button className="leaveButton">
                                    <MdExitToApp /> Leave
                                </button>) :
                            
                                (isChannelAdmin && (
                                    <button
                                        className="banButton"
                                        onClick={() => handleBanUser(memberId)}
                                        title="Ban user"
                                    >
                                        <FaUserSlash /> Ban
                                    </button>
                                ))}
                            </li>
                        ))
                    ) : (
                        <li>No members found.</li>
                    )}
                </ul>
            </div>
            </div>


            {/* Messages Area */}
            <div id="messagesArea" className={messageAreaClass}>
                {messages.map((msg, index) => {
                    const senderName = users[msg.sender] || "Unknown User";
                    return (
                        <div key={index} className={msg.sender === loggedInUserId ? "sentMessage" : "receivedMessage"}>
                            <strong>{senderName}:</strong> {msg.text}
                        </div>
                    );
                })}
            </div>

            {/* Message Input */}
            <div id="messageBar" className={messageAreaClass}>
                <HiQuestionMarkCircle id="openMemberListButton" onClick={handleOpenChannelMemberList}/>
                <input
                    type="text"
                    placeholder="Type a message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                        }
                    }}
                />
                <button onClick={handleSendMessage}>
                    <FaArrowUp />
                </button>
            </div>
        </div>
    );
}
