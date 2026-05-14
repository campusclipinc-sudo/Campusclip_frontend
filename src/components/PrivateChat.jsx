import React, { useState, useEffect, useRef } from "react";
import { Spinner } from "react-bootstrap";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import EmojiPicker from "emoji-picker-react";
import {
  useGetPrivateChatHistory,
  useSendMessage,
  useMarkAsRead,
} from "../hooks/useRQChat";
import { getSocket } from "../utils/socket";

const PrivateChat = ({ recipientId, recipientName, recipientImage, onBack }) => {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [scrollLocked, setScrollLocked] = useState(false);

  const messagesContainerRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const prevScrollHeightRef = useRef(0);
  const isLoadingMoreRef = useRef(false);

  const currentUser = useSelector((state) => state.user?.user);
  const userId = currentUser?.id;

  const {
    data: chatData,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useGetPrivateChatHistory(recipientId);
  const sendMessageMutation = useSendMessage();
  const markAsReadMutation = useMarkAsRead();

  // Clear messages when switching to a different conversation
  useEffect(() => {
    setMessages([]);
  }, [recipientId]);

  // Flatten all pages into a single messages array
  useEffect(() => {
    if (!chatData?.pages) return;

    const allMessages = [];
    chatData.pages.forEach((page) => {
      if (page?.messages && Array.isArray(page.messages)) {
        allMessages.push(...page.messages);
      }
    });

    if (allMessages.length === 0) return;

    // Remove duplicates and sort by ID (ascending = oldest first)
    const uniqueMessagesMap = new Map(allMessages.map((msg) => [msg.id, msg]));
    const uniqueMessages = Array.from(uniqueMessagesMap.values()).sort((a, b) => a.id - b.id);

    setMessages((prevMessages) => {
      const isInitialLoad = prevMessages.length === 0 && uniqueMessages.length > 0;
      if (isInitialLoad) {
        setTimeout(() => {
          scrollToBottom();
          markAsReadMutation.mutate({ recipient_id: recipientId });
        }, 0);
      }
      return uniqueMessages;
    });
  }, [chatData?.pages, recipientId]);

  // Handle scroll to detect if user scrolls up to load more messages
  const handleScroll = () => {
    if (!messagesContainerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;

    // User scrolled to top and there are more messages to load
    if (scrollTop < 100 && hasNextPage && !isFetchingNextPage && !isLoadingMoreRef.current) {
      isLoadingMoreRef.current = true;
      prevScrollHeightRef.current = scrollHeight;
      setScrollLocked(true);
      fetchNextPage();
    }

    // Unlock scroll when at bottom (new messages arrived)
    if (scrollHeight - (scrollTop + clientHeight) < 100) {
      setScrollLocked(false);
    }
  };

  // Maintain scroll position when loading older messages
  useEffect(() => {
    if (isFetchingNextPage) return;

    if (scrollLocked && messagesContainerRef.current && prevScrollHeightRef.current > 0) {
      const newScrollHeight = messagesContainerRef.current.scrollHeight;
      const heightDifference = newScrollHeight - prevScrollHeightRef.current;
      messagesContainerRef.current.scrollTop += heightDifference;
      isLoadingMoreRef.current = false;
    }
  }, [isFetchingNextPage, scrollLocked]);

  const scrollToBottom = () => {
    if (messagesContainerRef.current && !scrollLocked) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (!scrollLocked && messages.length > 0) {
      setTimeout(() => scrollToBottom(), 0);
    }
  }, [messages.length, scrollLocked]);

  // Socket.io real-time message updates
  useEffect(() => {
    const socket = getSocket();
    if (!socket || !recipientId) return;

    socket.emit("chat:start", { recipientId });

    const handleNewMessage = (data) => {
      if (data.fromUserId === recipientId) {
        setMessages((prev) => {
          // Prevent duplicates
          if (prev.some((m) => m.id === data.id)) return prev;
          return [...prev, data];
        });
        setScrollLocked(false); // Auto-scroll on new messages
        markAsReadMutation.mutate({ recipient_id: recipientId });
      }
    };

    const handleUserTyping = (data) => {
      if (data.fromUserId === recipientId) {
        setIsTyping(true);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 3000);
      }
    };

    const handleUserStoppedTyping = (data) => {
      if (data.fromUserId === recipientId) {
        setIsTyping(false);
      }
    };

    socket.on("chat:message-received", handleNewMessage);
    socket.on("chat:user-typing", handleUserTyping);
    socket.on("chat:user-stopped-typing", handleUserStoppedTyping);

    return () => {
      socket.off("chat:message-received", handleNewMessage);
      socket.off("chat:user-typing", handleUserTyping);
      socket.off("chat:user-stopped-typing", handleUserStoppedTyping);
      socket.emit("chat:leave", { recipientId });
    };
  }, [recipientId, userId]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const messageData = {
      message: message.trim(),
      to_user_id: recipientId,
      message_type: "private",
      media_type: "text",
    };

    try {
      const tempMessage = {
        id: Date.now(),
        message: message.trim(),
        from_user_id: userId,
        to_user_id: recipientId,
        created_at: new Date().toISOString(),
        sender: {
          id: userId,
          full_name: currentUser.full_name,
          profile_image: currentUser.profile_image,
        },
      };

      setMessages((prev) => [...prev, tempMessage]);
      setMessage("");
      setScrollLocked(false);

      // Send message to API
      const response = await sendMessageMutation.mutateAsync(messageData);

      // Replace temp message with server response (real ID)
      const serverMessage = response?.data || response;
      if (serverMessage?.id) {
        setMessages((prev) =>
          prev.map((msg) => (msg.id === tempMessage.id ? serverMessage : msg))
        );
      }

      // Emit via socket for real-time delivery
      const socket = getSocket();
      if (socket) {
        socket.emit("chat:message", {
          recipientId,
          message: message.trim(),
        });
        socket.emit("chat:stop-typing", { recipientId });
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      setMessages((prev) => prev.filter((msg) => msg.id !== (tempMessage?.id)));
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target)
      ) {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showEmojiPicker]);

  const handleEmojiClick = (emojiData) => {
    setMessage((prevMessage) => prevMessage + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  const toggleEmojiPicker = () => {
    setShowEmojiPicker((prev) => !prev);
  };

  const handleTyping = (e) => {
    setMessage(e.target.value);

    const socket = getSocket();
    if (!socket) return;

    socket.emit("chat:typing", { recipientId });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("chat:stop-typing", { recipientId });
    }, 3000);
  };

  const handleProfileImageClick = (e, userId) => {
    e.stopPropagation();
    if (userId) {
      if (userId === currentUser?.id) {
        navigate("/profile");
      } else {
        navigate(`/students/${userId}`);
      }
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);

    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="private-chat-container">
      <div className="private-chat-header">
        {onBack && (
          <button
            className="btn mobile-back-btn d-md-none"
            onClick={onBack}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
          </button>
        )}
        <div
          className="private-chat-header-icon"
          onClick={(e) => handleProfileImageClick(e, recipientId)}
          style={{ cursor: "pointer" }}
        >
          {recipientImage ? (
            <img
              src={recipientImage}
              alt={recipientName}
              className="rounded-circle"
              width="48"
              height="48"
              style={{ objectFit: "cover" }}
            />
          ) : (
            <div
              className="rounded-circle bg-white d-flex align-items-center justify-content-center text-primary fw-bold"
              style={{ width: 48, height: 48, fontSize: "20px" }}
            >
              {recipientName?.[0]?.toUpperCase() || "U"}
            </div>
          )}
        </div>
        <div className="private-chat-header-content">
          <h4 className="private-chat-title">{recipientName || "User"}</h4>
          <p className="private-chat-subtitle">Active now</p>
        </div>
      </div>

      <div className="private-chat-messages" ref={messagesContainerRef} onScroll={handleScroll}>
        {isLoading && messages.length === 0 ? (
          <div className="private-chat-loading">
            <Spinner animation="border" variant="primary" size="sm" />
            <span>Loading messages...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="private-chat-empty">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <p>No messages yet</p>
            <p className="text-muted small">Start the conversation!</p>
          </div>
        ) : (
          <div className="private-chat-messages-list">
            {isFetchingNextPage && (
              <div className="text-center py-3">
                <Spinner animation="border" size="sm" variant="primary" />
              </div>
            )}
            {messages.map((msg, index) => {
              const isOwnMessage =
                msg.from_user_id === userId ||
                (msg.sender && msg.sender.id === userId);

              const profileImage = isOwnMessage
                ? currentUser?.profile_image
                : recipientImage;

              const senderName = isOwnMessage
                ? currentUser?.full_name
                : msg.sender?.full_name || recipientName;

              return (
                <div
                  key={`${msg.from_user_id}-${msg.created_at}-${index}`}
                  className={`d-flex align-items-end gap-2 mb-3 ${
                    isOwnMessage
                      ? "justify-content-end"
                      : "justify-content-start"
                  }`}
                >
                  {!isOwnMessage && (
                    <div
                      className="flex-shrink-0"
                      onClick={(e) =>
                        handleProfileImageClick(
                          e,
                          msg.from_user_id || msg.sender?.id,
                        )
                      }
                      style={{ cursor: "pointer" }}
                    >
                      {profileImage ? (
                        <img
                          src={profileImage}
                          alt={senderName}
                          className="rounded-circle"
                          width="32"
                          height="32"
                          style={{ objectFit: "cover" }}
                        />
                      ) : (
                        <div
                          className="rounded-circle bg-secondary d-flex align-items-center justify-content-center text-white fw-bold"
                          style={{ width: 32, height: 32, fontSize: "12px" }}
                        >
                          {senderName?.[0]?.toUpperCase() || "U"}
                        </div>
                      )}
                    </div>
                  )}

                  <div
                    className={`private-chat-message ${
                      isOwnMessage ? "private-chat-message-own" : ""
                    }`}
                  >
                    {msg.message && (
                      <div className="private-chat-message-content">
                        <p>{msg.message}</p>
                      </div>
                    )}
                    <div className="private-chat-message-meta">
                      <span className="private-chat-message-time">
                        {formatTime(msg.created_at)}
                      </span>
                    </div>
                  </div>

                  {isOwnMessage && (
                    <div
                      className="flex-shrink-0"
                      onClick={(e) => handleProfileImageClick(e, userId)}
                      style={{ cursor: "pointer" }}
                    >
                      {profileImage ? (
                        <img
                          src={profileImage}
                          alt={senderName}
                          className="rounded-circle"
                          width="32"
                          height="32"
                          style={{ objectFit: "cover" }}
                        />
                      ) : (
                        <div
                          className="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white fw-bold"
                          style={{ width: 32, height: 32, fontSize: "12px" }}
                        >
                          {senderName?.[0]?.toUpperCase() || "U"}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="private-chat-input-area">
        {isTyping && (
          <div
            className="px-3 py-2 d-flex align-items-center"
            style={{ color: "#65676b", fontSize: "14px", gap: "2px" }}
          >
            <span>typing</span>
            <span
              style={{
                display: "inline-block",
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                backgroundColor: "#65676b",
                marginLeft: "4px",
                animation: "typing-bounce 1.4s infinite ease-in-out both",
                animationDelay: "-0.32s",
              }}
            ></span>
            <span
              style={{
                display: "inline-block",
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                backgroundColor: "#65676b",
                animation: "typing-bounce 1.4s infinite ease-in-out both",
                animationDelay: "-0.16s",
              }}
            ></span>
            <span
              style={{
                display: "inline-block",
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                backgroundColor: "#65676b",
                animation: "typing-bounce 1.4s infinite ease-in-out both",
              }}
            ></span>
            <span
              style={{
                display: "inline-block",
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                backgroundColor: "#65676b",
                animation: "typing-bounce 1.4s infinite ease-in-out both",
                animationDelay: "0.12s",
              }}
            ></span>
            <span
              style={{
                display: "inline-block",
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                backgroundColor: "#65676b",
                animation: "typing-bounce 1.4s infinite ease-in-out both",
                animationDelay: "0.24s",
              }}
            ></span>
          </div>
        )}
        <form onSubmit={handleSendMessage} className="private-chat-input-form">
          <input
            type="text"
            className="private-chat-input"
            placeholder="Type a message..."
            value={message}
            onChange={handleTyping}
            disabled={sendMessageMutation.isPending}
          />
          <div className="emoji-picker-wrapper" ref={emojiPickerRef}>
            <button
              type="button"
              className="private-chat-emoji-btn"
              aria-label="Add emoji"
              onClick={toggleEmojiPicker}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
                <line x1="9" y1="9" x2="9.01" y2="9"></line>
                <line x1="15" y1="9" x2="15.01" y2="9"></line>
              </svg>
            </button>
            {showEmojiPicker && (
              <div className="emoji-picker-container">
                <EmojiPicker
                  onEmojiClick={handleEmojiClick}
                  width={320}
                  height={400}
                />
              </div>
            )}
          </div>
          <button
            type="submit"
            className="private-chat-send-btn"
            disabled={!message.trim() || sendMessageMutation.isPending}
          >
            {sendMessageMutation.isPending ? (
              <Spinner animation="border" size="sm" />
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m22 2-7 20-4-9-9-4Z"></path>
                <path d="M22 2 11 13"></path>
              </svg>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PrivateChat;
