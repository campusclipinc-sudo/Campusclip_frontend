import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  ListGroup,
  Form,
  Badge,
  Spinner,
} from "react-bootstrap";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  useGetChatEligibleUsers,
  useGetConversations,
} from "../../hooks/useRQChat";
import PrivateChat from "../../components/PrivateChat";
import DashboardLayout from "../../component/DashboardLayout";
import "../../scss/chat.scss";
import {
  selectPrivateChatNotifications,
  selectPrivateChatTotalCount,
} from "../../store/notificationSlice";
import { NotificationCountBadge } from "../../components/NotificationIndicators";

/**
 * Chat Page Component
 * Main chat interface with conversation list and chat window
 */
const Chat = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Check for user query parameter (from notification redirect)
  const userParam = searchParams.get("user");

  const { data: conversationsData, isLoading: conversationsLoading } =
    useGetConversations({
      message_type: "private",
    });
  const { data: usersData, isLoading: usersLoading } = useGetChatEligibleUsers({
    search: searchQuery,
  });
  const privateChatCounts = useSelector(selectPrivateChatNotifications);
  const unreadCount = useSelector(selectPrivateChatTotalCount);

  const conversations = conversationsData?.data?.conversations || [];
  const eligibleUsers = usersData?.data?.users || [];

  // Create a map of user IDs with conversation data
  const conversationMap = new Map();
  conversations.forEach((conv) => {
    if (conv.other_user) {
      conversationMap.set(conv.other_user.id, conv);
    }
  });

  // Merge eligible users with conversation data
  const userList = eligibleUsers.map((user) => {
    const conversation = conversationMap.get(user.id);
    return {
      ...user,
      last_message: conversation?.last_message || null,
      last_message_time: conversation?.last_message_time || null,
      unread_count:
        Number(privateChatCounts[user.id] || 0) ||
        Number(conversation?.unread_count || 0),
    };
  });

  // Sort by last message time (most recent first)
  const sortedUserList = userList.sort((a, b) => {
    if (!a.last_message_time && !b.last_message_time) return 0;
    if (!a.last_message_time) return 1;
    if (!b.last_message_time) return -1;
    return new Date(b.last_message_time) - new Date(a.last_message_time);
  });

  const handleUserClick = (user) => {
    setSelectedUser(user);
    // Save to localStorage (persists across hard refreshes)
    localStorage.setItem("selectedChatUser", JSON.stringify(user));
    // Mark that we're on the chat page
    localStorage.setItem("isOnChatPage", "true");
    // Clear the user query parameter after selection
    navigate("/chat", { replace: true });
  };

  // Mark that we're on the chat page when component mounts
  useEffect(() => {
    localStorage.setItem("isOnChatPage", "true");

    // Cleanup when leaving the page (but not on refresh)
    return () => {
      // Set a flag that we're leaving the chat page
      localStorage.setItem("isOnChatPage", "false");
    };
  }, []);

  // Restore selected user from localStorage only if coming from a refresh
  useEffect(() => {
    if (!selectedUser && sortedUserList.length > 0) {
      // Check if we were on the chat page before (indicates refresh, not navigation)
      const wasOnChatPage = localStorage.getItem("isOnChatPage");
      const savedUser = localStorage.getItem("selectedChatUser");

      if (wasOnChatPage === "true" && savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          // Find the user in the current list to get updated data
          const currentUser = sortedUserList.find(
            (u) => u.id === parsedUser.id,
          );
          if (currentUser) {
            setSelectedUser(currentUser);
          }
        } catch (e) {
          console.error("Error parsing saved user:", e);
          localStorage.removeItem("selectedChatUser");
        }
      }
    }
  }, [sortedUserList.length]);

  // Auto-select user from query parameter if provided (from notification click)
  useEffect(() => {
    if (userParam && sortedUserList.length > 0 && !selectedUser) {
      // Try to find user by name (full name or username)
      // Match by exact name first, then partial match
      const decodedParam = decodeURIComponent(userParam).toLowerCase().trim();
      const foundUser = sortedUserList.find((user) => {
        const fullName = (user.full_name || "Someone").toLowerCase();
        const username = (user.username || "").toLowerCase();
        const email = (user.email || "").toLowerCase();

        // Exact match preferred, then partial match
        return (
          fullName === decodedParam ||
          username === decodedParam ||
          email === decodedParam ||
          fullName.includes(decodedParam) ||
          username.includes(decodedParam) ||
          email.includes(decodedParam)
        );
      });

      if (foundUser) {
        setSelectedUser(foundUser);
        localStorage.setItem("selectedChatUser", JSON.stringify(foundUser));
        localStorage.setItem("isOnChatPage", "true");
        // Clear the query parameter after selection
        setTimeout(() => {
          navigate("/chat", { replace: true });
        }, 100);
      } else {
        // If user not found, try searching with the name
        setSearchQuery(decodeURIComponent(userParam));
      }
    }
  }, [userParam, sortedUserList.length, navigate]); // Only depend on length to avoid re-running unnecessarily

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);

    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;

    const days = Math.floor(diff / 86400);
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days}d`;

    return date.toLocaleDateString();
  };

  const handleProfileImageClick = (e, userId) => {
    e.stopPropagation();
    if (userId) {
      navigate(`/students/${userId}`);
    }
  };

  return (
    <DashboardLayout>
      <div className="chat-page">
        <Container fluid className="h-100">
          <Row className="h-100">
            {/* Conversation List - Left Sidebar */}
            <Col md={4} lg={3} className={`chat-sidebar border-end p-0 ${!selectedUser ? 'show' : ''}`}>
              <div className="h-100 border-0 rounded-0">
                {/* Header */}
                <div className="chat-sidebar-header">
                  <div className="d-flex align-items-center justify-content-between">
                    <h5 className="mb-0 d-flex align-items-center">
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
                        className="me-2"
                      >
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                      Messages
                    </h5>
                    <NotificationCountBadge count={unreadCount} className="chat-unread-badge" />
                  </div>
                </div>

                {/* Search Bar */}
                <div className="chat-search-container">
                  <div className="position-relative">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="chat-search-icon"
                    >
                      <circle cx="11" cy="11" r="8"></circle>
                      <path d="m21 21-4.35-4.35"></path>
                    </svg>
                    <Form.Control
                      type="text"
                      placeholder="Search conversations..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="chat-search-input"
                    />
                  </div>
                </div>

                {/* Conversation List */}
                <div className="overflow-auto list-sidebar-chat">
                  {conversationsLoading || usersLoading ? (
                    <div className="text-center py-5">
                      <Spinner animation="border" variant="primary" size="sm" />
                      <p className="mt-2 text-muted small">
                        Loading conversations...
                      </p>
                    </div>
                  ) : sortedUserList.length === 0 ? (
                    <div className="text-center py-5 px-3 text-muted">
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
                        className="mb-3"
                      >
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                      <p>
                        {searchQuery
                          ? "No conversations found"
                          : "No conversations yet. Follow users to start chatting!"}
                      </p>
                    </div>
                  ) : (
                    <ListGroup variant="flush">
                      {sortedUserList.map((user) => (
                        <ListGroup.Item
                          key={user.id}
                          action
                          active={selectedUser?.id === user.id}
                          onClick={() => handleUserClick(user)}
                          className="conversation-item border-0"
                        >
                          <div className="d-flex align-items-start gap-3">
                            {/* Profile Image */}
                            <div
                              className="position-relative flex-shrink-0"
                              onClick={(e) =>
                                handleProfileImageClick(e, user.id)
                              }
                              style={{ cursor: "pointer" }}
                            >
                              {user.profile_image ? (
                                <img
                                  src={user.profile_image}
                                  alt={user.full_name}
                                  className="rounded-circle"
                                  width="50"
                                  height="50"
                                  style={{ objectFit: "cover" }}
                                />
                              ) : (
                                <div
                                  className="rounded-circle bg-secondary d-flex align-items-center justify-content-center text-white fw-bold"
                                  style={{
                                    width: 50,
                                    height: 50,
                                    fontSize: "20px",
                                  }}
                                >
                                  {user.full_name?.[0]?.toUpperCase() || "U"}
                                </div>
                              )}
                              {/* Online status indicator - can be added later */}
                            </div>

                            {/* User Info */}
                            <div className="flex-grow-1 overflow-hidden">
                              <div className="d-flex justify-content-between align-items-start">
                                <div className="fw-bold text-truncate">
                                  {user.full_name}
                                </div>
                                {user.last_message_time && (
                                  <small className="text-muted flex-shrink-0 ms-2">
                                    {formatTime(user.last_message_time)}
                                  </small>
                                )}
                              </div>
                              <div className="d-flex justify-content-between align-items-center">
                                <small className="text-muted text-truncate">
                                  {user.last_message || "Start a conversation"}
                                </small>
                                <NotificationCountBadge
                                  count={user.unread_count}
                                  className="ms-2 flex-shrink-0"
                                />
                              </div>
                            </div>
                          </div>
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  )}
                </div>
              </div>
            </Col>

            {/* Chat Window - Right Side */}
            <Col md={8} lg={9} className="chat-window p-0">
              {selectedUser ? (
                <PrivateChat
                  recipientId={selectedUser.id}
                  recipientName={selectedUser.full_name}
                  recipientImage={selectedUser.profile_image}
                  onBack={() => setSelectedUser(null)}
                />
              ) : (
                <div className="d-flex flex-column align-items-center justify-content-center h-100 text-muted">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="100"
                    height="100"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mb-4"
                    opacity="0.3"
                  >
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    <line x1="9" x2="15" y1="10" y2="10" />
                    <line x1="12" x2="12" y1="7" y2="13" />
                  </svg>
                  <h4>Select a conversation</h4>
                  <p>Choose a user from the list to start chatting</p>
                </div>
              )}
            </Col>
          </Row>
        </Container>
      </div>
    </DashboardLayout>
  );
};

export default Chat;
