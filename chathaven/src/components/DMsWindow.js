import { useState, useEffect, useRef, useCallback } from "react";
import { FaReply, FaTrash } from "react-icons/fa";
import { RxCross2 } from "react-icons/rx";
import "./styles/DMs.css";
import EmojiPicker from "emoji-picker-react";
import { MdEmojiEmotions, MdCamera } from "react-icons/md";
import { FaArrowUp, FaCamera, FaTags } from "react-icons/fa6";
import Webcam from "react-webcam";
export default function DMsWindow({ selectedUser, sidebarOpen }) {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [hoveredMessageIndex, setHoveredMessageIndex] = useState(null);
  const [reply, setReply] = useState(null);
  const [users, setUsers] = useState({});
  const listRef = useRef(null);
  const inputRef = useRef(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const camRef = useRef(null);
  const [imgSrc, setImgSrc] = useState(null);
  const [isTagsOpen, setIsTagsOpen] = useState(false);
  const [tags, setTags] = useState([
    "Work",
    "Personal",
    "Important",
    "Casual",
    "Urgent",
  ]);
  const [newTagInput, setNewTagInput] = useState("");
  const [isNewTagOpen, setIsNewTagOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState(null);
  const [isSelectedTagOpen, setIsSelectedTagOpen] = useState(false);

  const handleCreateNewTag = () => {
    setIsNewTagOpen(true);
  };

  const handleTagSelect = (tag) => {
    if (selectedTag === tag) {
      setSelectedTag(null);
    } else {
      setSelectedTag(tag);
    } // Add tag to selectedTags state
    setIsSelectedTagOpen(true);
  };

  // Handle new tag submission
  const handleSubmitNewTag = () => {
    if (newTagInput.trim()) {
      setTags((prevTags) => [
        ...prevTags.filter((tag) => tag !== "New"),
        newTagInput,
      ]); // Remove "New" if it exists and add the new tag
      setSelectedTag(newTagInput);
      setNewTagInput("");
      setIsNewTagOpen(false);
    } else {
      alert("Please enter a valid tag name.");
    }
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/users", {
          method: "GET",
          credentials: "include",
        });
        if (!response.ok) throw new Error("Failed to fetch users");

        const data = await response.json();
        console.log("Fetched Users:", data);

        const usersMap = {};
        data.forEach((user) => {
          usersMap[user._id] =
            user.firstname && user.lastname
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
    listRef.current?.lastElementChild?.scrollIntoView();
  }, [messages.length]);

  const handleSendMessage = async () => {
    if (!imgSrc && !message.trim()) return; // Don't send empty messages

    if (!selectedUser || !selectedUser._id) {
      console.error(" Error: selectedUser is null or missing _id.");
      return;
    }

    const userId = selectedUser._id; // Extract the recipient's user ID
    console.log("Sending message to:", userId);

    try {
      const messageToSend = {
        userId,
        text: message,
        reply: reply,
        tag: selectedTag,
      };

      if (imgSrc) {
        messageToSend.imageData = imgSrc;
      }
      const response = await fetch("/api/dmsmessages", {
        //  No need to pass userId in URL
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(messageToSend), //  Send `userId` in the body
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
      setImgSrc(null);
      setIsCameraOpen(false);
      setSelectedTag(null);
    } catch (error) {
      console.error("Error sending message:", error);
      alert("An error occurred. Please try again.");
    }
  };

  const handleDelete = async (messageId) => {
    try {
      const res = await fetch("/api/dmsmessages", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ userId: selectedUser._id, messageId }),
      });
      if (res.ok) {
        setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
      } else {
        console.error("Error deleting message");
      }
    } catch (err) {
      console.error("Error deleting message:", err);
    }
  };

  const handleEmojiSelect = (emojiObject) => {
    setMessage((prevMessage) => prevMessage + emojiObject.emoji);
  };

  const toggleReactionPicker = (index) => {
    setShowReactionPicker((prevIndex) => (prevIndex === index ? null : index));
  };

  const addReaction = (index, emoji) => {
    setMessages((prevMessages) => {
      const newMessages = [...prevMessages];

      // Initialize reactions if not present
      if (!newMessages[index].reactions) {
        newMessages[index].reactions = {};
      }

      // Increment reaction count or add new reaction
      newMessages[index].reactions[emoji] =
        (newMessages[index].reactions[emoji] || 0) + 1;

      return newMessages;
    });

    setShowReactionPicker(null); // Close picker after selecting an emoji
  };

  const capture = useCallback(() => {
    const imageSrc = camRef.current.getScreenshot();
    setImgSrc(imageSrc);
    setIsCameraOpen(false);
  }, [camRef, setImgSrc]);

  const handleOpenCamera = () => {
    setIsCameraOpen((prev) => !prev);
  };

  const handleOpenTags = () => {
    setIsTagsOpen((prev) => !prev);
  };

  return (
    <div id="DmMessageWindow" className={sidebarOpen ? "shifted" : "fullWidth"}>
      <div
        id="DmMessagesArea"
        className={sidebarOpen ? "shifted" : "fullWidth"}
        ref={listRef}
      >
        {messages.map((msg, index) => {
          const senderName = users[msg.sender] || "Unknown User";
          const isHovered = hoveredMessageIndex === index;
          const replyMessage = msg.reply;
          const youtubeLinkRegex =
          /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/g;
          const youtubeLinks = [...msg.text.matchAll(youtubeLinkRegex)];

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
                      msg.sender !== selectedUser._id
                        ? "flex-end"
                        : "flex-start",
                  }}
                >
                  {msg.sender === selectedUser._id && (
                    <div className="replyMessageIndicatorReceived"></div>
                  )}
                  <div
                    className={`replyMessage ${
                      msg.sender !== selectedUser._id ? "sent" : "received"
                    }`}
                    style={{
                      justifyContent:
                        msg.sender !== selectedUser._id
                          ? "flex-end"
                          : "flex-start",
                    }}
                  >
                    <p>
                      {users[replyMessage.sender]}: <br />
                      {replyMessage.text}
                    </p>
                  </div>

                  {msg.sender !== selectedUser._id && (
                    <div className="replyMessageIndicatorSent"></div>
                  )}
                </div>
              )}
              <div
                className="messageContent"
                style={{
                  justifyContent:
                    msg.sender !== selectedUser._id ? "flex-end" : "flex-start",
                }}
              >
                {isHovered && msg.sender !== selectedUser._id && (
                  <div className="actionBox">
                    <FaReply
                      className="replyButton"
                      onClick={() => {
                        setReply(msg);
                        inputRef.current?.focus();
                      }}
                      title="Reply"
                    />
                    <button
                      className="reactButton"
                      onClick={() => toggleReactionPicker(index)}
                      title="Add reaction"
                    >
                      😀
                    </button>
                    <FaTrash
                      className="deleteButton"
                      onClick={() => handleDelete(msg._id)}
                      title="Delete message"
                    />
                  </div>
                )}

                <div
                  key={index}
                  className={
                    msg.sender !== selectedUser._id
                      ? "sentMessage"
                      : "receivedMessage"
                  }
                  style={{ marginTop: replyMessage ? "0px" : "10px" }}
                >
                  <span>
                    {msg.sender === selectedUser._id && (
                      <strong>
                        {senderName}: <br />
                      </strong>
                    )}
                    <div className="messageTagSpace">
                      {msg.tag && (
                        <div
                          className={
                            msg.sender !== selectedUser._id
                              ? "sentTag"
                              : "receivedTag"
                          }
                        >
                          <span>{msg.tag}</span>
                        </div>
                      )}
                    </div>
                    {msg.text}
                  </span>
                  {msg.imageData && (
                    <img
                      src={msg.imageData}
                      alt="Sent image"
                      className="sentImage"
                    />
                  )}

                        {youtubeLinks.length > 0 &&
                          youtubeLinks.map((linkMatch, index) => {
                            const videoId = linkMatch[1];
                            const embedUrl = `https://www.youtube.com/embed/${videoId}`;
                            return (
                              <iframe
                                className="youtubeVideo"
                                key={index}
                                src={embedUrl}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                              ></iframe>
                            );
                          })}
                </div>
                {isHovered && msg.sender === selectedUser._id && (
                  <div className="actionBox">
                    <FaReply
                      className="replyButton"
                      onClick={() => {
                        setReply(msg);
                        inputRef.current?.focus();
                      }}
                      title="Reply"
                    />
                    <button
                      className="reactButton"
                      onClick={() => toggleReactionPicker(index)}
                      title="Add reaction"
                    >
                      😀
                    </button>
                  </div>
                )}
                {showReactionPicker === index && (
                  <div className="reactionPicker">
                    <EmojiPicker
                      onEmojiClick={(emoji) => addReaction(index, emoji.emoji)}
                    />
                  </div>
                )}

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
        })}
      </div>

      <div id="DmMessageBar" className={sidebarOpen ? "shifted" : "fullWidth"}>
        {reply && (
          <div className="DMreplyingBox">
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
        {/* Emoji Picker Button */}
        <MdEmojiEmotions
          className="openEmojiPicker"
          onClick={() => setShowEmojiPicker((prev) => !prev)}
        />
        <FaTags className="tagsButton" onClick={handleOpenTags} />

        {/* Emoji Picker Popup */}
        {showEmojiPicker && (
          <div style={{ position: "absolute", bottom: "50px", zIndex: 100 }}>
            <EmojiPicker
              onEmojiClick={handleEmojiSelect}
              previewConfig={{ showPreview: false }}
              searchDisabled={true}
            />
          </div>
        )}
        {selectedTag && (
          <div className="selectedTags">
            <div className="selectedTag">{selectedTag}</div>
          </div>
        )}
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

      {isTagsOpen && (
        <div className={`tagsMenu ${isTagsOpen ? "open" : ""}`}>
          {/* List of tags */}
          <div className="tagsList">
            {tags.map((tag, index) => (
              <div
                key={index}
                className="tagItem"
                onClick={() => handleTagSelect(tag)}
              >
                {tag}
              </div>
            ))}
            {!tags.includes("New") && (
              <div className="tagItem" onClick={handleCreateNewTag}>
                New
              </div>
            )}
          </div>

          {isNewTagOpen && (
            <div className="newTagOverlay">
              <div className="newTagContent">
                <RxCross2
                  className="closeNewTag"
                  onClick={() => setIsNewTagOpen(false)}
                />
                <h3>Create a New Tag</h3>
                <input
                  type="text"
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  placeholder="Enter tag name"
                />
                <button onClick={handleSubmitNewTag}>Create</button>
              </div>
            </div>
          )}
        </div>
      )}

      {imgSrc && (
        <div className="imagePreview">
          <div className="webcamMenu">
            <h3 style={{ color: "white", marginBottom: "10px" }}>
              SEND PICTURE?{" "}
            </h3>
            <img style={{ borderRadius: "5px" }} src={imgSrc} />
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
