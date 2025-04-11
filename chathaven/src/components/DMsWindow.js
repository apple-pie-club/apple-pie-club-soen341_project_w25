import { useState, useEffect, useRef, useCallback } from "react"
import { FaReply, FaTrash } from "react-icons/fa"
import { RxCross2 } from "react-icons/rx"
import "./styles/DMs.css"
import EmojiPicker from "emoji-picker-react"
import { MdEmojiEmotions, MdCamera } from "react-icons/md"
import { FaArrowUp, FaCamera, FaTags, FaBarcode } from "react-icons/fa6"
import Webcam from "react-webcam"
import MessageBubble from "./MessageBubble"
import AlertPopup from "./AlertPopup"
  
export default function DMsWindow({ selectedUser, sidebarOpen }) {
  const [loggedInUserId, setLoggedInUserId] = useState(null)
  const [messages, setMessages] = useState([])
  const [message, setMessage] = useState("")
  const [hoveredMessageIndex, setHoveredMessageIndex] = useState(null)
  const [reply, setReply] = useState(null)
  const [users, setUsers] = useState({})
  const listRef = useRef(null)
  const inputRef = useRef(null)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showReactionPicker, setShowReactionPicker] = useState(null)
  const [isCameraOpen, setIsCameraOpen] = useState(false)
  const camRef = useRef(null)
  const [imgSrc, setImgSrc] = useState(null)
  const [isTagsOpen, setIsTagsOpen] = useState(false)
  const [isVanishOpen, setIsVanishOpen] = useState(false)
  const [tags, setTags] = useState([
    "Work",
    "Personal",
    "Important",
    "Casual",
    "Urgent",
  ])
  const [newTagInput, setNewTagInput] = useState("")
  const [isNewTagOpen, setIsNewTagOpen] = useState(false)
  const [selectedTag, setSelectedTag] = useState(null)
  const [seenVanishMessages, setSeenVanishMessages] = useState(new Set())
  const [showPopup, setShowPopup] = useState(false)
  const [popupMessage, setPopupMessage] = useState("")


  useEffect(() => {
    const fetchVanishMode = async () => {
      if (!selectedUser?._id) return
      try {

        const res = await fetch(`/api/dmsmessages?userId=${selectedUser._id}&fetchVanishMode=true`, {
          method: 'GET',
          credentials: 'include'
        })
        const data = await res.json()

        if (res.ok) {
          setIsVanishOpen(data.vanishMode)
        }
      } catch (error) {
        console.error('Failed to fetch vanish mode:', error)
      }

    };
    fetchVanishMode();
  }, [selectedUser]);


  useEffect(() => {
    const fetchUserData = async () => {
      try {

        const response = await fetch('/api/user', {
          method: 'GET',
          credentials: 'include',
        });
        if (!response.ok) throw new Error('Failed to fetch user data')

        const data = await response.json()
        console.log('Logged-in User:', data)
        setLoggedInUserId(data._id)
      } catch (error) {
        console.error('Error fetching user data:', error)
      }
    }

    fetchUserData()
  }, [])

  const handleCreateNewTag = () => {
    setIsNewTagOpen(true)
  }

  const handleTagSelect = (tag) => {
    if (selectedTag === tag) {
      setSelectedTag(null)
    } else {
      setSelectedTag(tag);
      // Show popup and auto-hide after 3s
      setPopupMessage(`Tag '${tag}' selected!`);
      setShowPopup(true);

      setTimeout(() => {
        setShowPopup(false);
      }, 3000);
    }
    setIsTagsOpen(false);
  };

  const handleSubmitNewTag = () => {
    if (newTagInput.trim()) {
      setTags((prevTags) => [

        ...prevTags.filter((tag) => tag !== "New"),
        newTagInput,
      ]);
      setIsNewTagOpen(false);
      setSelectedTag(newTagInput);
      setNewTagInput("");

      // Show popup and auto-hide after 3s
      setPopupMessage(`Tag "${newTagInput}" selected!`);
      setShowPopup(true);

      setTimeout(() => {
        setShowPopup(false);
      }, 3000);
    } else {
      alert('Please enter a valid tag name.')
    }
  }

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/users', {
          method: 'GET',
          credentials: 'include'
        })
        if (!response.ok) throw new Error('Failed to fetch users')

        const data = await response.json()
        console.log('Fetched Users:', data)

        const usersMap = {}
        data.forEach((user) => {
          usersMap[user._id] =
            user.firstname && user.lastname
              ? `${user.firstname} ${user.lastname}`
              : user.email
        })

        setUsers(usersMap)
      } catch (error) {
        console.error('Error fetching users:', error)
      }
    }

    fetchUsers()
  }, [])

  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedUser || !selectedUser._id) {
        console.error(' Error: selectedUser is null or missing _id.')
        return
      }

      const userId = selectedUser._id
      console.log(` Fetching messages for user: ${userId}`)

      try {
        const response = await fetch(`/api/dmsmessages?userId=${userId}`, {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        })

        if (!response.ok) {
          const errormsg = `Error fetching messages: ${response.status} ${response.statusText}`
          console.error(errormsg)
          throw new Error(errormsg)
        }

        const data = await response.json()
        console.log('Messages fetched:', data)
        setMessages(data)
      } catch (error) {
        console.error(' Error fetching messages:', error.message || error)
      }
    }

    fetchMessages()
  }, [selectedUser])

  useEffect(() => {
    listRef.current?.lastElementChild?.scrollIntoView()
  }, [messages.length])

  const handleSendMessage = async () => {
    if (!imgSrc && !message.trim()) return

    if (!selectedUser || !selectedUser._id) {
      console.error(' Error: selectedUser is null or missing _id.')
      return
    }

    const userId = selectedUser._id
    console.log('Sending message to:', userId)

    try {
      const vanishModeRes = await fetch(`/api/dmsmessages?userId=${userId}&fetchVanishMode=true`, {
        method: 'GET',
        credentials: 'include'
      })
      const vanishModeData = await vanishModeRes.json()

      const messageToSend = {
        userId,
        text: message,
        reply,
        tag: selectedTag,
        vanish: vanishModeData.vanishMode
      }

      if (imgSrc) {
        messageToSend.imageData = imgSrc
      }
      const response = await fetch('/api/dmsmessages', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messageToSend)
      })

      const result = await response.json()

      if (!response.ok) {
        console.error(` Error sending message: ${result.error}`)
        alert(`Error: ${result.error}`)
        return
      }

      console.log('Message sent successfully:', result.newMessage)
      console.log('New message vanish status:', result.newMessage?.vanish)

      setMessages((prevMessages) => [...prevMessages, result.newMessage])
      setMessage('')
      setReply(null)
      setImgSrc(null)
      setIsCameraOpen(false)
      setSelectedTag(null)
    } catch (error) {
      console.error('Error sending message:', error)
      alert('An error occurred. Please try again.')
    }
  }

  const handleDelete = async (messageIds) => {
    console.log('Sending DELETE request for messages:', messageIds)
    try {
      const res = await fetch('/api/dmsmessages', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          userId: selectedUser._id,
          messageId: Array.isArray(messageIds) ? undefined : messageIds,
          vanishMessageIds: Array.isArray(messageIds) ? messageIds : undefined
        })
      })
      const resText = await res.text()
      console.log('DELETE response:', resText)
      if (res.ok) {
        const toDelete = Array.isArray(messageIds) ? messageIds : [messageIds]
        setMessages((prev) =>
          prev.filter((msg) =>
            !toDelete.includes(msg._id) || !msg.vanish
          )
        )

      } else {
        console.error('Error deleting message(s)')
      }
    } catch (err) {
      console.error('Error deleting message(s):', err)
    }
  }

  useEffect(() => {
    return () => {
      console.log(
        "Cleaning up vanish messages on DM switch:",
        Array.from(seenVanishMessages)
      );
      if (seenVanishMessages.size === 0) return;
      const seenIds = Array.from(seenVanishMessages);
      console.log("Deleting seen vanish messages:", seenIds);
      handleDelete(seenIds);
      setSeenVanishMessages(new Set());
    };
  }, [selectedUser]);

  const handleEmojiSelect = (emojiObject) => {
    setMessage((prevMessage) => prevMessage + emojiObject.emoji)
  }

  const toggleReactionPicker = (index) => {
    setShowReactionPicker((prevIndex) => (prevIndex === index ? null : index))
  }

  const addReaction = (index, emoji) => {
    setMessages((prevMessages) => {
      const newMessages = [...prevMessages]

      if (!newMessages[index].reactions) {
        newMessages[index].reactions = {}
      }

      newMessages[index].reactions[emoji] =
        (newMessages[index].reactions[emoji] || 0) + 1

      return newMessages
    })

    setShowReactionPicker(null)
  }

  const capture = useCallback(() => {
    const imageSrc = camRef.current.getScreenshot()
    setImgSrc(imageSrc)
    setIsCameraOpen(false)
  }, [camRef, setImgSrc])

  const handleOpenCamera = () => {
    setIsCameraOpen((prev) => !prev)
  }

  const handleOpenTags = () => {
    setIsTagsOpen((prev) => !prev)
  }

  const handleEnableVanish = async () => {
    if (!selectedUser?._id) return

    try {
      const response = await fetch('/api/dmsmessages', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId: selectedUser._id })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to toggle vanish mode')
      }

      // Re-fetch vanish mode from the server

      const refreshRes = await fetch(
        `/api/dmsmessages?userId=${selectedUser._id}&fetchVanishMode=true`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      const refreshData = await refreshRes.json();
      console.log("Fetched updated vanishMode:", refreshData.vanishMode);
      setIsVanishOpen(refreshData.vanishMode);
    } catch (error) {
      console.error('Error toggling vanish mode:', error)
      alert('Error toggling vanish mode.')
    }
  }

  return (
    <div id='DmMessageWindow' className={sidebarOpen ? 'shifted' : 'fullWidth'}>
      <div
        id='DmMessagesArea'
        className={sidebarOpen ? 'shifted' : 'fullWidth'}
        ref={listRef}
      >
        {messages.map((msg, index) => (
          <MessageBubble
            key={index}
            msg={msg}
            index={index}
            users={users}
            selectedUser={selectedUser}
            currentUserId={loggedInUserId}
            setHoveredMessageIndex={setHoveredMessageIndex}
            hoveredMessageIndex={hoveredMessageIndex}
            setReply={setReply}
            inputRef={inputRef}
            toggleReactionPicker={toggleReactionPicker}
            showReactionPicker={showReactionPicker}
            addReaction={addReaction}
            handleDelete={handleDelete}
            seenVanishMessages={seenVanishMessages}
            setSeenVanishMessages={setSeenVanishMessages}
          />
        ))}
      </div>

      <div id='DmMessageBar' className={sidebarOpen ? 'shifted' : 'fullWidth'}>
        {reply && (
          <div className='DMreplyingBox'>
            <span>
              Replying to {users[reply.sender]}:
              <p>
                {reply.text.substring(0, 70)}
                {reply.text.length > 71 ? '...' : ''}
              </p>
            </span>
            <RxCross2 className='closeReply' onClick={() => setReply(null)} />
          </div>
        )}
        <FaCamera className='openCameraButton' onClick={handleOpenCamera} />
        {/* Emoji Picker Button */}
        <MdEmojiEmotions
          className='openEmojiPicker'
          onClick={() => setShowEmojiPicker((prev) => !prev)}
        />
        <FaTags className='tagsButton' onClick={handleOpenTags} />
        <FaBarcode
          className={`vanishButton ${isVanishOpen ? 'active' : ''}`}
          onClick={handleEnableVanish}
        />
        {/* Emoji Picker Popup */}
        {showEmojiPicker && (
          <div style={{ position: 'absolute', bottom: '50px', zIndex: 100 }}>
            <EmojiPicker
              onEmojiClick={handleEmojiSelect}
              previewConfig={{ showPreview: false }}
              searchDisabled
            />
          </div>
        )}
        {selectedTag && (
          <div className='selectedTags'>
            <div className='selectedTag'>{selectedTag}</div>
          </div>
        )}
        <input
          type='text'
          placeholder='Type a message...'
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSendMessage()
            }
          }}
        />
        <button onClick={handleSendMessage}>
          <FaArrowUp />
        </button>
      </div>

      {isCameraOpen && (
        <div className='webcamOverlay'>
          <div className='webcamMenu'>
            <RxCross2 className='closeCamera' onClick={handleOpenCamera} />
            <Webcam
              className='webcam'
              ref={camRef}
              screenshotFormat='image/jpeg'
              mirrored
            />
            <MdCamera className='takePictureButton' onClick={capture} />
          </div>
        </div>
      )}

      {isTagsOpen && (
        <div className={`tagsMenu ${isTagsOpen ? 'open' : ''}`}>
          {/* List of tags */}
          <div className='tagsList'>
            {tags.map((tag, index) => (
              <div
                key={index}
                className='tagItem'
                onClick={() => handleTagSelect(tag)}
              >
                {tag}
              </div>
            ))}
            {!tags.includes('New') && (
              <div className='tagItem' onClick={handleCreateNewTag}>
                New
              </div>
            )}
          </div>

          {isNewTagOpen && (
            <div className='newTagOverlay'>
              <div className='newTagContent'>
                <RxCross2
                  className='closeNewTag'
                  onClick={() => setIsNewTagOpen(false)}
                />
                <h3>Create a New Tag</h3>
                <input
                  type='text'
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  placeholder='Enter tag name'
                />
                <button onClick={handleSubmitNewTag}>Create</button>
              </div>
            </div>
          )}
        </div>
      )}
      {showPopup && <AlertPopup message={popupMessage} />}

      {imgSrc && (
        <div className='imagePreview'>
          <div className='webcamMenu'>
            <h3 style={{ color: 'white', marginBottom: '10px' }}>
              SEND PICTURE?{' '}
            </h3>
            <img style={{ borderRadius: '5px' }} src={imgSrc} />
            <div className='buttonBox'>
              <button className='pictureButton' onClick={handleSendMessage}>
                <FaArrowUp />
              </button>
              <button
                className='pictureButton'
                onClick={() => {
                  setImgSrc(null)
                  setIsCameraOpen(true)
                }}
              >
                <RxCross2 />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
