import React, { useState } from 'react';
import { Modal, ListGroup, Form, Spinner, Button } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { useGetChatEligibleUsers } from '../hooks/useRQChat';
import PrivateChat from './PrivateChat';
import {
  selectPrivateChatNotifications,
  selectPrivateChatTotalCount,
} from '../store/notificationSlice';
import { NotificationCountBadge } from './NotificationIndicators';

/**
 * ChatSidebar Component
 * Displays a modal with user list and chat interface
 */
const ChatSidebar = ({ show, onHide }) => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: usersData, isLoading: usersLoading } = useGetChatEligibleUsers({
    search: searchQuery,
  });
  const privateChatCounts = useSelector(selectPrivateChatNotifications);
  const unreadCount = useSelector(selectPrivateChatTotalCount);

  const eligibleUsers = usersData?.data?.users || [];

  const handleUserClick = (user) => {
    setSelectedUser(user);
  };

  const handleBack = () => {
    setSelectedUser(null);
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="lg"
      centered
      className="chat-sidebar-modal"
    >
      <Modal.Header closeButton className="bg-primary text-white">
        <Modal.Title>
          <div className="d-flex align-items-center gap-2">
            {selectedUser && (
              <Button
                variant="link"
                className="text-white p-0 me-2"
                onClick={handleBack}
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
                  <line x1="19" x2="5" y1="12" y2="12" />
                  <polyline points="12 19 5 12 12 5" />
                </svg>
              </Button>
            )}
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
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <span>{selectedUser ? selectedUser.full_name : 'Messages'}</span>
            {!selectedUser && <NotificationCountBadge count={unreadCount} />}
          </div>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body style={{ padding: 0, minHeight: '500px' }}>
        {selectedUser ? (
          // Show chat interface
          <PrivateChat
            recipientId={selectedUser.id}
            recipientName={selectedUser.full_name}
            recipientImage={selectedUser.profile_image}
          />
        ) : (
          // Show user list
          <div className="user-list-container">
            {/* Search Bar */}
            <div className="p-3 border-bottom">
              <Form.Control
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* User List */}
            {usersLoading ? (
              <div className="text-center py-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-2 text-muted">Loading users...</p>
              </div>
            ) : eligibleUsers.length === 0 ? (
              <div className="text-center py-5 text-muted">
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
                    ? 'No users found'
                    : 'No users available to chat. Follow users to start chatting!'}
                </p>
              </div>
            ) : (
              <ListGroup variant="flush" style={{ maxHeight: '450px', overflowY: 'auto' }}>
                {eligibleUsers.map((user) => (
                  <ListGroup.Item
                    key={user.id}
                    action
                    onClick={() => handleUserClick(user)}
                    className="d-flex align-items-center gap-3 py-3"
                    style={{ cursor: 'pointer' }}
                  >
                    {user.profile_image ? (
                      <img
                        src={user.profile_image}
                        alt={user.full_name}
                        className="rounded-circle"
                        width="50"
                        height="50"
                        style={{ objectFit: 'cover' }}
                      />
                    ) : (
                      <div
                        className="rounded-circle bg-secondary d-flex align-items-center justify-content-center text-white fw-bold"
                        style={{ width: 50, height: 50, fontSize: '20px' }}
                      >
                        {user.full_name?.[0]?.toUpperCase() || 'U'}
                      </div>
                    )}
                    <div className="flex-grow-1">
                      <div className="fw-bold">{user.full_name}</div>
                      <div className="text-muted small">@{user.username}</div>
                    </div>
                    <NotificationCountBadge count={privateChatCounts[user.id]} />
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
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            )}
          </div>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default ChatSidebar;
