import { useState, useEffect, useRef } from "react";
import { FaArrowUp, FaReply } from "react-icons/fa";
import { RxCross2 } from "react-icons/rx";
import "./styles/DMs.css";
import EmojiPicker from "emoji-picker-react";


export default function DMsWindow({ selectedUser, sidebarOpen }) {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [hoveredMessageIndex, setHoveredMessageIndex] = useState(null);
  const [reply, setReply] = useState(null);
  const [users, setUsers] = useState({});
  const listRef = useRef(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);


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
          const errormsg = `Error fetching messages: ${response.status} ${response.statusText}`;
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

  useEffect(() => {
    listRef.current?.lastElementChild?.scrollIntoView()
  }, [messages]);

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
        body: JSON.stringify({ userId, text: message, reply: reply }), //  Send `userId` in the body
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
      setReply(null);
    } catch (error) {
      console.error("Error sending message:", error);
      alert("An error occurred. Please try again.");
    }
  };
  const handleEmojiSelect = (emojiObject) => {
    setMessage((prevMessage) => prevMessage + emojiObject.emoji);
  };
  
  return (
    <div id="DmMessageWindow" className={sidebarOpen ? "shifted" : "fullWidth"}>

      <div id="DmMessagesArea" className={sidebarOpen ? "shifted" : "fullWidth"} ref={listRef}>
        {messages.map((msg, index) => {
          const senderName = users[msg.sender] || "Unknown User";
          const isHovered = hoveredMessageIndex === index;
          const replyMessage = msg.reply;
          return (<div className="message" key={index} onMouseEnter={() => setHoveredMessageIndex(index)} onMouseLeave={() => setHoveredMessageIndex(null)}>
            {replyMessage &&
              (
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: msg.sender !== selectedUser._id ? 'flex-end' : 'flex-start' }}>

                  {msg.sender === selectedUser._id &&
                    <div className="replyMessageIndicatorReceived"></div>
                  }
                  <div className={`replyMessage ${msg.sender !== selectedUser._id ? 'sent' : 'received'}`} style={{ justifyContent: msg.sender !== selectedUser._id ? 'flex-end' : 'flex-start' }}>
                    <p>{users[replyMessage.sender]}: <br />{replyMessage.text}</p>
                  </div>

                  {msg.sender !== selectedUser._id &&
                    <div className="replyMessageIndicatorSent"></div>
                  }
                </div>
              )}
            <div className="messageContent" style={{ justifyContent: msg.sender !== selectedUser._id ? 'flex-end' : 'flex-start' }}>
              {isHovered && msg.sender !== selectedUser._id && (
                <div className="actionBox">
                  <FaReply className="replyButton" onClick={() => setReply(msg)} />
                </div>
              )}

              <div key={index} className={msg.sender !== selectedUser._id ? "sentMessage" : "receivedMessage"} style={{ marginTop: replyMessage ? '0px' : '10px' }}>
                <span>{msg.sender === selectedUser._id && <strong>{senderName}: <br /></strong>}{msg.text}</span>
              </div>
              {isHovered && msg.sender === selectedUser._id && (
                <div className="actionBox">
                  <FaReply className="replyButton" onClick={() => setReply(msg)} />
                </div>
              )}
            </div>
          </div>);
        })}
      </div>

      <div id="DmMessageBar" className={sidebarOpen ? "shifted" : "fullWidth"}>
        {reply && (
          <div className="DMreplyingBox">
            <span>Replying to {users[reply.sender]}:<p>{reply.text.substring(0, 70)}{reply.text.length > 71 ? "..." : ""}</p></span>
            <RxCross2 className="closeReply" onClick={() => setReply(null)} />
          </div>
        )}
        {/* Emoji Picker Button */}
        <button
          onClick={() => setShowEmojiPicker((prev) => !prev)}
          style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: "20px", marginRight: "5px" }}
        >
          😀
        </button>

        {/* Emoji Picker Popup */}
        {showEmojiPicker && (
          <div style={{ position: "absolute", bottom: "50px", zIndex: 100 }}>
            <EmojiPicker
              onEmojiClick={handleEmojiSelect}
              previewConfig={{ showPreview: false }}
              searchDisabled={true}
            />
          </div>)}
        <input
          type="text"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
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
