import React, { useState } from "react";
import { Button, Spinner, Alert, Card, Nav } from "react-bootstrap";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";
import { confirmAlert } from "react-confirm-alert";
import DashboardLayout from "../component/DashboardLayout";
import FollowRequestsTab from "../component/FollowRequestsTab";
import {
  useGetUserNotifications,
  useDeleteNotification,
  useDeleteAllNotifications,
} from "../hooks";
import "../scss/notifications.scss";

const Notifications = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");

  // Initialize AOS animations
  React.useEffect(() => {
    import("aos").then((AOS) => {
      AOS.init({
        duration: 800,
        easing: "ease-out-cubic",
        once: true,
      });
      AOS.refresh();
    });
    import("aos/dist/aos.css");
  }, [activeTab]);

  // Fetch notifications using hook
  const {
    data: notificationsData,
    isLoading: loading,
    error: errorData,
  } = useGetUserNotifications();
  const notifications = notificationsData?.data || [];
  const error = errorData?.response?.data?.message || errorData?.message;

  // Delete single notification
  const deleteNotificationMutation = useDeleteNotification(() => {
    // Success callback is handled by the hook
  });

  // Delete all notifications
  const deleteAllNotificationsMutation = useDeleteAllNotifications(() => {
    // Success callback is handled by the hook
  });

  const handleDeleteNotification = async (notificationId) => {
    deleteNotificationMutation.mutate(notificationId);
  };

  const handleClearAll = async () => {
    if (notifications.length === 0) return;

    confirmAlert({
      closeOnClickOutside: false,
      overlayClassName: "react-confirm-alert-overlay",
      customUI: ({ onClose }) => (
        <div className="cc-confirm card shadow-sm">
          <div className="card-body">
            <h5 className="card-title mb-2">Clear All Notifications</h5>
            <p className="mb-4">
              Are you sure you want to clear all notifications? This action cannot be
              undone.
            </p>
            <div className="d-flex justify-content-end gap-2">
              <button type="button" className="btn btn-light" onClick={onClose}>
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => {
                  try {
                    deleteAllNotificationsMutation.mutate();
                    onClose();
                  } catch {
                    // handled in onError
                  }
                }}
                disabled={deleteAllNotificationsMutation.isLoading}
              >
                {deleteAllNotificationsMutation.isLoading ? "Clearing..." : "Clear All"}
              </button>
            </div>
          </div>
        </div>
      ),
    });
  };

  const handleNotificationClick = (notification) => {
    // Handle follow/club requests - switch to requests tab only for pending requests
    if (notification.notification_type === "follow_request") {
      setActiveTab("requests");
      return;
    } else if (notification.notification_type === "club_request") {
      // For approved/rejected club requests, navigate to club page
      if (
        notification.related_entity_id &&
        (notification.title.includes("Approved") || notification.title.includes("Rejected"))
      ) {
        navigate(`/clubs/${notification.related_entity_id}`);
        return;
      }
      // For pending club requests, stay on requests tab
      setActiveTab("requests");
      return;
    }

    // Handle message/chat notifications
    // Check if it's a message notification by checking the title pattern
    if (
      notification.notification_type === "general" &&
      notification.title &&
      (notification.title.toLowerCase().includes("new message from") ||
        notification.title.toLowerCase().includes("new message in"))
    ) {
      // Check if it's a private message or group message
      if (notification.title.toLowerCase().includes("new message from")) {
        // Extract sender name from title (format: "New message from {senderName}")
        const senderNameMatch = notification.title.match(
          /New message from (.+)/i,
        );
        if (senderNameMatch && senderNameMatch[1]) {
          const senderName = senderNameMatch[1].trim();
          // Navigate to chat page with sender name - the chat component will find and select the user
          navigate(`/chat?user=${encodeURIComponent(senderName)}`);
        } else {
          // Fallback: just navigate to chat
          navigate("/chat");
        }
      } else if (notification.title.toLowerCase().includes("new message in")) {
        // Group message - redirect to class or club based on channel type
        if (notification.channel_type === 'class' && notification.channel_id) {
          navigate(`/class/${notification.channel_id}`);
        } else if (notification.channel_type === 'club' && notification.channel_id) {
          navigate(`/clubs/${notification.channel_id}`);
        } else {
          // Fallback: navigate to chat
          navigate("/chat");
        }
      }
      return;
    }

    // Handle other notification types with related entities
    if (
      notification.related_entity_type === "event" &&
      notification.related_entity_id
    ) {
      navigate(`/events/${notification.related_entity_id}`);
    } else if (
      notification.related_entity_type === "post" &&
      notification.related_entity_id
    ) {
      navigate(`/feed`);
    } else if (
      notification.related_entity_type === "club" &&
      notification.related_entity_id
    ) {
      navigate(`/clubs/${notification.related_entity_id}`);
    } else {
      // Default: navigate to feed for general notifications
      navigate("/feed");
    }
  };

  const getNotificationColorClass = (type) => {
    if (!type) return "notification-general";
    const normalizedType = type.toLowerCase().replace(/\s+/g, "_");
    return `notification-${normalizedType}`;
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "event":
        return (
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
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
        );
      case "post":
        return (
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
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
            <polyline points="22,6 12,13 2,6"></polyline>
          </svg>
        );
      case "follow_request":
      case "club_request":
        return (
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
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <line x1="19" y1="8" x2="19" y2="14"></line>
            <line x1="22" y1="11" x2="16" y2="11"></line>
          </svg>
        );
      case "announcement":
        return (
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
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
        );
      case "reminder":
        return (
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
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
        );
      case "alert":
        return (
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
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        );
      default:
        return (
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
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
        );
    }
  };

  return (
    <DashboardLayout>
      <div className="notifications-page">
        <div className="notifications-header" data-aos="fade-down">
          <div className="notifications-title">
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
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            <h2>Notifications</h2>
          </div>
          {activeTab === "all" && notifications.length > 0 && (
            <Button
              variant="outline-danger"
              size="sm"
              onClick={handleClearAll}
              disabled={deleteAllNotificationsMutation.isLoading}
            >
              Clear All
            </Button>
          )}
        </div>

        {/* Tabs Navigation */}
        <div className="cc-tabs-main" data-aos="fade-up">
          <Nav
            fill
            variant="cc-tabs"
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k || "all")}
          >
            <Nav.Link eventKey="all">
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
                className="lucide lucide-bell w-4 h-4 flex-shrink-0"
              >
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
              All Activity
            </Nav.Link>
            <Nav.Link eventKey="requests">
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
                className="lucide lucide-user-plus w-4 h-4 flex-shrink-0"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <line x1="19" y1="8" x2="19" y2="14"></line>
                <line x1="22" y1="11" x2="16" y2="11"></line>
              </svg>
              Follow Requests
            </Nav.Link>
          </Nav>
        </div>

        {/* Tab Content */}
        {activeTab === "all" && (
          <div data-aos="fade-up">
            {error && (
              <Alert variant="danger" className="mt-3">
                {error}
              </Alert>
            )}

            {loading && notifications.length === 0 ? (
              <div className="loading-container">
                <Spinner animation="border" variant="primary" />
                <p className="mt-2">Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="64"
                    height="64"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                  </svg>
                </div>
                <h3>You're all caught up!</h3>
                <p>No new notifications</p>
              </div>
            ) : (
              <div className="notifications-list">
                {notifications.map((notification) => (
                  <Card
                    key={notification.id}
                    className={`notification-card ${getNotificationColorClass(notification.notification_type)}`}
                    style={{ cursor: "pointer" }}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <Card.Body className="p-0">
                      <div className="notification-content">
                        <div className="notification-icon">
                          {getNotificationIcon(notification.notification_type)}
                        </div>
                        <div className="notification-details">
                          <h5 className="notification-title">
                            {notification.title}
                          </h5>
                          {notification.description && (
                            <p className="notification-description">
                              {notification.description}
                            </p>
                          )}
                          <div className="notification-meta">
                            {!(notification.notification_type === "club_request" &&
                              (notification.title.includes("Approved") || notification.title.includes("Rejected"))) && (
                              <span className="notification-type">
                                {notification.notification_type.replace("_", " ")}
                              </span>
                            )}
                            <span className="notification-time">
                              {formatDistanceToNow(
                                new Date(notification.created_at),
                                {
                                  addSuffix: true,
                                },
                              )}
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="link"
                          size="sm"
                          className="delete-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteNotification(notification.id);
                          }}
                          disabled={deleteNotificationMutation.isLoading}
                        >
                          {deleteNotificationMutation.isLoading ? (
                            <Spinner animation="border" size="sm" />
                          ) : (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <line x1="18" y1="6" x2="6" y2="18"></line>
                              <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                          )}
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "requests" && (
          <div data-aos="fade-up">
            <FollowRequestsTab />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Notifications;
