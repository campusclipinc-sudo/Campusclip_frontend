import React, { useState, useRef, useEffect } from "react";
import { Spinner, Badge, Image, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow, format } from "date-fns";
import DashboardLayout from "../../component/DashboardLayout";
import SEOHead from "../../components/SEOHead";
import { getMetadata } from "../../utils/seoConfig";
import { useInfiniteUserFeed } from "../../hooks/useRQFeed";
import { useGetProfile } from "../../hooks/useRQauth";
import { useGetUnreadCount } from "../../hooks/useRQChat";
import { useToggleLike } from "../../hooks/useRQPostInteractions";
import { useToggleEventLike } from "../../hooks/useRQEventInteractions";
import CreatePersonalPostModal from "../../components/CreatePersonalPostModal";
import CommentSection from "../../components/CommentSection";
import EventAttendButton from "../../components/EventAttendButton";
import "../../scss/feed.scss";


const Feed = () => {
  const metadata = getMetadata("feed");
  const navigate = useNavigate();
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [doubleClickLikeAnimation, setDoubleClickLikeAnimation] = useState(null);
  const [animatedItems, setAnimatedItems] = useState(new Set());
  const clickTimeoutRef = useRef(null);
  const loadMoreRef = useRef(null);
  const limit = 10;

  const {
    data: feedData,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    error,
    refetch,
  } = useInfiniteUserFeed({ limit });
  const { data: profileData } = useGetProfile();
  const { data: unreadData } = useGetUnreadCount();
  const togglePostLikeMutation = useToggleLike();
  const toggleEventLikeMutation = useToggleEventLike();
  const currentUserId = profileData?.id;
  const unreadCount = unreadData?.data?.total || 0;

  // Flatten all pages into a single array
  const feedItems = feedData?.pages?.flatMap((page) => page?.data?.feed || []) || [];

  // Fetch fresh feed data when user comes to this page
  React.useEffect(() => {
    refetch();
  }, [refetch]);

  // Handle staggered animation of feed items
  React.useEffect(() => {
    feedItems.forEach((item, index) => {
      const timer = setTimeout(() => {
        setAnimatedItems(prev => new Set(prev).add(item.id));
      }, index * 80);
    });
  }, [feedItems.length]);

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
      }
    };
  }, []);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      {
        threshold: 0.1,
        rootMargin: "100px",
      }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handlePostCreated = () => {
    refetch(); // Refresh feed after creating post
  };

  const handleChatOpen = () => {
    navigate("/chat");
  };

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

  const handleAvatarClick = (e, item) => {
    e.stopPropagation(); // Prevent triggering post click handlers
    if (item.club && item.club.id) {
      navigate(`/clubs/${item.club.id}`);
    } else if (item.author && item.author.id) {
      // If it's the current user's own post, go to /profile
      if (item.author.id === currentUserId) {
        navigate("/profile");
      } else {
        navigate(`/students/${item.author.id}`);
      }
    }
  };

  return (
    <>
      <SEOHead {...metadata} />
      <DashboardLayout>
      <div className="feed-page-main">
        <div className="feed-page">
          <div className="feed-header" data-aos="fade-up">
            <div className="feed-title d-flex align-items-center">
              <div className="title-icon">
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
                  data-filename="pages/Feed"
                  data-linenumber="245"
                  data-visual-selector-id="pages/Feed245"
                  data-source-location="pages/Feed:245:14"
                  data-dynamic-content="false"
                >
                  <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"></path>
                  <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                </svg>
              </div>
              <div className="title">
                <h2>Home</h2>
                <p>What's happening on campus</p>
              </div>
            </div>
            <div className="feed-actions d-none d-md-flex flex-wrap">
              <button
                className="btn btn-second"
                aria-label="Notifications"
                onClick={() => navigate("/notifications")}
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
                  className="lucide lucide-bell w-4 h-4"
                  data-filename="pages/Feed"
                  data-linenumber="261"
                  data-visual-selector-id="pages/Feed261"
                  data-source-location="pages/Feed:261:16"
                  data-dynamic-content="false"
                >
                  <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path>
                  <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path>
                </svg>
                Alerts
              </button>
              <button
                className="btn btn-second"
                aria-label="Messages"
                onClick={handleChatOpen}
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
                  className="lucide lucide-mail w-4 h-4"
                  data-filename="pages/Feed"
                  data-linenumber="276"
                  data-visual-selector-id="pages/Feed276"
                  data-source-location="pages/Feed:276:16"
                  data-dynamic-content="false"
                >
                  <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                </svg>
                Messages
                {unreadCount > 0 && (
                  <Badge
                    bg="danger"
                    pill
                    className="position-absolute top-0 start-100 translate-middle"
                    style={{ fontSize: "0.7rem" }}
                  >
                    {unreadCount}
                  </Badge>
                )}
              </button>
            </div>
          </div>

          <div className="feed-content">
            {isLoading ? (
              <div className="feed-loading">
                <Spinner animation="border" variant="primary" />
                <span>Loading your feed...</span>
              </div>
            ) : error ? (
              <div className="feed-error">
                <p>Error loading feed. Please try again.</p>
              </div>
            ) : feedItems.length > 0 ? (
              <>
                <div className="feed-items">
                  {feedItems.map((item) => (
                    <div
                      key={item.id}
                      className={`feed-item feed-item-${item.type} ${animatedItems.has(item.id) ? 'feed-item-visible' : 'feed-item-hidden'}`}
                    >
                      {item.type === "post" ? (
                        <div className="feed-post">
                          <div className="post-header">
                            <div
                              className="post-avatar"
                              onClick={(e) => handleAvatarClick(e, item)}
                              style={{ cursor: "pointer" }}
                            >
                              {item.club?.profileImage ? (
                                <Image
                                  src={item.club.profileImage}
                                  alt={item.club.name}
                                  roundedCircle
                                  className="avatar-img"
                                />
                              ) : item.club ? (
                                <div className="avatar-placeholder">
                                  {item.club.name?.[0]?.toUpperCase() || "C"}
                                </div>
                              ) : item.author?.profileImage ? (
                                <Image
                                  src={item.author.profileImage}
                                  alt={item.author.name}
                                  roundedCircle
                                  className="avatar-img"
                                />
                              ) : (
                                <div className="avatar-placeholder">
                                  {item.author?.name?.[0]?.toUpperCase() || "U"}
                                </div>
                              )}
                            </div>
                            <div className="post-meta">
                              <div className="post-author">
                                {item.club ? item.club.name : (item.author?.name || "Unknown User")}
                              </div>
                              <div className="post-time">
                                {formatDistanceToNow(new Date(item.createdAt), {
                                  addSuffix: true,
                                })}
                              </div>
                            </div>
                            <div className="post-badges">
                              <Badge
                                className={`privacy-badge ${item.isPublic ? 'badge-public' : 'badge-private'}`}
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
                                  {item.isPublic ? (
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
                                  {item.isPublic ? "Public" : "Private"}
                                </span>
                              </Badge>
                            </div>
                          </div>

                          <div
                            className="post-interactive-area"
                            onClick={(e) => handleItemClick(item.itemId, e)}
                            onDoubleClick={() => handleDoubleClickLike(item.itemId, false)}
                            style={{ cursor: "pointer" }}
                          >
                          {item.content && (
                            <div className="post-content">
                              <p>{item.content}</p>
                            </div>
                          )}

                          {item.imageUrl && (
                              <div className="post-image position-relative">
                              <Image
                                src={item.imageUrl}
                                alt="Post"
                                className="post-img"
                              />
                                {doubleClickLikeAnimation === item.itemId && (
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
                            {!item.imageUrl && doubleClickLikeAnimation === item.itemId && (
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
                          <div>
                            <div className="post-footer gap-4">
                              <CommentSection
                                post_id={item.itemId}
                                currentUserId={currentUserId}
                                postData={{
                                  author: item.author,
                                  content: item.content,
                                  imageUrl: item.imageUrl,
                                  club: item.club,
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      ) : item.type === "event" ? (
                        (() => {
                          // Check if event is completed
                          const eventEndTime = item.endAt ? new Date(item.endAt) : null;
                          const eventStartTime = item.startAt ? new Date(item.startAt) : null;
                          const now = new Date();
                          const isCompleted = eventEndTime 
                            ? now > eventEndTime 
                            : (eventStartTime ? now > eventStartTime : false);
                          
                          return (
                            <div className={`feed-post feed-post-event ${isCompleted ? 'event-completed' : ''}`} style={isCompleted ? { opacity: 0.6 } : {}}>
                          <div className="post-header">
                            <div 
                              className="post-avatar"
                              onClick={(e) => handleAvatarClick(e, item)}
                              style={{ cursor: "pointer" }}
                            >
                              {item.club && item.club.profileImage ? (
                                <Image
                                  src={item.club.profileImage}
                                  alt={item.club.name}
                                  roundedCircle
                                  className="avatar-img"
                                />
                              ) : item.author?.profileImage ? (
                                <Image
                                  src={item.author.profileImage}
                                  alt={item.author.name}
                                  roundedCircle
                                  className="avatar-img"
                                />
                              ) : (
                                <div className="avatar-placeholder">
                                  {item.club?.name?.[0]?.toUpperCase() || item.author?.name?.[0]?.toUpperCase() || "U"}
                                </div>
                              )}
                            </div>
                            <div className="post-meta">
                              <div className="post-author">
                                {item.club?.name || item.author?.name || "Unknown"}
                              </div>
                              {item.club && (
                                <div className="post-time">
                                  {formatDistanceToNow(
                                    new Date(item.createdAt),
                                    {
                                      addSuffix: true,
                                    },
                                  )}
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
                              {item.paymentRequired && (
                                <Badge
                                  bg="warning"
                                  text="dark"
                                  className="event-badge"
                                >
                                  Payment Required
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div
                            className="post-interactive-area"
                            onClick={(e) => handleItemClick(item.itemId, e)}
                            onDoubleClick={() => handleDoubleClickLike(item.itemId, true)}
                            style={{ cursor: "pointer" }}
                          >
                          <div className="post-content">
                            {item.title && <p>{item.title}</p>}
                            {item.description && <p className="mt-2">{item.description}</p>}

                            <div className="event-details mt-4 d-flex flex-wrap flex-column">
                              <div className="event-detail-item mb-1 d-flex gap-2 align-items-center text-white">
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
                                  {format(
                                    new Date(item.startAt),
                                    "EEEE, MMMM do, yyyy",
                                  )}
                                </span>
                              </div>
                              {item.location && (
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
                                  <span>{item.location}</span>
                                </div>
                              )}
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
                                  {format(new Date(item.startAt), "h:mm a")}
                                </span>
                              </div>
                            </div>
                            <div className="d-flex mt-4">
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
                                <span>{item.attendeeCount || 0} attending</span>
                              </div>
                            </div>
                            <p className="event-author mt-1">
                              Created by {item.author?.name || "Unknown"}
                            </p>
                              {doubleClickLikeAnimation === item.itemId && (
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
                              event_id={item.itemId}
                              currentUserId={currentUserId}
                              isEvent={true}
                              postData={{
                                author: item.author,
                                club: item.club,
                                description: item.description,
                                location: item.location,
                                startAt: item.startAt,
                              }}
                            />
                            <EventAttendButton
                              eventId={item.itemId}
                              paymentRequired={item.paymentRequired}
                              price={item.price}
                              onAttend={handlePostCreated}
                              creatorId={
                                item.author.id || item.userId || item.author?.id
                              }
                              currentUserId={currentUserId}
                              isCompleted={isCompleted}
                            />
                          </div>
                        </div>
                          );
                        })()
                      ) : null}
                    </div>
                  ))}
                </div>

                {/* Infinite Scroll Load More Trigger */}
                <div ref={loadMoreRef} style={{ height: "20px" }} />

                {/* Loading More Indicator */}
                {isFetchingNextPage && (
                  <div className="feed-loading-more d-flex justify-content-center align-items-center py-4">
                    <Spinner animation="border" variant="primary" size="sm" />
                    <span className="ms-2">Loading more posts...</span>
                  </div>
                )}

                {/* End of Feed Message */}
                {/* {!hasNextPage && feedItems.length > 0 && (
                  <div className="feed-end-message text-center py-4 text-muted">
                    <p>You've reached the end of your feed</p>
                  </div>
                )} */}
              </>
            ) : (
              <div className="feed-empty">
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
                  <path d="M12 2v20M2 12h20"></path>
                </svg>
                <p>No posts or events yet. Join some clubs to see content!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <button
        className="create-post-btn"
        onClick={() => setShowCreatePost(true)}
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
          className="lucide lucide-pen-line w-7 h-7 text-white"
          data-source-location="pages/Feed:315:8"
          data-dynamic-content="false"
        >
          <path d="M12 20h9"></path>
          <path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z"></path>
        </svg>
      </button>

      {/* Create Personal Post Modal */}
      <CreatePersonalPostModal
        show={showCreatePost}
        onHide={() => setShowCreatePost(false)}
        onSuccess={handlePostCreated}
      />
      </DashboardLayout>
    </>
  );
};

export default Feed;
