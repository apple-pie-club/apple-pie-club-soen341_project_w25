import { useEffect, useRef } from 'react'
import { FaReply, FaTrash } from 'react-icons/fa'
import EmojiPicker from 'emoji-picker-react'

export default function MessageBubble ({
  msg,
  index,
  users,
  selectedUser,
  setHoveredMessageIndex,
  hoveredMessageIndex,
  setReply,
  inputRef,
  toggleReactionPicker,
  showReactionPicker,
  addReaction,
  handleDelete,
  seenVanishMessages,
  setSeenVanishMessages,
  currentUserId
}) {
  const msgRef = useRef(null)

  useEffect(() => {
    if (!msg.vanish) return
    console.log('SENDER: ' + msg.sender + ' CURRENT: ' + currentUserId)
    if (msg.sender !== currentUserId) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            console.log('Seen vanish message:', msg._id)
            setSeenVanishMessages((prev) => new Set(prev).add(msg._id))
          }
        },
        { threshold: 0.5 }
      )
      if (msgRef.current) observer.observe(msgRef.current)
      return () => observer.disconnect()
    }
  }, [msg])

  const senderName = users[msg.sender] || 'Unknown User'
  const isHovered = hoveredMessageIndex === index
  const replyMessage = msg.reply

  const youtubeLinkRegex =
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/g
  const youtubeLinks = [...msg.text.matchAll(youtubeLinkRegex)]

  return (
    <div
      className='message'
      ref={msgRef}
      onMouseEnter={() => setHoveredMessageIndex(index)}
      onMouseLeave={() => setHoveredMessageIndex(null)}
    >
      {replyMessage && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent:
              msg.sender !== selectedUser._id ? 'flex-end' : 'flex-start'
          }}
        >
          {msg.sender === selectedUser._id && (
            <div className='replyMessageIndicatorReceived' />
          )}
          <div
            className={`replyMessage ${
              msg.sender !== selectedUser._id ? 'sent' : 'received'
            }`}
          >
            <p>
              {users[replyMessage.sender]}: <br />
              {replyMessage.text}
            </p>
          </div>
          {msg.sender !== selectedUser._id && (
            <div className='replyMessageIndicatorSent' />
          )}
        </div>
      )}

      <div
        className='messageContent'
        style={{
          justifyContent:
            msg.sender !== selectedUser._id ? 'flex-end' : 'flex-start'
        }}
      >
        {isHovered && (
          <div className='actionBox'>
            <FaReply
              className='replyButton'
              onClick={() => {
                setReply(msg)
                inputRef.current?.focus()
              }}
              title='Reply'
            />
            <button
              className='reactButton'
              onClick={() => toggleReactionPicker(index)}
              title='Add reaction'
            >
              😀
            </button>
            {msg.sender !== selectedUser._id && (
              <FaTrash
                className='deleteButton'
                onClick={() => handleDelete(msg._id)}
                title='Delete message'
              />
            )}
          </div>
        )}

        <div
          className={
            msg.sender !== selectedUser._id
              ? 'sentMessage'
              : 'receivedMessage'
          }
          style={{ marginTop: replyMessage ? '0px' : '10px' }}
        >
          <span>
            {msg.sender === selectedUser._id && (
              <strong>
                {senderName}: <br />
              </strong>
            )}
            <div className='messageTagSpace'>
              {msg.tag && (
                <div
                  className={
                    msg.sender !== selectedUser._id
                      ? 'sentTag'
                      : 'receivedTag'
                  }
                >
                  <span>{msg.tag}</span>
                </div>
              )}
            </div>
            {msg.text}
          </span>

          {msg.imageData && (
            <img src={msg.imageData} alt='Sent' className='sentImage' />
          )}

          {youtubeLinks.length > 0 &&
            youtubeLinks.map((match, i) => {
              const videoId = match[1]
              return (
                <iframe
                  key={i}
                  className='youtubeVideo'
                  src={`https://www.youtube.com/embed/${videoId}`}
                  allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                  allowFullScreen
                />
              )
            })}
        </div>

        {showReactionPicker === index && (
          <div className='reactionPicker'>
            <EmojiPicker
              onEmojiClick={(emoji) => addReaction(index, emoji.emoji)}
            />
          </div>
        )}

        <div className={`reactions ${isHovered ? 'visible' : ''}`}>
          {msg.reactions &&
            Object.entries(msg.reactions).map(([emoji, count]) => (
              <span key={emoji} className='reaction'>
                {emoji} {count}
              </span>
            ))}
        </div>
      </div>
    </div>
  )
}
