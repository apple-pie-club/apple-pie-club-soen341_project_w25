import { useState, useEffect, useRef } from "react";
import { FaArrowUp, FaUserSlash } from "react-icons/fa";
import { RxCross2 } from "react-icons/rx";
import { HiQuestionMarkCircle } from "react-icons/hi2";
import { MdExitToApp } from "react-icons/md";
import { FaReply } from "react-icons/fa";
import "./styles/Dashboard.css";


export default function CMsWindow({ selectedChannel, messageAreaClass, onLeaveChannel }) {
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");
    const [loggedInUserId, setLoggedInUserId] = useState(null);
    const [users, setUsers] = useState({});
    const [members, setMembers] = useState([]);
    const [isChannelAdmin, setIsChannelAdmin] = useState(false);
    const [isChannelMemberListOpen, setIsChannelMemberListOpen] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [showError, setShowError] = useState(false);
    const [hoveredMessageIndex, setHoveredMessageIndex] = useState(null);
    const [reply, setReply] = useState(null);
    const listRef = useRef(null);
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

    useEffect(() => {
        listRef.current?.lastElementChild?.scrollIntoView()
    }, [messages]);
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
                body: JSON.stringify({ channelId, text: message , reply: reply}),
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
            setReply(null);
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

    const showSuccessMessage = ()=>{
        setShowSuccess(true);
    
        setTimeout(() =>{
          setShowSuccess(false);
        }, 3000);
      };

      const showErrorMessage = (message) => {
        setError(message);
        setShowError(true);
        
        setTimeout(() => {
          setShowError(false);
        }, 3000);
      };


    const handleLeaveChannel = async() =>{
        if(!selectedChannel || !selectedChannel._id){
            console.error("Error: selectedChannel is null or missing _id.");
            return;
        }

        try{
            const response = await fetch("/api/channels", {
                method: "DELETE",
                credentials: "include",
                headers: { "Content-Type": "application/json"},
                body: JSON.stringify({ channelId: selectedChannel._id}),
            });

            const result = await response.json();
            if(!response.ok){
                console.error(`Error leaving channel: ${result.error}`);
                showErrorMessage(result.error);
                return;
            }

            showSuccessMessage();

            setMembers((prevMembers) => prevMembers.filter((member => member!== loggedInUserId)));

            onLeaveChannel(selectedChannel._id);
            setIsChannelMemberListOpen(false);
        } catch (error){
            console.error("Error leaving channel: ", error);
            showErrorMessage("An error occurred. Please try again.");
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
                                (<button className="leaveButton" onClick={handleLeaveChannel} title="Leave channel">
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
            <div id="messagesArea" className={messageAreaClass} ref={listRef}>
                {messages.map((msg, index) => {
                    const senderName = users[msg.sender] || "Unknown User";
                    const isHovered = hoveredMessageIndex === index;
                    const replyMessage = msg.reply;
                    return (
                        <div className="message" key={index} onMouseEnter={() => setHoveredMessageIndex(index)} onMouseLeave={() => setHoveredMessageIndex(null)}>
                            {replyMessage &&
                            (
                            <div style={{display:'flex', flexDirection:'row', alignItems:'center', justifyContent: msg.sender === loggedInUserId ? 'flex-end' : 'flex-start' }}>

                                {msg.sender!==loggedInUserId &&
                                    <div className="replyMessageIndicatorReceived"></div>
                                }
                                <div className={`replyMessage ${msg.sender === loggedInUserId ? 'sent' : 'received'}`} style={{ justifyContent: msg.sender === loggedInUserId ? 'flex-end' : 'flex-start' }}>
                                    <p>{users[replyMessage.sender]}: <br/>{replyMessage.text}</p>
                                </div>

                                {msg.sender===loggedInUserId &&
                                    <div className="replyMessageIndicatorSent"></div>
                                }
                            </div>
                            )}
                            <div className="messageContent" style={{ justifyContent: msg.sender === loggedInUserId ? 'flex-end' : 'flex-start' }}>
                                {isHovered && msg.sender === loggedInUserId && (
                                <div className="actionBox">
                                    <FaReply className="replyButton" onClick={()=>setReply(msg)}/>
                                </div>
                                )}
                                
                                <div key={index} className={msg.sender === loggedInUserId ? "sentMessage" : "receivedMessage"} style={{marginTop: replyMessage? '0px': '10px'}}>
                                    <span>{msg.sender !== loggedInUserId && <strong>{senderName}: <br/></strong>} {msg.text}</span>
                                </div>
                                {isHovered && msg.sender !== loggedInUserId && (
                                    <div className="actionBox">
                                        <FaReply className="replyButton" onClick={()=>setReply(msg)}/>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Message Input */}
            <div id="messageBar" className={messageAreaClass}>
                <HiQuestionMarkCircle id="openMemberListButton" onClick={handleOpenChannelMemberList}/>
                {reply && (
                    <div className="replyingBox">
                        <span>Replying to {users[reply.sender]}:<p>{reply.text.substring(0,70)}{reply.text.length>71?"...":""}</p></span>
                        <RxCross2 className="closeReply" onClick={()=> setReply(null)} />
                    </div>
                )
                }
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

            {showError && 
            <div className={`alert ${showError ? "show" : ""}`}>
                <p className="error">{error}</p>
            </div>
            }

            {showSuccess &&
            <div className={`success ${showSuccess ? "show" : ""}`}>
                <p className="successMessage">Successfully left channel.</p>
            </div>
            }

        </div>
    );
}
