import React from "react";
import { Button } from "react-bootstrap";
import { useToggleLike, useGetPostLikes } from "../hooks/useRQPostInteractions";
import {
  useToggleEventLike,
  useGetEventLikes,
} from "../hooks/useRQEventInteractions";
import { usePostLikeUpdates } from "../hooks/useSocket";

/**
 * LikeButton Component
 * Displays like button with count and handles like/unlike
 * Includes real-time updates via Socket.io
 * Supports both posts and events
 */
const LikeButton = ({ post_id, event_id }) => {
  const isEvent = !!event_id && !post_id;
  const itemId = isEvent ? event_id : post_id;

  // Use appropriate hooks based on type
  const togglePostLikeMutation = useToggleLike();
  const toggleEventLikeMutation = useToggleEventLike();
  const toggleLikeMutation = isEvent
    ? toggleEventLikeMutation
    : togglePostLikeMutation;

  const { data: postLikesData, isLoading: postLoading } = useGetPostLikes(
    post_id,
    {},
    undefined,
    () => {}
  );
  const { data: eventLikesData, isLoading: eventLoading } = useGetEventLikes(
    event_id,
    {},
    undefined,
    () => {}
  );

  const likesData = isEvent ? eventLikesData : postLikesData;
  const isLoading = isEvent ? eventLoading : postLoading;

  // Subscribe to real-time like updates (only for posts currently)
  if (!isEvent) {
    usePostLikeUpdates(post_id);
  }

  // Handle different field names for posts vs events
  const isLiked = isEvent
    ? likesData?.data?.is_liked || false
    : likesData?.data?.is_liked_by_current_user || false;
  const likesCount = isEvent
    ? likesData?.data?.count || 0
    : likesData?.data?.likes_count || 0;

  const handleLikeClick = () => {
    if (isEvent) {
      toggleLikeMutation.mutate(event_id);
    } else {
      toggleLikeMutation.mutate({ post_id });
    }
  };

  return (
    <div
      onClick={handleLikeClick}
      className="like-button d-flex align-items-center gap-2"
      style={{
        cursor:
          toggleLikeMutation.isPending || isLoading ? "not-allowed" : "pointer",
        opacity: toggleLikeMutation.isPending || isLoading ? 0.6 : 1,
        color: isLiked ? "#ef4444" : undefined,
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill={isLiked ? "#ef4444" : "none"}
        stroke={isLiked ? "#ef4444" : "currentColor"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          color: isLiked ? "#ef4444" : undefined,
        }}
      >
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
      </svg>
      <span>{likesCount}</span>
    </div>
  );
};

export default LikeButton;
