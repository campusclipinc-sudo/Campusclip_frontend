import React, { useState } from "react";
import {
  Button,
  Form,
  ListGroup,
  Spinner,
  Badge,
  Modal,
  Image,
} from "react-bootstrap";
import { formatDistanceToNow } from "date-fns";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import { useGetProfile } from "../hooks/useRQauth";
import {
  useAddComment,
  useGetPostComments,
  useUpdateComment,
  useDeleteComment,
} from "../hooks/useRQPostInteractions";
import {
  useAddEventComment,
  useGetEventComments,
  useUpdateEventComment,
  useDeleteEventComment,
} from "../hooks/useRQEventInteractions";
import { usePostCommentUpdates } from "../hooks/useSocket";
import LikeButton from "./LikeButton";

/**
 * CommentItem Component
 * Displays a single comment with edit/delete options
 */
const CommentItem = ({ comment, currentUserId, isEvent = false }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.comment);
  const [imageError, setImageError] = useState(false);

  const updatePostCommentMutation = useUpdateComment();
  const updateEventCommentMutation = useUpdateEventComment();
  const updateCommentMutation = isEvent
    ? updateEventCommentMutation
    : updatePostCommentMutation;

  const deletePostCommentMutation = useDeleteComment();
  const deleteEventCommentMutation = useDeleteEventComment();
  const deleteCommentMutation = isEvent
    ? deleteEventCommentMutation
    : deletePostCommentMutation;

  const isOwner = currentUserId === comment.user.id;

  const handleUpdate = () => {
    if (!editText.trim()) return;

    updateCommentMutation.mutate(
      {
        comment_id: comment.id,
        comment: editText,
      },
      {
        onSuccess: () => {
          setIsEditing(false);
        },
      },
    );
  };

  const handleDelete = () => {
    toast.loading("Deleting comment...");
    deleteCommentMutation.mutate({ comment_id: comment.id });
  };

  const handleCancel = () => {
    setEditText(comment.comment);
    setIsEditing(false);
  };

  const getUserName = () => {
    if (!comment.user) return "Unknown User";
    return comment.user?.name || comment.user?.full_name || comment.user?.username || "Unknown User";
  };

  const getInitials = () => {
    const name = getUserName();
    return name[0]?.toUpperCase() || "U";
  };

  const hasProfileImage = comment.user?.profile_image && !imageError;

  return (
    <ListGroup.Item className="comment-item">
      <div className="d-flex flex-column gap-2">
        <div className="d-flex justify-content-between align-items-start">
          <div className="d-flex gap-2 flex-grow-1">
            {hasProfileImage ? (
              <img
                src={comment.user.profile_image}
                alt={getUserName()}
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  flexShrink: 0,
                }}
                onError={() => {
                  setImageError(true);
                }}
              />
            ) : (
              <div
                className="rounded-circle bg-secondary d-flex align-items-center justify-content-center text-white"
                style={{
                  width: "40px",
                  height: "40px",
                  fontSize: "16px",
                  flexShrink: 0,
                }}
              >
                {getInitials()}
              </div>
            )}
            <div className="flex-grow-1">
              <div className="d-flex align-items-center gap-1 mb-1 flex-wrap">
                <strong>{getUserName()}</strong>
                {comment.user?.username && (
                  <span className="small">@{comment.user.username}</span>
                )}
                <span className="small">
                  {formatDistanceToNow(new Date(comment.created_at), {
                    addSuffix: true,
                  })}
                </span>
                {comment.created_at !== comment.updated_at && (
                  <Badge bg="secondary" className="small text-muted">
                    Edited
                  </Badge>
                )}
              </div>

              {isEditing ? (
                <div className="mt-2">
                  <Form.Control
                    as="textarea"
                    rows={2}
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    maxLength={2000}
                    disabled={updateCommentMutation.isPending}
                  />
                  <div className="d-flex gap-2 mt-2">
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={handleUpdate}
                      disabled={
                        updateCommentMutation.isPending || !editText.trim()
                      }
                    >
                      {updateCommentMutation.isPending ? "Saving..." : "Save"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline-secondary"
                      onClick={handleCancel}
                      disabled={updateCommentMutation.isPending}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="mb-0">{comment.comment}</p>
              )}
            </div>
          </div>

          {isOwner && !isEditing && (
            <div className="d-flex gap-1">
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => setIsEditing(true)}
                disabled={deleteCommentMutation.isPending}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                  <path d="m15 5 4 4" />
                </svg>
              </Button>
              <Button
                variant="outline-danger"
                size="sm"
                onClick={handleDelete}
                disabled={deleteCommentMutation.isPending}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 6h18" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </Button>
            </div>
          )}
        </div>
      </div>
    </ListGroup.Item>
  );
};

/**
 * CommentSection Component
 * Displays comments list and input form for a post or event
 * Includes real-time updates via Socket.io
 */
