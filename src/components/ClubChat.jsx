import React, { useState, useRef, useEffect } from "react";
import { Spinner } from "react-bootstrap";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import EmojiPicker from "emoji-picker-react";
import { useGetGroupChatHistory, useSendMessage } from "../hooks/useRQChat";
import { getSocket } from "../utils/socket";

const ClubChat = ({ roomId, clubName, clubId }) => {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [scrollLocked, setScrollLocked] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const [roomJoined, setRoomJoined] = useState(false);
  const [socketError, setSocketError] = useState(null);
  const [pendingMessages, setPendingMessages] = useState(new Map()); // Track pending messages

  const chatContainerRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const typingTimeoutsRef = useRef({}); // Track timeout per userId
  const prevScrollHeightRef = useRef(0);
  const isLoadingMoreRef = useRef(false);
  const socketRetryRef = useRef(0);
  const retryTimeoutRef = useRef(null);
  const maxRetries = 3;

  const currentUser = useSelector((state) => state.user?.user);
  const currentUserId = currentUser?.id;

  const {
    data: chatData,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useGetGroupChatHistory(roomId, { limit: 10 });

  const sendMessageMutation = useSendMessage(() => {
    setMessage("");
  });

  // Clear messages when switching to a different club
  useEffect(() => {
    setMessages([]);
    setPendingMessages(new Map());
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }
  }, [clubId]);

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
        }, 0);
      }
      return uniqueMessages;
    });
  }, [chatData?.pages, roomId]);

  // Socket connection and status monitoring
  useEffect(() => {
    const socket = getSocket();

    if (!socket) {
      setSocketError("Socket connection not initialized");
      return;
    }

    const handleConnect = () => {
      setSocketConnected(true);
      setSocketError(null);
      socketRetryRef.current = 0;
    };

    const handleDisconnect = (reason) => {
      setSocketConnected(false);
      setRoomJoined(false);
      console.warn(`Socket disconnected: ${reason}`);
    };

    const handleConnectError = (error) => {
      setSocketError(`Connection error: ${error.message}`);
      console.error("Socket connection error:", error);
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);

    if (socket.connected) {
      setSocketConnected(true);
    }

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
    };
  }, []);

  // Socket.IO room join and messaging
  useEffect(() => {
    const socket = getSocket();
    if (!socket || !roomId || !socketConnected) return;

    try {
      socket.emit("group:join", { roomId });
    } catch (error) {
      console.error("Failed to join room:", error);
      setSocketError("Failed to join chat room");
      if (socketRetryRef.current < maxRetries) {
        socketRetryRef.current += 1;
        setTimeout(() => {
          socket.emit("group:join", { roomId });
        }, 1000 * socketRetryRef.current);
      }
    }

    const handleMessageReceived = (data) => {
      if (data.roomId === roomId) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === data.id)) return prev;
          return [...prev, data];
        });
        setScrollLocked(false);
      }
    };

    const handleRoomJoined = (data) => {
      if (data.roomId === roomId) {
        setRoomJoined(true);
        setSocketError(null);
        console.log(`Successfully joined room: ${roomId}`);
      }
    };

    const handleRoomError = (error) => {
      console.error("Room error:", error);
      setSocketError(error?.message || "Room operation failed");
    };

    const handleUserTyping = (data) => {
      if (data.roomId === roomId && data.userId !== currentUserId) {
        setTypingUsers((prev) => {
          const userExists = prev.find((u) => u.userId === data.userId);
          if (!userExists) {
            return [...prev, { userId: data.userId, userName: data.userName }];
          }
          return prev;
        });

        if (typingTimeoutsRef.current[data.userId]) {
          clearTimeout(typingTimeoutsRef.current[data.userId]);
        }
        typingTimeoutsRef.current[data.userId] = setTimeout(() => {
          setTypingUsers((prev) =>
            prev.filter((u) => u.userId !== data.userId)
          );
          delete typingTimeoutsRef.current[data.userId];
        }, 5000);
      }
    };

    const handleUserStoppedTyping = (data) => {
      if (data.roomId === roomId) {
        setTypingUsers((prev) => prev.filter((u) => u.userId !== data.userId));
        if (typingTimeoutsRef.current[data.userId]) {
          clearTimeout(typingTimeoutsRef.current[data.userId]);
          delete typingTimeoutsRef.current[data.userId];
        }
      }
    };

    socket.on("group:message-received", handleMessageReceived);
    socket.on("group:joined", handleRoomJoined);
    socket.on("group:error", handleRoomError);
    socket.on("group:user-typing", handleUserTyping);
    socket.on("group:user-stopped-typing", handleUserStoppedTyping);

    return () => {
      socket.off("group:message-received", handleMessageReceived);
      socket.off("group:joined", handleRoomJoined);
      socket.off("group:error", handleRoomError);
      socket.off("group:user-typing", handleUserTyping);
      socket.off("group:user-stopped-typing", handleUserStoppedTyping);

      try {
        socket.emit("group:leave", { roomId });
      } catch (error) {
        console.error("Error leaving room:", error);
      }
    };
  }, [roomId, currentUserId, socketConnected]);

  const handleScroll = () => {
    if (!chatContainerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;

    if (scrollTop < 100 && hasNextPage && !isFetchingNextPage && !isLoadingMoreRef.current) {
      isLoadingMoreRef.current = true;
      prevScrollHeightRef.current = scrollHeight;
      setScrollLocked(true);
      fetchNextPage();
    }

    if (scrollHeight - (scrollTop + clientHeight) < 100) {
      setScrollLocked(false);
    }
  };

  useEffect(() => {
    if (isFetchingNextPage) return;

    if (scrollLocked && chatContainerRef.current && prevScrollHeightRef.current > 0) {
      const newScrollHeight = chatContainerRef.current.scrollHeight;
      const heightDifference = newScrollHeight - prevScrollHeightRef.current;
      chatContainerRef.current.scrollTop += heightDifference;
      isLoadingMoreRef.current = false;
    }
  }, [isFetchingNextPage, scrollLocked]);

  const scrollToBottom = () => {
    if (chatContainerRef.current && !scrollLocked) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    // Only auto-scroll to bottom if:
    // 1. Not locked (pagination in progress)
    // 2. User is already near the bottom (within 150px)
    // This prevents jumping to bottom when loading old messages
    if (!scrollLocked && messages.length > 0 && chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
      const isNearBottom = scrollHeight - (scrollTop + clientHeight) < 150;

      if (isNearBottom) {
        setTimeout(() => scrollToBottom(), 0);
      }
    }
  }, [messages.length, scrollLocked]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    if (!socketConnected) {
      setSocketError("Not connected to chat. Please refresh the page.");
      return;
    }

    const messageText = message.trim();
    const tempId = `pending-${Date.now()}`;
    const messageData = {
      message: messageText,
      room_id: roomId,
      message_type: "group",
      media_type: "text",
    };

    const tempMessage = {
      id: tempId,
      message: messageText,
      from_user_id: currentUserId,
      created_at: new Date().toISOString(),
      sender: {
        id: currentUserId,
        full_name: currentUser.full_name,
        profile_image: currentUser.profile_image,
      },
      media_type: "text",
      status: "sending",
      retryCount: 0,
    };

    setMessages((prev) => [...prev, tempMessage]);
    setMessage("");
    setScrollLocked(false);
    setPendingMessages((prev) => new Map(prev).set(tempId, { ...messageData, retryCount: 0 }));

    const sendMessageWithRetry = async (retryCount = 0) => {
      try {
        const response = await sendMessageMutation.mutateAsync(messageData);

        // Extract the actual message object from response
        const serverMessage = response?.data ? response.data : response;

        if (!serverMessage || !serverMessage.id) {
          throw new Error("Invalid server response: missing message ID");
        }

        // Replace temp message with server response (real ID)
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === tempId ? { ...serverMessage, status: "sent" } : msg
          )
        );

        // Remove from pending messages
        setPendingMessages((prev) => {
          const newMap = new Map(prev);
          newMap.delete(tempId);
          return newMap;
        });

        setSocketError(null);

        // Emit via socket for real-time delivery
        const socket = getSocket();
        if (socket && socketConnected) {
          try {
            socket.emit("group:message", {
              roomId,
              message: messageText,
            });
            socket.emit("group:stop-typing", { roomId });
            if (typingTimeoutRef.current) {
              clearTimeout(typingTimeoutRef.current);
            }
          } catch (socketErr) {
            console.error("Socket emit error:", socketErr);
            // Socket emit failure doesn't affect persistence since message is already saved
          }
        }
      } catch (error) {
        console.error(`Failed to send message (attempt ${retryCount + 1}):`, error);

        const msgMaxRetries = 3;
        if (retryCount < msgMaxRetries) {
          // Schedule retry with exponential backoff
          const delayMs = Math.pow(2, retryCount) * 1000;

          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === tempId
                ? { ...msg, status: "retry", retryCount: retryCount + 1 }
                : msg
            )
          );

          retryTimeoutRef.current = setTimeout(() => {
            sendMessageWithRetry(retryCount + 1);
          }, delayMs);
        } else {
          // Final failure
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === tempId
                ? { ...msg, status: "failed", error: "Failed to send after retries" }
                : msg
            )
          );

          setPendingMessages((prev) => {
            const newMap = new Map(prev);
            newMap.delete(tempId);
            return newMap;
          });

          setSocketError("Failed to send message. Please try again.");
        }
      }
    };

    sendMessageWithRetry(0);
  };

  const handleTyping = (e) => {
    setMessage(e.target.value);

    const socket = getSocket();
    if (!socket || !socketConnected) return;

    try {
      socket.emit("group:typing", { roomId });

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        try {
          socket.emit("group:stop-typing", { roomId });
        } catch (error) {
          console.error("Error stopping typing indicator:", error);
        }
      }, 4000);
    } catch (error) {
      console.error("Error emitting typing event:", error);
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

  const handleProfileImageClick = (e, userId) => {
    e.stopPropagation();
    if (userId) {
      if (userId === currentUserId) {
        navigate("/profile");
      } else {
        navigate(`/students/${userId}`);
      }
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="club-chat-container">
      <div className="club-chat-header">
        <div className="club-chat-header-icon">
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
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        </div>
        <div className="club-chat-header-content">
          <h4 className="club-chat-title">{clubName || "Club Discussion"}</h4>
          <p className="club-chat-subtitle">
            {socketConnected ? roomJoined ? "Connected" : "Joining..." : "Not connected"}
          </p>
        </div>
      </div>

      {socketError && (
        <div className="alert alert-warning alert-dismissible fade show" role="alert" style={{ margin: "8px" }}>
          <small>
            <strong>⚠️ Chat Status:</strong> {socketError}
          </small>
          <button
            type="button"
            className="btn-close"
            aria-label="Close"
            onClick={() => setSocketError(null)}
          />
        </div>
      )}

      <div className="club-chat-messages" ref={chatContainerRef} onScroll={handleScroll}>
        {isLoading && messages.length === 0 ? (
          <div className="club-chat-loading">
            <Spinner animation="border" variant="primary" size="sm" />
            <span>Loading messages...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="club-chat-empty">
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
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            <p>No messages yet</p>
            <p className="small">Be the first to start the conversation!</p>
          </div>
        ) : (
          <div className="club-chat-messages-list">
            {isFetchingNextPage && (
              <div style={{ textAlign: "center", padding: "10px" }}>
                <Spinner animation="border" size="sm" variant="primary" />
              </div>
            )}
            {messages.map((msg, index) => {
              const isOwnMessage =
                msg.from_user_id === currentUserId ||
                (msg.sender && msg.sender.id === currentUserId);

              // Use currentUser for own messages, fallback to msg.sender
              const sender = isOwnMessage ? (currentUser || msg.sender || {}) : (msg.sender || {});

              const senderName = isOwnMessage
                ? currentUser?.full_name || "You"
                : (msg.sender?.full_name || msg.sender?.email?.split('@')[0] || "Unknown");

              const profileImage = isOwnMessage
                ? currentUser?.profile_image
                : sender.profile_image;

              return (
                <div
                  key={`${msg.from_user_id}-${msg.created_at}-${index}`}
                  className={`d-flex align-items-end gap-2 mb-3 ${
                    isOwnMessage ? "justify-content-end" : "justify-content-start"
                  }`}
                >
                  {!isOwnMessage && (
                    <div
                      className="flex-shrink-0"
                      onClick={(e) =>
                        handleProfileImageClick(e, msg.from_user_id || msg.sender?.id)
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
                    className={`club-chat-message ${
                      isOwnMessage ? "club-chat-message-own" : ""
                    }`}
                  >
                    <div className="club-chat-message-content">
                      <p>{msg.message}</p>
                    </div>
                    <div className="club-chat-message-meta">
                      {!isOwnMessage && (
                        <span className="club-chat-message-sender">{senderName}</span>
                      )}
                      <span className="club-chat-message-time">{formatTime(msg.created_at)}</span>
                      {msg.status === "sending" && (
                        <span className="ms-2" style={{ fontSize: "12px", color: "#65676b" }}>
                          sending...
                        </span>
                      )}
                      {msg.status === "retry" && (
                        <span className="ms-2" style={{ fontSize: "12px", color: "#f5a623" }}>
                          retry {msg.retryCount}/{3}
                        </span>
                      )}
                      {msg.status === "failed" && (
                        <span
                          className="ms-2"
                          style={{
                            fontSize: "12px",
                            color: "#e74c3c",
                            cursor: "pointer",
                            textDecoration: "underline",
                          }}
                          onClick={() => {
                            const pendingData = pendingMessages.get(msg.id);
                            if (pendingData) {
                              sendMessageMutation
                                .mutateAsync(pendingData)
                                .then((response) => {
                                  const serverMessage = response?.data ? response.data : response;
                                  setMessages((prev) =>
                                    prev.map((m) =>
                                      m.id === msg.id ? { ...serverMessage, status: "sent" } : m
                                    )
                                  );
                                  setPendingMessages((prev) => {
                                    const newMap = new Map(prev);
                                    newMap.delete(msg.id);
                                    return newMap;
                                  });
                                })
                                .catch(() => {
                                  setMessages((prev) =>
                                    prev.map((m) =>
                                      m.id === msg.id ? { ...m, status: "failed" } : m
                                    )
                                  );
                                });
                            }
                          }}
                        >
                          failed - retry
                        </span>
                      )}
                    </div>
                  </div>

                  {isOwnMessage && (
                    <div
                      className="flex-shrink-0"
                      onClick={(e) => handleProfileImageClick(e, currentUserId)}
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

            {typingUsers.length > 0 && (
              <div className="d-flex gap-2 mb-3">
                <div className="flex-shrink-0">

                </div>
                <div className="typing-indicator">
                  {typingUsers.length === 1
                    ? `${typingUsers[0].userName} is typing`
                    : typingUsers.length === 2
                    ? `${typingUsers[0].userName} and ${typingUsers[1].userName} are typing`
                    : `${typingUsers[0].userName}, ${typingUsers[1].userName} and ${typingUsers.length - 2} ${typingUsers.length - 2 === 1 ? 'other' : 'others'} are typing`}
                  <span>.</span>
                  <span>.</span>
                  <span>.</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="club-chat-input-area">
        <form onSubmit={handleSendMessage} className="club-chat-input-form">
          <input
            type="text"
            className="club-chat-input"
            placeholder="Type a message..."
            value={message}
            onChange={handleTyping}
            disabled={sendMessageMutation.isPending}
          />
          <div className="emoji-picker-wrapper" ref={emojiPickerRef}>
            <button
              type="button"
              className="club-chat-emoji-btn"
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
            className="club-chat-send-btn"
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

export default ClubChat;
