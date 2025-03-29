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

export default function CMsWindow({
  selectedTeam,
  selectedChannel,
  messageAreaClass,
  onLeaveChannel
}) {
  // ---------------------------------------------------------------------------
  //                    State Variables
  // ---------------------------------------------------------------------------
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [loggedInUserId, setLoggedInUserId] = useState(null);
  const [users, setUsers] = useState({});
  const [members, setMembers] = useState([]);
  const [isChannelAdmin, setIsChannelAdmin] = useState(false);
  const [isChannelMemberListOpen, setIsChannelMemberListOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [error, setError] = useState("");
  const [hoveredMessageIndex, setHoveredMessageIndex] = useState(null);
  const [reply, setReply] = useState(null);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const camRef = useRef(null);
  const [imgSrc, setImgSrc] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Refs for scrolling and input focus
  const listRef = useRef(null);
  const inputRef = useRef(null);

  // ---------------------------------------------------------------------------
  //                    Handle Delete
  // ---------------------------------------------------------------------------
  const handleDelete = async (messageId) => {
    try {
      const res = await fetch("/api/deleteMessage", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ channelId: selectedChannel._id, messageId })
      });
      if (res.ok) {
        // Remove the deleted message from state
        setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
      } else {
        console.error("Failed to delete message");
      }
    } catch (err) {
      console.error("Error deleting message:", err);
    }
  };

  // ---------------------------------------------------------------------------
  //                    Fetch Users
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/users", {
          method: "GET",
          credentials: "include"
        });
        if (!response.ok) throw new Error("Failed to fetch users");
        const data = await response.json();
        console.log("Fetched Users:", data);

        const usersMap = {};
        data.forEach((u) => {
          usersMap[u._id] =
            u.firstname && u.lastname
              ? `${u.firstname} ${u.lastname}`
              : u.email;
        });
        setUsers(usersMap);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  // ---------------------------------------------------------------------------
  //             Fetch Logged-In User (ID & Channel Admin Status)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("/api/user", {
          method: "GET",
          credentials: "include"
        });
        if (!response.ok) throw new Error("Failed to fetch user data");

        const data = await response.json();
        console.log("Logged-in User:", data);
        setLoggedInUserId(data._id);
        setUser(data);

        // If the user object says they're channel admin
        if (data.isChannelAdmin) {
          setIsChannelAdmin(true);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  // ---------------------------------------------------------------------------
  //             Fetch Channel Members
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (selectedChannel && selectedChannel._id) {
      console.log("Selected Channel:", selectedChannel);
      // Unique members so the admin doesn't appear multiple times
      const uniqueMembers = [...new Set(selectedChannel.members || [])];
      setMembers(uniqueMembers);
    } else {
      setMembers([]);
    }
  }, [selectedChannel, users]);

  // ---------------------------------------------------------------------------
  //             Fetch Messages
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedChannel || !selectedChannel._id) {
        console.error("Error: selectedChannel is null or missing _id.");
        return;
      }

      setMessages([]);
      const channelId = selectedChannel._id;
      console.log(`Fetching messages for channel: ${channelId}`);

      try {
        const response = await fetch(
          `/api/channelsmessages?channelId=${channelId}`,
          {
            method: "GET",
            credentials: "include",
            headers: { "Content-Type": "application/json" }
          }
        );
        if (!response.ok) {
          throw new Error(`Failed to fetch messages: ${response.status}`);
        }
        const data = await response.json();
        console.log("Messages fetched:", data);
        setMessages(data);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();
  }, [selectedChannel]);

  // ---------------------------------------------------------------------------
  //            Scroll to bottom on new messages
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (messages.length > 0 && inputRef.current) {
      inputRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length]);

  // ---------------------------------------------------------------------------
  //            Handle Sending Messages
  // ---------------------------------------------------------------------------
  const handleSendMessage = async () => {
    if (!imgSrc && !message.trim()) return;
    if (!selectedChannel || !selectedChannel._id) {
      console.error("Error: selectedChannel is null or missing _id.");
      return;
    }

    const channelId = selectedChannel._id;
    console.log("Sending message to:", channelId);

    try {
      const messageToSend = {
        channelId,
        text: message,
        reply
      };

      if (imgSrc) {
        messageToSend.imageData = imgSrc;
      }

      const response = await fetch("/api/channelsmessages", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(messageToSend)
      });

      const result = await response.json();

      if (!response.ok) {
        console.error(`Error sending message: ${result.error}`);
        alert(`Error: ${result.error}`);
        return;
      }

      console.log("Message sent successfully:", result.newMessage);
      setMessages((prev) => [...prev, result.newMessage]);
      setMessage("");
      setReply(null);
      setImgSrc(null);
      setIsCameraOpen(false);
    } catch (error) {
      console.error("Error sending message:", error);
      alert("An error occurred. Please try again.");
    }
  };

  // ---------------------------------------------------------------------------
  //            Channel Member List
  // ---------------------------------------------------------------------------
  const handleOpenChannelMemberList = () => {
    setIsChannelMemberListOpen((prev) => !prev);
  };

  // ---------------------------------------------------------------------------
  //            Ban Users (Admin Only)
  // ---------------------------------------------------------------------------
  const handleBanUser = async (userId) => {
    if (!selectedChannel || !selectedChannel._id) {
      console.error("Cannot ban user: selectedChannel is null or missing _id.");
      return;
    }

    if (userId === loggedInUserId) {
      alert("You cannot ban yourself!");
      return;
    }

    console.log(
      `Attempting to ban user ${userId} from channel ${selectedChannel._id}`
    );

    try {
      const response = await fetch("/api/channels", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "banUser",
          channelId: selectedChannel._id,
          userIdToBan: userId
        })
      });

      const result = await response.json();
      if (!response.ok) {
        console.error(`Error banning user: ${result.error}`);
        alert(`Error: ${result.error}`);
        return;
      }

      console.log(`User ${userId} banned successfully!`);
      setMembers((prev) => prev.filter((m) => m !== userId));
    } catch (error) {
      console.error("Error banning user:", error);
      alert("An error occurred. Please try again.");
    }
  };

  // ---------------------------------------------------------------------------
  //            Show Success / Error
  // ---------------------------------------------------------------------------
  const showSuccessMessage = () => {
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
  };

  const showErrorMessage = (msg) => {
    setError(msg);
    setShowError(true);
    setTimeout(() => {
      setShowError(false);
    }, 3000);
  };

  // ---------------------------------------------------------------------------
  //            Emoji & Reactions
  // ---------------------------------------------------------------------------
  const handleEmojiSelect = (emojiObject) => {
    setMessage((prev) => prev + emojiObject.emoji);
  };

  const toggleReactionPicker = (index) => {
    setShowReactionPicker((prevIndex) => (prevIndex === index ? null : index));
  };

  const addReaction = (index, emoji) => {
    setMessages((prevMessages) => {
      const newMessages = [...prevMessages];
      if (!newMessages[index].reactions) {
        newMessages[index].reactions = {};
      }
      newMessages[index].reactions[emoji] =
        (newMessages[index].reactions[emoji] || 0) + 1;
      return newMessages;
    });
    setShowReactionPicker(null);
  };

  // ---------------------------------------------------------------------------
  //            Leave Channel
  // ---------------------------------------------------------------------------
  const handleLeaveChannel = async () => {
    if (!selectedChannel || !selectedChannel._id) {
      console.error("Error: selectedChannel is null or missing _id.");
      return;
    }

    try {
      const response = await fetch("/api/channels", {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channelId: selectedChannel._id })
      });

      const result = await response.json();
      if (!response.ok) {
        console.error(`Error leaving channel: ${result.error}`);
        showErrorMessage(result.error);
        return;
      }

      showSuccessMessage();
      setMembers((prev) => prev.filter((member) => member !== loggedInUserId));
      onLeaveChannel(selectedChannel._id);
      setIsChannelMemberListOpen(false);
    } catch (error) {
      console.error("Error leaving channel:", error);
      showErrorMessage("An error occurred. Please try again.");
    }
  };

  // ---------------------------------------------------------------------------
  //            Camera & Images
  // ---------------------------------------------------------------------------
  const capture = useCallback(() => {
    const imageSrc = camRef.current.getScreenshot();
    setImgSrc(imageSrc);
    setIsCameraOpen(false);
  }, [camRef, setImgSrc]);

  const handleOpenCamera = () => {
    setIsCameraOpen((prev) => !prev);
  };

  // ---------------------------------------------------------------------------
  //            Render UI
  // ---------------------------------------------------------------------------
  return (
    <div id="messageWindow">
      {/* ---------------- Channel Member List Overlay ---------------- */}
      <div
        id="channelSidebarMembersOverlay"
        style={{ display: isChannelMemberListOpen ? "flex" : "none" }}
      >
        <div
          id="channelSidebarMembers"
          className={isChannelMemberListOpen ? "open" : "closed"}
        >
          <h3>
            Channel Members{" "}
            <RxCross2
              className="closeButton"
              onClick={handleOpenChannelMemberList}
            />
          </h3>
          <ul>
            {members.length > 0 ? (
              members.map((memberId) => (
                <li key={memberId} className="memberListItem">
                  <span>{users[memberId] || `Unknown User (${memberId})`}</span>
                  {loggedInUserId === memberId ? (
                    <button
                      className="leaveButton"
                      onClick={handleLeaveChannel}
                      title="Leave channel"
                    >
                      <MdExitToApp /> Leave
                    </button>
                  ) : (
                    (user?.isGlobalAdmin ||
                      (selectedChannel &&
                        user?.isChannelAdmin?.includes(selectedChannel._id))) && (
                      <button
                        className="banButton"
                        onClick={() => handleBanUser(memberId)}
                        title="Ban user"
                      >
                        <FaUserSlash /> Ban
                      </button>
                    )
                  )}
                </li>
              ))
            ) : (
              <li>No members found.</li>
            )}
          </ul>
        </div>
      </div>

      {/* ---------------- Messages Area ---------------- */}
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
                    {/* If the message is a reply to something else */}
                    {replyMessage && (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent:
                            msg.sender === loggedInUserId
                              ? "flex-end"
                              : "flex-start"
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
                              msg.sender === loggedInUserId
                                ? "flex-end"
                                : "flex-start"
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

                    {/* Actual message bubble */}
                    <div
                      className="messageContent"
                      style={{
                        justifyContent:
                          msg.sender === loggedInUserId
                            ? "flex-end"
                            : "flex-start"
                      }}
                    >
                      {/* Hover box for the sender */}
                      {isHovered && msg.sender === loggedInUserId && (
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
                            title="React"
                          >
                            😀
                          </button>
                          {/* 🗑️ Delete Button → only for the message sender */}
                          <button
                            className="deleteButton"
                            onClick={() => handleDelete(msg._id)}
                            title="Delete Message"
                          >
                            🗑️
                          </button>
                        </div>
                      )}

                      {/* The bubble itself */}
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

                      {/* Hover box for non-sender */}
                      {isHovered && msg.sender !== loggedInUserId && (
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
                            title="React"
                          >
                            😀
                          </button>
                          {/* We do not show the delete button here
                              if you want EVERYONE to delete, you can add it. */}
                        </div>
                      )}

                      {/* Reaction Picker */}
                      {showReactionPicker === index && (
                        <div className="reactionPicker">
                          <EmojiPicker
                            onEmojiClick={(emoji) =>
                              addReaction(index, emoji.emoji)
                            }
                          />
                        </div>
                      )}

                      {/* Existing Reactions */}
                      <div className={`reactions ${isHovered ? "visible" : ""}`}>
                        {msg.reactions &&
                          Object.keys(msg.reactions).length > 0 &&
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
          // If no channel is selected
          <div className="defaultMessageArea">
            <p>Select a team to get started.</p>
          </div>
        )}
      </div>

      <RequestToJoinChannelMenu
        isOpen={isRequestModalOpen}
        onClose={() => {
          console.log("Closing Request to Join Modal");
          setIsRequestModalOpen(false);
        }}
        selectedTeam={selectedTeam}
        userId={loggedInUserId}
      />

      {/* ---------------- Message Input Bar ---------------- */}
      <div id="messageBar" className={messageAreaClass}>
        <HiQuestionMarkCircle
          id="openMemberListButton"
          onClick={handleOpenChannelMemberList}
          title="Channel Members"
        />
        {reply && (
          <div className="replyingBox">
            <span>
              Replying to {users[reply.sender]}:
              <p>
                {reply.text.substring(0, 70)}
                {reply.text.length > 71 ? "..." : ""}
              </p>
            </span>
            <RxCross2 className="closeReply" onClick={() => setReply(null)} />
          </div>
        )}
        <FaCamera className="openCameraButton" onClick={handleOpenCamera} />

        <MdEmojiEmotions
          className="openEmojiPicker"
          onClick={() => setShowEmojiPicker((prev) => !prev)}
        />

        {showEmojiPicker && (
          <div style={{ position: "absolute", bottom: "50px", zIndex: 100 }}>
            <EmojiPicker
              onEmojiClick={handleEmojiSelect}
              previewConfig={{ showPreview: false }}
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

      {showError && (
        <div className={`alert ${showError ? "show" : ""}`}>
          <p className="error">{error}</p>
        </div>
      )}

      {showSuccess && (
        <div className={`success ${showSuccess ? "show" : ""}`}>
          <p className="successMessage">Successfully left channel.</p>
        </div>
      )}

      {/* ---------------- Camera Overlay ---------------- */}
      {isCameraOpen && (
        <div className="webcamOverlay">
          <div className="webcamMenu">
            <RxCross2 className="closeCamera" onClick={handleOpenCamera} />
            <Webcam
              className="webcam"
              ref={camRef}
              screenshotFormat="image/jpeg"
              mirrored={true}
            />
            <MdCamera className="takePictureButton" onClick={capture} />
          </div>
        </div>
      )}

      {/* ---------------- Image Preview ---------------- */}
      {imgSrc && (
        <div className="imagePreview">
          <div className="webcamMenu">
            <h3 style={{ color: "white", marginBottom: "10px" }}>
              SEND PICTURE?
            </h3>
            <img style={{ borderRadius: "5px" }} src={imgSrc} alt="Preview" />
            <div className="buttonBox">
              <button className="pictureButton" onClick={handleSendMessage}>
                <FaArrowUp />
              </button>
              <button
                className="pictureButton"
                onClick={() => {
                  setImgSrc(null);
                  setIsCameraOpen(true);
                }}
              >
                <RxCross2 />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

