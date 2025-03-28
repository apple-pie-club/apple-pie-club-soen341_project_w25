import { useState, useEffect, useRef, useCallback } from "react";
import { FaUserSlash, FaReply } from "react-icons/fa";
import { RxCross2 } from "react-icons/rx";
import { HiQuestionMarkCircle } from "react-icons/hi2";
import "./styles/Dashboard.css";
import RequestToJoinChannelMenu from "./RequestToJoinChannelMenu";
import EmojiPicker from "emoji-picker-react";
import Webcam from "react-webcam";
import { FaArrowUp, FaCamera } from "react-icons/fa6";
import { MdExitToApp, MdEmojiEmotions, MdCamera } from "react-icons/md";

export default function CMsWindow({ selectedTeam, selectedChannel, messageAreaClass, onLeaveChannel}) {
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
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
    const inputRef = useRef(null);
    const [user, setUser] = useState(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showReactionPicker, setShowReactionPicker] = useState(null);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const camRef = useRef(null);
    const [imgSrc, setImgSrc] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

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
                setUser(data);

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
      if(messages.length > 0 && inputRef.current){
        inputRef.current?.scrollIntoView({behavior: "smooth"});
      }
      }, [messages.length]);
    //  Handle Sending Messages
    const handleSendMessage = async () => {
        if (!imgSrc && !message.trim()) return;

        if (!selectedChannel || !selectedChannel._id) {
            console.error("Error: selectedChannel is null or missing _id.");
            return;
        }

        const channelId = selectedChannel._id;
        console.log("Sending message to: ", channelId);

        try {
          const messageToSend = {
            channelId, 
            text: message,
            reply: reply
          };

          if(imgSrc){
            messageToSend.imageData = imgSrc;
          }
            const response = await fetch("/api/channelsmessages", {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(messageToSend),
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
            setImgSrc(null);
            setIsCameraOpen(false);
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
    
    const handleEmojiSelect = (emojiObject) => {
        setMessage((prevMessage) => prevMessage + emojiObject.emoji);
    };

    // Toggle the reaction picker for a specific message
    const toggleReactionPicker = (index) => {
        setShowReactionPicker((prevIndex) => (prevIndex === index ? null : index));
    };

    // Add a reaction to a message
    const addReaction = (index, emoji) => {
        setMessages((prevMessages) => {
            const newMessages = [...prevMessages];

            // Initialize reactions if not present
            if (!newMessages[index].reactions) {
                newMessages[index].reactions = {};
            }

            // Increment reaction count or add new reaction
            newMessages[index].reactions[emoji] = (newMessages[index].reactions[emoji] || 0) + 1;

            return newMessages;
        });

        setShowReactionPicker(null); // Close picker after selecting an emoji
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

    const capture = useCallback(() => {
      const imageSrc = camRef.current.getScreenshot();
      setImgSrc(imageSrc);
      setIsCameraOpen(false);
    }, [camRef, setImgSrc]);

    const handleOpenCamera = () => {
      setIsCameraOpen((prev)=>!prev);
    }

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
                            
                                ((user?.isGlobalAdmin || (selectedChannel && user?.isChannelAdmin?.includes(selectedChannel._id))) && (
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
            {selectedTeam && !selectedChannel ? (
  <div className="teamNameDisplay">
    <h2>{selectedTeam.teamName}</h2>
    <p>Select a channel to start messaging.</p>
    <p>Want to join a channel? Request to join a channel in this team!</p>
    <button
      className="button"
      onClick={() => {
        console.log("Request to Join button clicked");
        setIsRequestModalOpen(true);
      }}
    >
      Request to Join
    </button>
  </div>
) : selectedChannel ? (
  <div className="messagesContainer">
    {messages.length > 0 ? (
      messages.map((msg, index) => {
        const senderName = users[msg.sender] || "Unknown User";
        const isHovered = hoveredMessageIndex === index;
        const replyMessage = msg.reply;

        return (
          <div
            className="message"
            key={index}
            onMouseEnter={() => setHoveredMessageIndex(index)}
            onMouseLeave={() => setHoveredMessageIndex(null)}
          >
            {replyMessage && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent:
                    msg.sender === loggedInUserId ? "flex-end" : "flex-start",
                }}
              >
                {msg.sender !== loggedInUserId && (
                  <div className="replyMessageIndicatorReceived"></div>
                )}
                <div
                  className={`replyMessage ${
                    msg.sender === loggedInUserId ? "sent" : "received"
                  }`}
                  style={{
                    justifyContent:
                      msg.sender === loggedInUserId ? "flex-end" : "flex-start",
                  }}
                >
                  <p>
                    {users[replyMessage.sender]}: <br />
                    {replyMessage.text}
                  </p>
                </div>
                {msg.sender === loggedInUserId && (
                  <div className="replyMessageIndicatorSent"></div>
                )}
              </div>
            )}

            <div
              className="messageContent"
              style={{
                justifyContent:
                  msg.sender === loggedInUserId ? "flex-end" : "flex-start",
              }}
            >
              {isHovered && msg.sender === loggedInUserId &&(
                <div className="actionBox">
                  <FaReply
                    className="replyButton"
                    onClick={() => {
                      setReply(msg);
                      inputRef.current?.focus();
                    }}
                  />
                  <button
                    className="reactButton"
                    onClick={() => toggleReactionPicker(index)}
                  >
                    😀
                  </button>
                </div>
              )}

              <div
                className={
                  msg.sender === loggedInUserId
                    ? "sentMessage"
                    : "receivedMessage"
                }
                style={{ marginTop: replyMessage ? "0px" : "10px" }}
              >
                <span>
                  {msg.sender !== loggedInUserId && (
                    <strong>
                      {senderName}: <br />
                    </strong>
                  )}
                  {msg.text}
                </span>

                {msg.imageData && (
                  <img 
                  src={msg.imageData}
                  alt="Sent image"
                  className="sentImage"
                  />
                )}
              </div>
              {isHovered && msg.sender !== loggedInUserId &&(
                <div className="actionBox">
                  <FaReply
                    className="replyButton"
                    onClick={() => {
                      setReply(msg);
                      inputRef.current?.focus();
                    }}
                  />
                  <button
                    className="reactButton"
                    onClick={() => toggleReactionPicker(index)}
                  >
                    😀
                  </button>
                </div>
              )}
              {showReactionPicker === index && (
                <div className="reactionPicker">
                  <EmojiPicker
                    onEmojiClick={(emoji) =>
                      addReaction(index, emoji.emoji)
                    }
                  />
                </div>
              )}

              <div className={`reactions ${isHovered ? "visible" : ""}`}>
                {msg.reactions && Object.keys(msg.reactions).length > 0 &&
                  Object.entries(msg.reactions).map(([emoji, count]) => (
                    <span key={emoji} className="reaction">
                      {emoji} {count}
                    </span>
                  ))}
              </div>
            </div>
          </div>
        );
      })
    ) : (
      <p>No messages yet.</p>
    )}
    <div ref={inputRef}></div>
  </div>
) : (
  <div className="defaultMessageArea">
    <p>Select a team to get started.</p>
  </div>
)}
</div>
<RequestToJoinChannelMenu
        isOpen={isRequestModalOpen}
        onClose={() => {
            console.log("Closing Request to Join Modal");
            setIsRequestModalOpen(false)}}
        selectedTeam={selectedTeam}
        userId={loggedInUserId}
      />
    

            {/* Message Input */}
            <div id="messageBar" className={messageAreaClass}>
                <HiQuestionMarkCircle id="openMemberListButton" onClick={handleOpenChannelMemberList} title="Channel Members" />
                {reply && (
                    <div className="replyingBox">
                        <span>Replying to {users[reply.sender]}:<p>{reply.text.substring(0,70)}{reply.text.length>71?"...":""}</p></span>
                        <RxCross2 className="closeReply" onClick={()=> setReply(null)} />
                    </div>
                )}
                <FaCamera className="openCameraButton" onClick={handleOpenCamera}/>
              
                <MdEmojiEmotions 
                className="openEmojiPicker" 
                onClick={() => setShowEmojiPicker((prev) => !prev)}/>

                {showEmojiPicker && (
                    <div style={{position: "absolute", bottom: "50px", zIndex: 100}}>
                        <EmojiPicker 
                        onEmojiClick={handleEmojiSelect}
                        previewConfig={{showPreview:false}}
                        searchDisabled={true}
                        />
                    </div>
                )}
            
            <input
                    ref={inputRef}
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

            {isCameraOpen &&
            <div className="webcamOverlay">
              <div className="webcamMenu">
                <RxCross2 className="closeCamera" onClick={handleOpenCamera} />
                <Webcam className="webcam" ref={camRef} screenshotFormat="image/jpeg"/>
                <MdCamera className = "takePictureButton" onClick={capture}/>
              </div>
            </div>
            }

            {imgSrc &&
            <div className = "imagePreview">
              <div className ="webcamMenu">
                <h3 style={{color:"white", marginBottom:"10px"}}>SEND PICTURE? </h3>
                <img style={{borderRadius:"5px"}}src={imgSrc}/>
                <div className="buttonBox">
                  <button className="pictureButton" onClick={handleSendMessage}><FaArrowUp/></button>
                  <button className="pictureButton" onClick={()=>{
                    setImgSrc(null);
                    setIsCameraOpen(true);
                  }}><RxCross2/></button>
                </div>
              </div>
            </div>
            }

        </div>
    );
}
