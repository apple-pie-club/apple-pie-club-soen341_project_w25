import { useState, useEffect } from "react";
import { FaArrowUp } from "react-icons/fa";

export default function CMsWindow({ selectedChannel }) {

    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");
    const [loggedInUserId, setLoggedInUserId] = useState(null);
    const [users, setUsers] = useState({});

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch("/api/users", {
                    method: "GET",
                    credentials: "include",
                });
    
                if (!response.ok) throw new Error("Failed to fetch users");
    
                const data = await response.json();
                console.log("All Users:", data);
    
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

    // Fetching logged in user ID
    useEffect(() => {
        const fetchUserId = async () => {
            try {
                const response = await fetch("/api/user", {
                    method: "GET",
                    credentials: "include",
                });

                if (!response.ok) throw new Error("Failed to fetch user ID");

                const data = await response.json();
                console.log("Logged-in User ID:", data._id);
                setLoggedInUserId(data._id);
            } catch (error) {
                console.error("Error fetching user ID:", error);
            }
        };

        fetchUserId();
    }, []);
    

    // Fetching Messages from API
    useEffect (() => {
        const fetchMessages = async () => {
            if(!selectedChannel || !selectedChannel._id) {
                console.error(" Error: selectedChannel is null or missing _id. (line 12 - CMsWindow)");
                return;
            }
            setMessages([]);
            const channelId = selectedChannel._id;
            console.log(`Fetching messages for channel: ${channelId}`);
    
            try {
                const response = await fetch(`/api/channelsmessages?channelId=${channelId}`, {
                    method: "GET",
                    credentials: "include",
                    headers: { "Content-Type" : "application/json"},
                });
    
                if(!response.ok) {
                    const errormsg = ` Failed to fetch messages: ${response.status} ${response.statusText}`;
                    console.error(errormsg);
                    throw new Error(errormsg);
                }
    
                const data = await response.json();
                console.log("Messages fetched:", data);
                setMessages(data);
            } catch (error) {
                console.error(" Error fetching messages:", error.message || error);
            }
        };
        
        fetchMessages();
    }, [selectedChannel]);

    // Handle Sending Messages
    const handleSendMessage = async () => { 
        if (!message.trim()) return; // Don't send empty messages

        if (!selectedChannel || !selectedChannel._id) {
            console.error(" Error: selectedChannel is null or missing _id.");
            return;
        }
        

        const channelId = selectedChannel._id; //get channel ID
        console.log("Sending message to: ", channelId);

        try{ 
            const response = await fetch("/api/channelsmessages", {
                method: "POST",
                credentials: "include",
                headers: {"Content-Type" : "application/json"},
                body: JSON.stringify({channelId, text: message}), //send channelId in body
            });
            

            const result = await response.json(); // takes a response stream
            console.log(result); 
            if(!response.ok){
                console.error(` Error sending message: ${result.error}`);
                alert(`Error: ${result.error}`);
                return;
            }

            console.log("Message sent successfully:", result.newMessage);
            setMessages((prevMessages) => [...prevMessages, result.newMessage]); //  Append new message
            setMessage(""); //  Clear input after sending
        } catch (error) {
            console.error("Error sending message:", error);
            alert("An error occurred. Please try again.");
        }
    };

    

    return (
        <div id="messageWindow">
            <h2>
                {selectedChannel ? selectedChannel.name : "Select a channel"}
            </h2>

            <div id="messagesArea">
            {messages.map((msg, index) => {
                    const senderName = users[msg.sender] || "Unknown User";
                    
                    return (
                        <div key={index} className={msg.sender === loggedInUserId ? "sentMessage" : "receivedMessage"}>
                            <strong>{senderName}:</strong> {msg.text}
                        </div>
                    );
                })}
            </div>

            <div id="messageBar">
                <input
                type = "text"
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