const CommentSection = ({
  post_id,
  event_id,
  currentUserId,
  isEvent = false,
  postData = null, // Original post/event data for modal preview
}) => {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [page, setPage] = useState(1);
  const [currentUserImageError, setCurrentUserImageError] = useState(false);
  const { data: currentUserProfile } = useGetProfile();
  const currentUser = currentUserProfile?.data || currentUserProfile;


  // Use appropriate hooks based on type
  const { data: postCommentsData, isLoading: postLoading } = useGetPostComments(
    post_id,
    { page, limit: 10 },
  );
  const { data: eventCommentsData, isLoading: eventLoading } =
    useGetEventComments(event_id, { page, limit: 10 });

  const commentsData = isEvent ? eventCommentsData : postCommentsData;
  const isLoading = isEvent ? eventLoading : postLoading;

  const addPostCommentMutation = useAddComment();
  const addEventCommentMutation = useAddEventComment();
  const addCommentMutation = isEvent
    ? addEventCommentMutation
    : addPostCommentMutation;

  // Subscribe to real-time comment updates (only for posts currently)
  if (!isEvent) {
    usePostCommentUpdates(post_id);
  }

  const comments = commentsData?.data?.comments || [];
  // Handle both 'comments_count' and 'count' for backward compatibility
  const commentsCount =
    commentsData?.data?.comments_count ?? commentsData?.data?.count ?? 0;
  const totalPages =
    commentsData?.data?.pagination?.total_pages ||
    commentsData?.data?.pagination?.totalPages ||
    1;

  const handleAddComment = () => {
    if (!commentText.trim()) return;

    if (isEvent) {
      addCommentMutation.mutate(
        {
          event_id,
          comment: commentText,
        },
        {
          onSuccess: () => {
            setCommentText("");
          },
        },
      );
    } else {
      addCommentMutation.mutate(
        {
          post_id,
          comment: commentText,
        },
        {
          onSuccess: () => {
            setCommentText("");
          },
        },
      );
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAddComment();
    }
  };

  const handleClose = () => {
    setShowComments(false);
    setCommentText("");
    setPage(1);
  };


  return (
    <>
      <div className="d-flex align-items-baseline gap-3 order-1">
        <LikeButton post_id={post_id} event_id={event_id} />
        <div className="comment-section">
          <div
            onClick={() => setShowComments(true)}
            className="comment-toggle d-flex align-items-center gap-2"
            style={{
              cursor: "pointer",
            }}
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
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <span style={{ minWidth: "1ch", display: "inline-block" }}>
              {commentsCount}
            </span>
          </div>
        </div>
      </div>

      <Modal
        show={showComments}
        onHide={handleClose}
        centered
        className="comment-modal"
        size="md"
      >
        <Modal.Header className="comment-modal-header">
          <div className="d-flex align-items-center justify-content-between w-100">
            <Button
              variant="link"
              onClick={handleClose}
              className="comment-modal-close"
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
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </Button>
            <h5 className="mb-0">Post your reply</h5>
            <div style={{ width: "20px" }}></div>
          </div>
        </Modal.Header>
        <Modal.Body className="comment-modal-body">
          {/* Comment Input */}
          <div className="comment-modal-input">
            <div className="d-flex">
              <div className="flex-shrink-0">
                {currentUser?.profile_image && !currentUserImageError ? (
                  <Image
                    src={currentUser.profile_image}
                    alt={currentUser.full_name || "User"}
                    roundedCircle
                    style={{
                      width: "40px",
                      height: "40px",
                      objectFit: "cover",
                    }}
                    onError={() => setCurrentUserImageError(true)}
                  />
                ) : (
                  <div
                    className="rounded-circle bg-secondary d-flex align-items-center justify-content-center text-white"
                    style={{ width: "40px", height: "40px", fontSize: "16px" }}
                  >
                    {(currentUser?.full_name || "U")[0]?.toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex-grow-1">
                <Form.Group className="mb-0">
                  <Form.Control
                    as="textarea"
                    placeholder="Post your reply"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyPress={handleKeyPress}
                    maxLength={2000}
                    disabled={addCommentMutation.isPending}
                    className="comment-textarea"
                  />
                  <div className="d-flex justify-content-end align-items-center">
                    <div className="d-flex align-items-center gap-2">
                      <Button
                        variant="primary"
                        onClick={handleAddComment}
                        disabled={
                          addCommentMutation.isPending || !commentText.trim()
                        }
                        className="comment-submit-btn"
                        title="Send comment"
                      >
                        {addCommentMutation.isPending ? (
                          <Spinner animation="border" size="sm" />
                        ) : (
                          <FontAwesomeIcon icon={faPaperPlane} />
                        )}
                      </Button>
                    </div>
                  </div>
                </Form.Group>
              </div>
            </div>
          </div>

          {/* Comments List */}
          <div className="comment-modal-comments mt-4">
            {isLoading ? (
              <div className="text-center py-3">
                <Spinner animation="border" size="sm" />
                <p className="text-muted small mt-2">Loading comments...</p>
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-3 text-muted">
                <p className="">
                  No comments yet. Be the first to comment!
                </p>
              </div>
            ) : (
              <>
                <ListGroup className="border-0">
                  {comments.map((comment) => (
                    <CommentItem
                      key={comment.id}
                      comment={comment}
                      currentUserId={currentUserId}
                      isEvent={isEvent}
                    />
                  ))}
                </ListGroup>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="d-flex justify-content-center gap-2 mt-3">
                    <Button
                      size="sm"
                      variant="outline-secondary"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1 || isLoading}
                    >
                      Previous
                    </Button>
                    <span className="align-self-center small">
                      Page {page} of {totalPages}
                    </span>
                    <Button
                      size="sm"
                      variant="outline-secondary"
                      onClick={() =>
                        setPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={page === totalPages || isLoading}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default CommentSection;
