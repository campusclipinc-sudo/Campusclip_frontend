import React, { useState, useRef, useEffect, useCallback } from "react";
import { Card, Badge, Button, Image } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow, format } from "date-fns";
import PostList from "./PostList";
import LikeButton from "./LikeButton";
import CommentSection from "./CommentSection";
import EventAttendButton from "./EventAttendButton";
import { useToggleLike } from "../hooks/useRQPostInteractions";
import { useToggleEventLike } from "../hooks/useRQEventInteractions";

const FeedItem = ({
  item,
  onDeleteEvent,
  onDeletePost,
  currentUserId,
  showClubInfo,
  clubInfo,
}) => {
  const navigate = useNavigate();
  const [doubleClickLikeAnimation, setDoubleClickLikeAnimation] = useState(null);
  const clickTimeoutRef = useRef(null);
  const togglePostLikeMutation = useToggleLike();
  const toggleEventLikeMutation = useToggleEventLike();

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
      }
    };
  }, []);

  const handleDoubleClickLike = (itemId, isEvent = false) => {
    // Clear any pending single click timeout
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = null;
    }

    // Trigger like action based on type
    if (isEvent) {
      toggleEventLikeMutation.mutate(itemId);
    } else {
      togglePostLikeMutation.mutate({ post_id: itemId });
    }

    // Show animation
    setDoubleClickLikeAnimation(itemId);
    setTimeout(() => {
      setDoubleClickLikeAnimation(null);
    }, 1000);
  };

  const handleItemClick = (itemId, e) => {
    // Handle single click - delay to check for double click
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
    }

    clickTimeoutRef.current = setTimeout(() => {
      // Single click action (if needed in future)
      clickTimeoutRef.current = null;
    }, 300);
  };
  
  // Normalize data structure - handle both item.data and direct item properties
  const eventData = item.data || item;
  const club = eventData.club || item.club;
  const author = eventData.author || eventData.user || item.author;
  
  const handleAvatarClick = (e) => {
    e.stopPropagation();
    if (showClubInfo && clubInfo?.id) {
      navigate(`/clubs/${clubInfo.id}`);
    } else if (club && club.id) {
      navigate(`/clubs/${club.id}`);
    } else if (author && author.id) {
      if (author.id === currentUserId) {
        navigate("/profile");
      } else {
        navigate(`/students/${author.id}`);
      }
    }
  };
  if (item.type === "post") {
    const postAuthor = item.data?.author || item.author;
    const postAuthorName = postAuthor?.full_name || postAuthor?.name || "Unknown";
    const postAuthorImage = postAuthor?.profile_image || postAuthor?.profileImage;
    const postClub = item.data?.club || item.club;
    const postClubImage = postClub?.club_profile_image || postClub?.profileImage;

    // If post belongs to a club, display the club image/name (same as events)
    const hasClub = !!(showClubInfo ? clubInfo : postClub);
    const activeClub = showClubInfo ? clubInfo : postClub;
    const displayName = hasClub ? activeClub.name : postAuthorName;
    const displayImage = hasClub
      ? (activeClub.club_profile_image || activeClub.profileImage || activeClub.profile_image || postClubImage)
      : postAuthorImage;

    const handlePostAvatarClick = (e) => {
      e.stopPropagation();
      if (activeClub?.id) {
        navigate(`/clubs/${activeClub.id}`);
      } else if (postAuthor?.id) {
        if (postAuthor.id === currentUserId) {
          navigate("/profile");
        } else {
          navigate(`/students/${postAuthor.id}`);
        }
      }
    };

    // Render post using existing PostList component structure
    return (
      <div className="feed-post">
        <div className="post-header">
          <div 
            className="post-avatar"
            onClick={handlePostAvatarClick}
            style={{ cursor: "pointer" }}
          >
            {displayImage ? (
              <Image
                src={displayImage}
                alt={displayName}
                roundedCircle
                className="avatar-img"
              />
            ) : (
              <div className="avatar-placeholder">
                {displayName?.[0]?.toUpperCase() || "U"}
              </div>
            )}
          </div>
          <div className="post-meta">
            <div className="post-author">
              {displayName}
            </div>
            <div className="post-time">
              {formatDistanceToNow(new Date(item.data?.created_at || item.createdAt), {
                addSuffix: true,
              })}
            </div>
          </div>
          <div className="post-badges d-flex align-items-center gap-2">
            {/* Privacy Badge - Private or Public */}
            {(item.data?.is_public !== undefined || item.data?.isPublic !== undefined) && (
              <Badge
                className={`privacy-badge ${item.data?.is_public || item.data?.isPublic ? 'badge-public' : 'badge-private'}`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {item.data?.is_public || item.data?.isPublic ? (
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                  ) : (
                    <>
                      <rect
                        width="18"
                        height="11"
                        x="3"
                        y="11"
                        rx="2"
                        ry="2"
                      ></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </>
                  )}
                </svg>
                <span className="ms-1">
                  {item.data?.is_public || item.data?.isPublic ? "Public" : "Private"}
                </span>
              </Badge>
            )}
            {onDeletePost && (
              <Button
                variant="outline-danger"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeletePost(item.data?.id || item.id);
                }}
              >
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
                >
                  <path d="M3 6h18"></path>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </Button>
            )}
          </div>
        </div>
        <div
          className="post-interactive-area"
          onClick={(e) => handleItemClick(item.data?.id || item.id, e)}
          onDoubleClick={() => handleDoubleClickLike(item.data?.id || item.id, false)}
          style={{ cursor: "pointer" }}
        >
          {item.data?.content && (
            <div className="post-content">
              <p>{item.data.content}</p>
            </div>
          )}
          {item.data?.image_url && (
            <div className="post-image position-relative">
              <img
                src={item.data.image_url}
                alt="Post"
                className="post-img"
              />
              {doubleClickLikeAnimation === (item.data?.id || item.id) && (
                <div className="double-click-like-animation">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="80"
                    height="80"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                  </svg>
                </div>
              )}
            </div>
          )}
          {!item.data?.image_url && doubleClickLikeAnimation === (item.data?.id || item.id) && (
            <div className="double-click-like-animation">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="80"
                height="80"
                viewBox="0 0 24 24"
                fill="currentColor"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              </svg>
            </div>
          )}
        </div>
        <div className="post-footer">
          <CommentSection
            post_id={item.data?.id || item.id}
            currentUserId={currentUserId}
            postData={{
              author: postAuthor,
              content: item.data?.content,
              imageUrl: item.data?.image_url,
              club: postClub,
            }}
          />
        </div>
      </div>
    );
  }

  if (item.type === "event") {
    const eventId = eventData.id || item.id || item.itemId;
    const title = eventData.title || item.title;
    const description = eventData.description || item.description;
    const location = eventData.location || item.location || eventData.data?.location;
    const startAt = eventData.startAt || item.startAt || eventData.start_at;
    const endAt = eventData.endAt || item.endAt || eventData.end_at;
    const attendeeCount = eventData.attendeeCount || eventData.attendee_count || item.attendeeCount || 0;
    const paymentRequired = eventData.paymentRequired || eventData.payment_required || item.paymentRequired;
    const price = eventData.price || item.price;
    const createdAt = eventData.createdAt || eventData.created_at || item.createdAt;
    const authorName = author?.full_name || author?.name || "Unknown";
    const clubName = club?.name || "Unknown Club";
    const clubProfileImage = club?.club_profile_image || club?.profileImage;
    const authorProfileImage = author?.profile_image || author?.profileImage;
    
    // Use club info if available (priority: showClubInfo > event's club > author)
    const eventDisplayName = (showClubInfo && clubInfo) ? clubInfo.name : (club ? clubName : authorName);
    const eventDisplayImage = (showClubInfo && clubInfo) ? (clubInfo.club_profile_image || clubInfo.profile_image) : (club ? clubProfileImage : authorProfileImage);

    // Check if event is completed
    const eventEndTime = endAt ? new Date(endAt) : null;
    const eventStartTime = startAt ? new Date(startAt) : null;
    const now = new Date();
    const isCompleted = eventEndTime 
      ? now > eventEndTime 
      : (eventStartTime ? now > eventStartTime : false);

    return (
      <div className={`feed-post feed-post-event ${isCompleted ? 'event-completed' : ''}`} style={isCompleted ? { opacity: 0.6 } : {}}>
        <div className="post-header">
          <div 
            className="post-avatar"
            onClick={handleAvatarClick}
            style={{ cursor: "pointer" }}
          >
            {eventDisplayImage ? (
              <Image
                src={eventDisplayImage}
                alt={eventDisplayName}
                roundedCircle
                className="avatar-img"
              />
            ) : (
              <div className="avatar-placeholder">
                {eventDisplayName?.[0]?.toUpperCase() || "U"}
              </div>
            )}
          </div>
          <div className="post-meta">
            <div className="post-author">
              {eventDisplayName}
            </div>
            {createdAt && (
              <div className="post-time">
                {formatDistanceToNow(new Date(createdAt), {
                  addSuffix: true,
                })}
              </div>
            )}
          </div>
          <div className="d-flex gap-2 align-items-center post-badges">
            <Badge className="item-type-badge event-badge-blue">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M8 2v4"></path>
                <path d="M16 2v4"></path>
                <rect width="18" height="18" x="3" y="4" rx="2"></rect>
                <path d="M3 10h18"></path>
              </svg>
              <span className="ms-1">Event</span>
            </Badge>
            {paymentRequired && (
              <Badge
                bg="warning"
                text="dark"
                className="event-badge"
              >
                Payment Required
              </Badge>
            )}
            {onDeleteEvent && (
              <Button
                variant="outline-danger"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteEvent(eventId);
                }}
              >
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
                >
                  <path d="M3 6h18"></path>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </Button>
            )}
          </div>
        </div>
        <div
          className="post-interactive-area"
          onClick={(e) => handleItemClick(eventId, e)}
          onDoubleClick={() => handleDoubleClickLike(eventId, true)}
          style={{ cursor: "pointer" }}
        >
          <div className="post-content">
            {title && <h5 className="event-title">{title}</h5>}
            {description && <p className="mt-2">{description}</p>}

            <div className="event-details mt-4 d-flex flex-wrap flex-column">
              {startAt && (
                <div className="event-detail-item d-flex gap-2 mb-1 align-items-center text-white">
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
                  >
                    <path d="M8 2v4"></path>
                    <path d="M16 2v4"></path>
                    <rect
                      width="18"
                      height="18"
                      x="3"
                      y="4"
                      rx="2"
                    ></rect>
                    <path d="M3 10h18"></path>
                  </svg>
                  <span>
                    {format(new Date(startAt), "EEEE, MMMM do, yyyy")}
                  </span>
                </div>
              )}
              {location && (
                <div className="event-detail-item d-flex gap-2 mb-1 align-items-center text-white">
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
                  >
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <span>{location}</span>
                </div>
              )}
              {startAt && (
                <div className="event-detail-item d-flex gap-2 mb-1 align-items-center text-white">
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
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                  <span>
                    {format(new Date(startAt), "h:mm a")}
                  </span>
                </div>
              )}
            </div>
            <div className="d-flex mt-3">
              <div className="event-detail-item d-flex gap-2 align-items-center text-white">
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
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
                <span>{attendeeCount} attending</span>
              </div>
            </div>
            <p className="event-author mt-1">
              Created by {authorName}
            </p>
            {doubleClickLikeAnimation === eventId && (
              <div className="double-click-like-animation">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="80"
                  height="80"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                </svg>
              </div>
            )}
          </div>
        </div>

        <div className="post-footer column-gap-4 d-flex flex-wrap align-items-center">
          <CommentSection
            event_id={eventId}
            currentUserId={currentUserId}
            isEvent={true}
            postData={{
              author: author,
              club: club,
              description: description,
              location: location,
              startAt: startAt,
            }}
          />
          <EventAttendButton
            eventId={eventId}
            paymentRequired={paymentRequired}
            price={price}
            creatorId={author?.id || eventData.userId || eventData.user_id}
            currentUserId={currentUserId}
            isCompleted={isCompleted}
          />
        </div>
      </div>
    );
  }

  return null;
};

export default React.memo(FeedItem, (prevProps, nextProps) => {
  // Custom comparison to prevent unnecessary re-renders
  return (
    prevProps.item === nextProps.item &&
    prevProps.currentUserId === nextProps.currentUserId &&
    prevProps.showClubInfo === nextProps.showClubInfo &&
    prevProps.clubInfo === nextProps.clubInfo
  );
});
