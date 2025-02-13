import { useState, useEffect } from "react";
import { FaArrowUp } from "react-icons/fa";
// import "./styles/DMsWindow.css";

export default function DMsWindow({ selectedUser }) {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedUser || !selectedUser._id) {
        console.error(" Error: selectedUser is null or missing _id.");
        return;
      }

      const userId = selectedUser._id;
      console.log(` Fetching messages for user: ${userId}`);

      try {
        const response = await fetch(`/api/dmsmessages?userId=${userId}`, {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
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
  }, [selectedUser]);

  // Handle sending messages
  const handleSendMessage = async () => {
    if (!message.trim()) return; // Don't send empty messages

    if (!selectedUser || !selectedUser._id) {
      console.error(" Error: selectedUser is null or missing _id.");
      return;
    }

    const userId = selectedUser._id; // Extract the recipient's user ID
    console.log("Sending message to:", userId);

    try {
      const response = await fetch("/api/dmsmessages", {
        //  No need to pass userId in URL
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, text: message }), //  Send `userId` in the body
      });

      const result = await response.json();

      if (!response.ok) {
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
      <h2>{selectedUser ? selectedUser.email : "Select a user"}</h2>

      <div id="messagesArea">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={
              msg.sender === selectedUser._id
                ? "receivedMessage"
                : "sentMessage"
            }
          >
            {msg.text}
          </div>
        ))}
      </div>

      <div id="messageBar">
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
