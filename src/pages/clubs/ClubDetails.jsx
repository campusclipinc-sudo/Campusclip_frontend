import React from "react";
import { useParams, Link, useNavigate, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { format, formatDistanceToNow } from "date-fns";
import {
  Card,
  Row,
  Col,
  Badge,
  Button,
  Spinner,
  Nav,
  Dropdown,
} from "react-bootstrap";
import DashboardLayout from "../../component/DashboardLayout";
import {
  useGetClub,
  useLeaveClub,
  useListMembers,
} from "../../hooks/useRQClub";
import {
  useListClubRequests,
  useRequestClub,
  useFollowClub,
} from "../../hooks/useRQClubRequest";
import { confirmAlert } from "react-confirm-alert";
import ClubRequestsModal from "./ClubRequestsModal";
import ClubSettingsModal from "./ClubSettingsModal";
import ManageMembersModal from "./ManageMembersModal";
import CreateEventModal from "./CreateEventModal";
import { useInfiniteListPosts } from "../../hooks/useRQPost";
import { useDeletePost } from "../../hooks/useRQPost";
import { useEvents, useDeleteEvent } from "../../hooks";
import CreatePostModal from "./CreatePostModal";
import FeedItem from "../../components/FeedItem";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import ClubChat from "../../components/ClubChat";
import EventAttendButton from "../../components/EventAttendButton";
import LikeButton from "../../components/LikeButton";
import CommentSection from "../../components/CommentSection";
import ProfilePhotoModal from "../../components/ProfilePhotoModal";
import ChannelNotificationService from "../../api/channelNotificationService";
import { NotificationDot } from "../../components/NotificationIndicators";
import { selectClubNotifications } from "../../store/notificationSlice";

const ClubDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentUser = useSelector((state) => state.user?.user);
  const clubNotifications = useSelector(selectClubNotifications);
  const currentUserId = currentUser?.id;
  const { data, isLoading } = useGetClub(id);
  const club = data?.data || null;

  const { data: reqData } = useListClubRequests(
    { club_id: id, status: "pending" },
    undefined,
    undefined,
  );
  const pendingCount = Array.isArray(reqData?.data) ? reqData.data.length : 0;

  // Get active tab from URL params, default to "discussion"
  const tabFromUrl = searchParams.get("tab");
  const [activeTab, setActiveTab] = React.useState(
    tabFromUrl && ["discussion", "chat", "events", "members"].includes(tabFromUrl)
      ? tabFromUrl
      : "discussion"
  );
  const clubChannelNotifications = clubNotifications.byClub?.[id] || {};

  const handleProfileImageClick = (e, userId) => {
    e.stopPropagation();
    if (userId) {
      // If it's the current user's own profile, go to /profile
      if (userId === currentUserId) {
        navigate("/profile");
      } else {
        navigate(`/students/${userId}`);
      }
    }
  };

  // Update URL when tab changes
  const handleTabChange = (tab) => {
    setActiveTab(tab || "discussion");
    const newSearchParams = new URLSearchParams(searchParams);
    if (tab && tab !== "discussion") {
      newSearchParams.set("tab", tab);
    } else {
      newSearchParams.delete("tab");
    }
    setSearchParams(newSearchParams, { replace: true });

    // Scroll to chat content only when chat tab is clicked
    if (tab === "chat") {
      setTimeout(() => {
        const tabContent = document.querySelector('.cc-tabs-main');
        if (tabContent) {
          tabContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 0);
    }
  };
  const [showRequests, setShowRequests] = React.useState(false);
  const [showSettings, setShowSettings] = React.useState(false);
  const [showMembers, setShowMembers] = React.useState(false);
  const [showCreateEvent, setShowCreateEvent] = React.useState(false);
  const [showCreatePost, setShowCreatePost] = React.useState(false);
  const [showPhotoModal, setShowPhotoModal] = React.useState(false);
  const [showManageMenu, setShowManageMenu] = React.useState(false);
  const queryClient = useQueryClient();

  // Sync activeTab with URL when URL changes (e.g., browser back/forward)
  React.useEffect(() => {
    const tabFromUrl = searchParams.get("tab");
    if (tabFromUrl && ["discussion", "chat", "events", "members"].includes(tabFromUrl)) {
      if (tabFromUrl !== activeTab) {
        setActiveTab(tabFromUrl);
      }
    } else if (!tabFromUrl && activeTab !== "discussion") {
      setActiveTab("discussion");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

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

  React.useEffect(() => {
    const clearableTabs = new Set(["chat", "events", "members"]);
    if (!id || !clearableTabs.has(activeTab)) {
      return;
    }

    ChannelNotificationService.clear({
      channel_type: "club",
      channel_id: id,
      module_key: activeTab,
    }).catch((error) => {
      console.error("Failed to clear club channel notification:", error);
    });
  }, [activeTab, id]);

  // Request to join club mutation
  const { mutate: requestClub, isPending: isRequestPending } = useRequestClub(
    (res) => {
      const message =
        res?.data?.message ||
        res?.message ||
        "Operation completed successfully";
      queryClient.invalidateQueries({ queryKey: ["club", id] });
    },
  );

  // Follow club mutation
  const { mutate: followClub, isPending: isFollowPending } = useFollowClub(
    (res) => {
      queryClient.invalidateQueries({ queryKey: ["club", id] });
    },
  );

  // Leave club mutation
  const leaveClubMutation = useLeaveClub(
    (res) => {
      navigate("/clubs");
    },
    (error) => {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to leave club";
      toast.error(message);
    },
  );

  const handleLeaveClub = () => {
    if (!club?.id) {
      toast.error("Club ID is missing");
      return;
    }

    confirmAlert({
      closeOnClickOutside: false,
      overlayClassName: "react-confirm-alert-overlay",
      customUI: ({ onClose }) => (
        <div className="cc-confirm card shadow-sm">
          <div className="card-body">
            <h5 className="card-title mb-2">Leave Club</h5>
            <p className="mb-4">
              Are you sure you want to leave "{club.name}"? You will need to
              request to join again if you want to rejoin.
            </p>
            <div className="d-flex justify-content-end gap-2">
              <button type="button" className="btn btn-light" onClick={onClose}>
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => {
                  leaveClubMutation.mutate({ club_id: club.id });
                  onClose();
                }}
                disabled={leaveClubMutation.isPending}
              >
                {leaveClubMutation.isPending ? "Leaving..." : "Leave Club"}
              </button>
            </div>
          </div>
        </div>
      ),
    });
  };

  const {
    data: membersData,
    isLoading: isLoadingMembers,
    error: membersError,
  } = useListMembers(club?.id ? { club_id: club.id } : null);

  const membersPayload = membersData?.data || {};
  const owner = membersPayload?.owner || null;
  const members = Array.isArray(membersPayload?.members)
    ? membersPayload.members
    : [];
  const allMembers = owner
    ? [{ ...owner, isOwner: true }, ...members]
    : members;

  // Check if current user is admin (owner or promoted admin)
  const isAdmin =
    !!currentUserId &&
    (club?.user_id === currentUserId ||
      members.some((member) => member.id === currentUserId && member.is_admin));

  const isMember =
    currentUserId &&
    (isAdmin ||
      club?.isApprovedMember ||
      members.some((member) => member.id === currentUserId));

  // Reset to "discussion" if not a member and a members-only tab is active
  React.useEffect(() => {
    if (!isMember && ["chat", "events", "members"].includes(activeTab)) {
      setActiveTab("discussion");
    }
  }, [isMember, activeTab]);

  // Fetch combined feed (posts + events) for this club - always fetch but use cache
  const {
    data: feedData,
    isLoading: isLoadingFeed,
    error: feedError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteListPosts(club?.id ? { club_id: club.id, isMember } : null);

  // Flatten all pages into a single feed array
  const feed = feedData?.pages?.flatMap((page) => page?.data?.feed || []) || [];

  // Fetch events for this club - always fetch but use cache
  const {
    data: eventsData,
    isLoading: isLoadingEvents,
    error: eventsError,
  } = useEvents(club?.id ? { club_id: club.id } : null);

  const events = eventsData?.data || [];

  // Fetch club members - always fetch since we need it for authorization checks

  // Check if current user is a member of the club (owner or approved member)

  // Delete event mutation (used in both discussion feed and events tab)
  const deleteEventMutation = useDeleteEvent(() => {
    // Invalidate both posts feed and events cache
    queryClient.invalidateQueries({ queryKey: ["posts"] });
    queryClient.invalidateQueries({ queryKey: ["posts-infinite"] });
    queryClient.invalidateQueries({ queryKey: ["events"] });
  });

  const deletePostMutation = useDeletePost(() => {
    queryClient.invalidateQueries({ queryKey: ["posts"] });
    queryClient.invalidateQueries({ queryKey: ["posts-infinite"] });
  });

  const handleDeletePost = (postId) => {
    confirmAlert({
      closeOnClickOutside: false,
      overlayClassName: "react-confirm-alert-overlay",
      customUI: ({ onClose }) => (
        <div className="cc-confirm card shadow-sm">
          <div className="card-body">
            <h5 className="card-title mb-2">Delete Post</h5>
            <p className="mb-4">
              Are you sure you want to delete this post? This action cannot be
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
                  deletePostMutation.mutate(postId);
                  onClose();
                }}
                disabled={deletePostMutation.isPending}
              >
                {deletePostMutation.isPending ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      ),
    });
  };

  const handleDeleteEvent = (eventId) => {
    confirmAlert({
      closeOnClickOutside: false,
      overlayClassName: "react-confirm-alert-overlay",
      customUI: ({ onClose }) => (
        <div className="cc-confirm card shadow-sm">
          <div className="card-body">
            <h5 className="card-title mb-2">Delete Event</h5>
            <p className="mb-4">
              Are you sure you want to delete this event? This action cannot be
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
                  deleteEventMutation.mutate(eventId);
                  onClose();
                }}
                disabled={deleteEventMutation.isLoading}
              >
                {deleteEventMutation.isLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      ),
    });
  };

  return (
    <DashboardLayout>
      <div className="clubs-details-main">
        <div className="clubs-details">
          {isLoading ? (
            <div className="d-flex align-items-center gap-2">
              <Spinner size="sm" />
              <span>Loading club...</span>
            </div>
          ) : !club ? (
            <div className="text-muted">Club not found</div>
          ) : (
            <>
              <div className="back-btn">
                <Button as={Link} to="/clubs" variant="link">
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
                    className="lucide lucide-arrow-left w-4 h-4"
                    data-filename="pages/ClubDetails"
                    data-linenumber="322"
                    data-visual-selector-id="pages/ClubDetails322"
                    data-source-location="pages/ClubDetails:322:10"
                    data-dynamic-content="false"
                  >
                    <path d="m12 19-7-7 7-7"></path>
                    <path d="M19 12H5"></path>
                  </svg>{" "}
                  Back
                </Button>
              </div>

              <div className="club-profile" data-aos="fade-left">
                <div className="club-profile-bg d-flex align-items-end">
                  <div
                    className="club-profile-img clickable"
                    onClick={() => setShowPhotoModal(true)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && setShowPhotoModal(true)}
                  >
                    {club?.club_profile_image ? (
                      <img
                        src={club?.club_profile_image}
                        alt={club?.name}
                        className="club-profile-img"
                      />
                    ) : (
                      club?.name?.[0]?.toLowerCase() || "t"
                    )}
                  </div>

                  <div className="club-profile-name">
                    <h3>{club.name}</h3>
                    <p>
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
                        className="lucide lucide-users w-4 h-4"
                        data-filename="pages/ClubDetails"
                        data-linenumber="350"
                        data-visual-selector-id="pages/ClubDetails350"
                        data-source-location="pages/ClubDetails:350:22"
                        data-dynamic-content="false"
                      >
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                      </svg>
                      {club?.members_count || 0} members •{" "}
                      {club?.followers_count || 0} followers •{" "}
                      {club?.category?.name || "Social"}
                    </p>
                  </div>
                </div>

                <div className="club-profile-description">
                  <p>{club?.description}</p>
                </div>

                {/* Action buttons based on membership status */}
                {!isAdmin && isMember && (
                  // Leave Club button for members who are not admin
                  <div className="d-flex justify-content-center mt-3">
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={handleLeaveClub}
                      disabled={leaveClubMutation.isPending}
                    >
                      {leaveClubMutation.isPending
                        ? "Leaving..."
                        : "Leave Club"}
                    </Button>
                  </div>
                )}

                {!isAdmin && !isMember && (
                  // Request and Follow buttons for non-members
                  <div className="d-flex justify-content-center gap-2 mt-3">
                    <Button
                      variant={
                        club?.hasPendingRequest ? "outline-primary" : "primary"
                      }
                      size="sm"
                      onClick={() =>
                        requestClub({ club_id: club.id, is_following: false })
                      }
                      disabled={isRequestPending}
                      className="request-btn"
                    >
                      {isRequestPending ? (
                        "Processing..."
                      ) : club?.hasPendingRequest ? (
                        <>
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
                            className="me-1"
                          >
                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                            <circle cx="9" cy="7" r="4"></circle>
                            <line x1="19" x2="19" y1="8" y2="14"></line>
                            <line x1="22" x2="16" y1="11" y2="11"></line>
                          </svg>
                          Requested
                        </>
                      ) : club?.is_public ? (
                        <>
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
                            className="me-1"
                          >
                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                            <circle cx="9" cy="7" r="4"></circle>
                            <line x1="19" x2="19" y1="8" y2="14"></line>
                            <line x1="22" x2="16" y1="11" y2="11"></line>
                          </svg>
                          Join
                        </>
                      ) : (
                        <>
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
                            className="me-1"
                          >
                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                            <circle cx="9" cy="7" r="4"></circle>
                            <line x1="19" x2="19" y1="8" y2="14"></line>
                            <line x1="22" x2="16" y1="11" y2="11"></line>
                          </svg>
                          Request
                        </>
                      )}
                    </Button>
                    <Button
                      variant="light"
                      size="sm"
                      onClick={() => followClub({ following_club: club.id })}
                    >
                      {club?.isFollowing
                        ? "Following"
                        : isFollowPending
                          ? "Following..."
                          : "Follow"}
                    </Button>
                  </div>
                )}

                {/* Admin controls - only show if user is admin */}
                {isAdmin && (
                  <div className="d-flex justify-content-center">
                    <div className="d-flex align-items-center requests-manage-btn">
                      <Button
                        size="sm"
                        variant="light"
                        className="rounded-pill border"
                        onClick={() => setShowRequests(true)}
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
                          className="lucide lucide-user-plus w-4 h-4 text-blue-600"
                          data-filename="pages/ClubDetails"
                          data-linenumber="361"
                          data-visual-selector-id="pages/ClubDetails361"
                          data-source-location="pages/ClubDetails:361:24"
                          data-dynamic-content="false"
                        >
                          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                          <circle cx="9" cy="7" r="4"></circle>
                          <line x1="19" x2="19" y1="8" y2="14"></line>
                          <line x1="22" x2="16" y1="11" y2="11"></line>
                        </svg>{" "}
                        Requests
                        {pendingCount > 0 ? (
                          <Badge bg="primary" pill className="ms-2">
                            {pendingCount}
                          </Badge>
                        ) : null}
                      </Button>
                      <div className="border"></div>
                      {/* Desktop Dropdown */}
                      <Dropdown align="end" className="d-none d-lg-block">
                        <Dropdown.Toggle
                          size="sm"
                          className="club-manage-toggle"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="15"
                            height="15"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                          </svg>
                          Manage
                        </Dropdown.Toggle>
                        <Dropdown.Menu className="club-manage-menu">
                          <Dropdown.Item
                            className="club-manage-item"
                            onClick={() => setShowSettings(true)}
                          >
                            <div className="club-manage-item-icon">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                              </svg>
                            </div>
                            <div className="club-manage-item-text">
                              <span className="club-manage-item-label">Club Settings</span>
                              <span className="club-manage-item-desc">Edit name, image & privacy</span>
                            </div>
                          </Dropdown.Item>
                          <Dropdown.Divider className="club-manage-divider" />
                          <Dropdown.Item
                            className="club-manage-item"
                            onClick={() => setShowMembers(true)}
                          >
                            <div className="club-manage-item-icon">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                                <circle cx="9" cy="7" r="4"></circle>
                                <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                              </svg>
                            </div>
                            <div className="club-manage-item-text">
                              <span className="club-manage-item-label">Manage Members</span>
                              <span className="club-manage-item-desc">View, promote & remove</span>
                            </div>
                          </Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>

                      {/* Mobile Bottom Sheet Button */}
                      <Button
                        size="sm"
                        className="club-manage-toggle d-lg-none"
                        onClick={() => setShowManageMenu(true)}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="15"
                          height="15"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                        Manage
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <div
                className="cc-tabs-main"
                data-aos="fade-up"
                data-aos-delay="200"
              >
                <Nav
                  fill
                  variant="cc-tabs"
                  activeKey={activeTab}
                  onSelect={(k) => handleTabChange(k || "discussion")}
                >
                  <Nav.Link eventKey="discussion">
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
                      className="lucide lucide-message-square w-4 h-4 flex-shrink-0"
                      data-filename="pages/ClubDetails"
                      data-linenumber="458"
                      data-visual-selector-id="pages/ClubDetails458"
                      data-source-location="pages/ClubDetails:458:22"
                      data-dynamic-content="false"
                    >
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                    <span className="d-inline-flex align-items-center">
                      {isMember ? "Discussion" : "Public Posts"}
                      {clubChannelNotifications.discussion && <NotificationDot />}
                    </span>
                  </Nav.Link>
                  {isMember && (
                    <Nav.Link eventKey="chat">
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
                        className="lucide lucide-message-circle w-4 h-4 flex-shrink-0"
                        data-filename="pages/ClubDetails"
                        data-linenumber="462"
                        data-visual-selector-id="pages/ClubDetails462"
                        data-source-location="pages/ClubDetails:462:22"
                        data-dynamic-content="false"
                      >
                        <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"></path>
                      </svg>
                      <span className="d-inline-flex align-items-center">
                        Chat
                        {clubChannelNotifications.chat && <NotificationDot />}
                      </span>
                    </Nav.Link>
                  )}
                  {isMember && (
                    <Nav.Link eventKey="events">
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
                        className="lucide lucide-calendar w-4 h-4 flex-shrink-0"
                        data-filename="pages/ClubDetails"
                        data-linenumber="466"
                        data-visual-selector-id="pages/ClubDetails466"
                        data-source-location="pages/ClubDetails:466:22"
                        data-dynamic-content="false"
                      >
                        <path d="M8 2v4"></path>
                        <path d="M16 2v4"></path>
                        <rect width="18" height="18" x="3" y="4" rx="2"></rect>
                        <path d="M3 10h18"></path>
                      </svg>
                      <span className="d-inline-flex align-items-center">
                        Events
                        {clubChannelNotifications.events && <NotificationDot />}
                      </span>
                    </Nav.Link>
                  )}
                  {isMember && !isAdmin && (
                    <Nav.Link eventKey="members">
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
                        className="lucide lucide-users w-4 h-4 flex-shrink-0"
                      >
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                      </svg>
                      <span className="d-inline-flex align-items-center">
                        Members
                        {clubChannelNotifications.members && <NotificationDot />}
                      </span>
                    </Nav.Link>
                  )}
                </Nav>
              </div>

              {activeTab === "discussion" && (
                <div data-aos="fade-up">

                  {isLoadingFeed ? (
                    <div className="d-flex justify-content-center align-items-center py-5">
                      <Spinner animation="border" variant="primary" />
                      <span className="ms-2">Loading feed...</span>
                    </div>
                  ) : feedError ? (
                    <div className="text-center py-4">
                      <p className="text-danger">
                        Error loading feed. Please try again.
                      </p>
                    </div>
                  ) : feed.length > 0 ? (
                    <>
                      <div className="feed-list">
                        {feed.map((item) => (
                          <FeedItem
                            key={`${item.type}-${item.id}`}
                            item={item}
                            onDeleteEvent={isAdmin ? handleDeleteEvent : undefined}
                            onDeletePost={isAdmin ? handleDeletePost : undefined}
                            currentUserId={currentUserId}
                            showClubInfo={true}
                            clubInfo={club}
                          />
                        ))}
                      </div>
                      {hasNextPage && (
                        <div className="d-flex justify-content-center my-4">
                          <Button
                            variant="outline-primary"
                            onClick={() => fetchNextPage()}
                            disabled={isFetchingNextPage}
                          >
                            {isFetchingNextPage ? (
                              <>
                                <Spinner
                                  animation="border"
                                  size="sm"
                                  className="me-2"
                                />
                                Loading more...
                              </>
                            ) : (
                              "Load More"
                            )}
                          </Button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="no-data">
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
                      <h3>No posts or events yet</h3>
                      <p>
                        Share the first post or create an event with your club
                        members!
                      </p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "chat" && isMember ? (
                <div data-aos="fade-up">
                  <ClubChat
                    roomId={`club-${club?.id}`}
                    clubName={`${club?.name} Discussion`}
                  />
                </div>
              ) : (
                !isMember &&
                activeTab === "chat" && (
                  <div className="no-data">
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
                    <h3>No chat available</h3>
                    <p>
                      You need to be a member of this club to access the chat.
                    </p>
                  </div>
                )
              )}

              {activeTab === "events" && isMember ? (
                <div data-aos="fade-up">
                  <div className="d-flex justify-content-between align-items-center upcoming-events mb-2 mt-2">
                    <h3>Upcoming Events</h3>
                    {isAdmin && (
                      <Button
                        variant="btns"
                        onClick={() => setShowCreateEvent(true)}
                      >
                        Create Event
                      </Button>
                    )}
                  </div>

                  {isLoadingEvents ? (
                    <div className="d-flex align-items-center gap-2">
                      <Spinner size="sm" />
                      <span>Loading events...</span>
                    </div>
                  ) : eventsError ? (
                    <div className="text-danger">
                      Error loading events: {eventsError.message}
                    </div>
                  ) : events.length === 0 ? (
                    <div className="no-data event-data">
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
                        className="lucide lucide-calendar w-16 h-16 text-gray-300 mx-auto mb-4"
                      >
                        <path d="M8 2v4"></path>
                        <path d="M16 2v4"></path>
                        <rect width="18" height="18" x="3" y="4" rx="2"></rect>
                        <path d="M3 10h18"></path>
                      </svg>
                      <h3>No events yet</h3>
                      <p>Be the first to create an event for this club!</p>
                    </div>
                  ) : (
                    <div className="events-list">
                      {events.map((event) => {
                        // Check if event is completed
                        const eventEndTime = event.endAt ? new Date(event.endAt) : null;
                        const eventStartTime = event.startAt ? new Date(event.startAt) : null;
                        const now = new Date();
                        const isCompleted = eventEndTime
                          ? now > eventEndTime
                          : (eventStartTime ? now > eventStartTime : false);

                        return (
                          <div key={event.id} className={`feed-post feed-post-event ${isCompleted ? 'event-completed' : ''}`} style={isCompleted ? { opacity: 0.6 } : {}}>
                            <div className="">
                              <div className="post-header">
                                <div className="post-meta">
                                  <div className="post-author">{event.title}</div>

                                  <div className="post-time">
                                    {formatDistanceToNow(new Date(event.createdAt), {
                                      addSuffix: true,
                                    })}
                                  </div>
                                </div>
                                <div className="d-flex gap-2">
                                  {isAdmin && (
                                    <Button
                                      variant="outline-danger"
                                      size="sm"
                                      onClick={() => handleDeleteEvent(event.id)}
                                      disabled={deleteEventMutation.isLoading}
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
                              <div className="post-content">
                                {event.description && (
                                  <p className="mb-2">{event.description}</p>
                                )}

                                <div className="event-details mt-4 d-flex flex-wrap flex-column">
                                  {event.startAt && (
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
                                        {format(new Date(event.startAt), "EEEE, MMMM do, yyyy")}
                                      </span>
                                    </div>
                                  )}
                                  {event.location && (
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
                                      <span>{event.location}</span>
                                    </div>
                                  )}
                                  {event.startAt && (
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
                                        {format(new Date(event.startAt), "h:mm a")}
                                        {event.endAt && ` - ${format(new Date(event.endAt), "h:mm a")}`}
                                      </span>
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
                                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                                      <circle cx="9" cy="7" r="4"></circle>
                                      <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                                      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                                    </svg>
                                    <span>{event.attendeeCount || 0} attending</span>
                                  </div>
                                </div>

                                <div className="d-flex mt-3">
                                  {event.minutesBeforeEvent > 0 && (
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
                                        <circle cx="12" cy="12" r="10"></circle>
                                        <polyline points="12 6 12 12 16 14"></polyline>
                                      </svg>
                                      <span>{event.minutesBeforeEvent} min reminder</span>
                                    </div>
                                  )}
                                  {event.paymentRequired && (
                                    <Badge
                                      bg="warning"
                                      text="dark"
                                      className="event-badge"
                                    >
                                      Payment Required
                                    </Badge>
                                  )}
                                </div>
                                <p className="event-author mt-1">
                                  Created by {event.user?.full_name || "Unknown"}
                                </p>

                                {/* Attendees Section */}
                                {event.attendeeCount > 0 && (
                                  <div className="attendees-section mt-3">
                                    <div className="text-muted small mb-2">
                                      Attendees ({event.attendeeCount})
                                    </div>
                                    <div className="d-flex flex-wrap gap-2">
                                      {event.attendees?.map((attendee) => (
                                        <div
                                          key={attendee.id}
                                          className="attendee-item text-center"
                                          style={{ width: "60px" }}
                                        >
                                          <div
                                            className="attendee-avatar rounded-circle mx-auto mb-1"
                                            style={{
                                              width: "40px",
                                              height: "40px",
                                              backgroundColor: "#4361ee",
                                              display: "flex",
                                              alignItems: "center",
                                              justifyContent: "center",
                                              overflow: "hidden",
                                            }}
                                          >
                                            {attendee.profile_image ? (
                                              <img
                                                src={attendee.profile_image}
                                                alt={attendee.full_name}
                                                style={{
                                                  width: "100%",
                                                  height: "100%",
                                                  objectFit: "cover",
                                                }}
                                              />
                                            ) : (
                                              <span
                                                style={{
                                                  color: "#fff",
                                                  fontSize: "16px",
                                                  fontWeight: "600",
                                                }}
                                              >
                                                {attendee.full_name
                                                  ?.charAt(0)
                                                  ?.toUpperCase() || "?"}
                                              </span>
                                            )}
                                          </div>
                                          <div
                                            className="attendee-name text-truncate"
                                            style={{
                                              fontSize: "11px",
                                              color: "rgba(255,255,255,0.7)",
                                            }}
                                            title={attendee.full_name}
                                          >
                                            {attendee.full_name?.split(" ")[0] ||
                                              "User"}
                                            ...
                                          </div>
                                        </div>
                                      ))}
                                      {event.attendeeCount > 5 && (
                                        <div
                                          className="attendee-item text-center"
                                          style={{ width: "60px" }}
                                        >
                                          <div
                                            className="attendee-avatar rounded-circle mx-auto mb-1"
                                            style={{
                                              width: "40px",
                                              height: "40px",
                                              backgroundColor:
                                                "rgba(255,255,255,0.2)",
                                              display: "flex",
                                              alignItems: "center",
                                              justifyContent: "center",
                                              color: "#fff",
                                              fontSize: "12px",
                                            }}
                                          >
                                            +{event.attendeeCount - 5}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Event Interactions */}
                            <div className="post-footer column-gap-4 d-flex flex-wrap align-items-center">
                              <CommentSection
                                event_id={event.id}
                                currentUserId={currentUserId}
                                isEvent={true}
                              />
                              <EventAttendButton
                                eventId={event.id}
                                paymentRequired={event.paymentRequired}
                                price={event.price}
                                creatorId={event.userId || event.user_id}
                                currentUserId={currentUserId}
                                isCompleted={isCompleted}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                !isMember &&
                activeTab === "events" && (
                  <div className="no-data">
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
                      className="lucide lucide-calendar w-4 h-4 flex-shrink-0"
                      data-filename="pages/ClubDetails"
                      data-linenumber="466"
                      data-visual-selector-id="pages/ClubDetails466"
                      data-source-location="pages/ClubDetails:466:22"
                      data-dynamic-content="false"
                    >
                      <path d="M8 2v4"></path>
                      <path d="M16 2v4"></path>
                      <rect width="18" height="18" x="3" y="4" rx="2"></rect>
                      <path d="M3 10h18"></path>
                    </svg>
                    <h3>No events available</h3>
                    <p>You need to be a member of this club to view events.</p>
                  </div>
                )
              )}

              {activeTab === "members" && isMember ? (
                <div data-aos="fade-up">
                  <div className="members-header mb-3">
                    <h3>Club Members</h3>
                    <p className="">
                      {allMembers.length} member
                      {allMembers.length !== 1 ? "s" : ""}
                    </p>
                  </div>

                  {isLoadingMembers ? (
                    <div className="d-flex justify-content-center align-items-center py-5">
                      <Spinner animation="border" variant="primary" />
                      <span className="ms-2">Loading members...</span>
                    </div>
                  ) : membersError ? (
                    <div className="text-center py-4">
                      <p className="text-danger">
                        Error loading members. Please try again.
                      </p>
                    </div>
                  ) : allMembers.length === 0 ? (
                    <div className="no-data">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="64"
                        height="64"
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
                      <h3>No members yet</h3>
                      <p>This club doesn't have any members yet.</p>
                    </div>
                  ) : (
                    <Row className="g-3 all-member-card">
                      {allMembers.map((member) => (
                        <Col key={member.id} xs={12} sm={6} md={4}>
                          <Card
                            className="h-100 member-card-clickable"
                            style={{ cursor: "pointer", transition: "transform 0.2s ease" }}
                            onClick={(e) => handleProfileImageClick(e, member.id)}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = "translateY(-4px)";
                              e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.15)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = "translateY(0)";
                              e.currentTarget.style.boxShadow = "";
                            }}
                          >
                            <Card.Body className="d-flex flex-column align-items-center text-center p-0">
                              <div
                                className="rounded-circle d-flex align-items-center justify-content-center mb-3"
                                style={{
                                  width: "80px",
                                  height: "80px",
                                  backgroundColor: member.isOwner
                                    ? "#4361ee"
                                    : "#e9ecef",
                                  color: member.isOwner ? "#fff" : "#495057",
                                  fontSize: "32px",
                                  fontWeight: "600",
                                }}
                              >
                                {member.profile_image ? (
                                  <img
                                    src={member.profile_image}
                                    alt={member.full_name}
                                    className="rounded-circle"
                                    style={{
                                      width: "100%",
                                      height: "100%",
                                      objectFit: "cover",
                                    }}
                                  />
                                ) : (
                                  String(
                                    member.full_name || member.email || "?",
                                  )
                                    .charAt(0)
                                    .toUpperCase()
                                )}
                              </div>
                              <h5 className="mb-1">
                                {member.full_name || "Unknown"}
                              </h5>
                              <p className=" small mb-2">{member.email}</p>
                              {(member.isOwner || member.is_admin) && (
                                <Badge bg="primary">Admin</Badge>
                              )}
                            </Card.Body>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  )}
                </div>
              ) : (
                !isMember &&
                activeTab === "members" && (
                  <div className="no-data">
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
                      className="lucide lucide-users w-4 h-4 flex-shrink-0"
                    >
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                      <circle cx="9" cy="7" r="4"></circle>
                      <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                    <h3>No members available</h3>
                    <p>You need to be a member of this club to view members.</p>
                  </div>
                )
              )}
            </>
          )}
          <ClubRequestsModal
            show={showRequests}
            onHide={() => setShowRequests(false)}
            clubId={id}
            clubName={club?.name}
          />
          <ClubSettingsModal
            show={showSettings}
            onHide={() => setShowSettings(false)}
            club={club}
            onSave={() => setShowSettings(false)}
          />
          <ManageMembersModal
            show={showMembers}
            onHide={() => setShowMembers(false)}
            clubId={club?.id}
            clubName={club?.name}
          />
          <CreateEventModal
            show={showCreateEvent}
            onHide={() => setShowCreateEvent(false)}
            clubId={club?.id}
            onSubmit={() => {
              // Invalidate and refetch feed
              queryClient.invalidateQueries({ queryKey: ["posts"] });
              queryClient.invalidateQueries({ queryKey: ["posts-infinite"] });
            }}
          />

          <CreatePostModal
            show={showCreatePost}
            onHide={() => setShowCreatePost(false)}
            clubId={club?.id}
            clubName={club?.name}
            clubImage={club?.profileImage}
            isAdmin={isAdmin}
            onSuccess={() => {
              // Invalidate and refetch posts
              queryClient.invalidateQueries({ queryKey: ["posts"] });
              queryClient.invalidateQueries({ queryKey: ["posts-infinite"] });
            }}
          />
        </div>
      </div>

      <ProfilePhotoModal
        show={showPhotoModal}
        onHide={() => setShowPhotoModal(false)}
        imageUrl={club?.club_profile_image}
        userName={club?.name}
      />

      {/* Mobile Manage Menu Bottom Sheet */}
      <div
        className={`mobile-manage-sheet ${showManageMenu ? 'show' : ''}`}
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: '#fff',
          borderRadius: '20px 20px 0 0',
          padding: '20px',
          zIndex: 1060,
          transform: showManageMenu ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 0.3s ease',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 -4px 20px rgba(0,0,0,0.15)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#000' }}>Manage Club</h3>
          <button
            onClick={() => setShowManageMenu(false)}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#666'
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div
            onClick={() => {
              setShowSettings(true);
              setShowManageMenu(false);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '16px',
              borderRadius: '12px',
              backgroundColor: '#f5f5f5',
              cursor: 'pointer',
              transition: 'background 0.15s'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#efefef'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#f5f5f5'}
          >
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              backgroundColor: '#e8e8e8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: '16px', fontWeight: '600', color: '#000' }}>Club Settings</div>
              <div style={{ fontSize: '14px', color: '#666' }}>Edit name, image & privacy</div>
            </div>
          </div>

          <div
            onClick={() => {
              setShowMembers(true);
              setShowManageMenu(false);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '16px',
              borderRadius: '12px',
              backgroundColor: '#f5f5f5',
              cursor: 'pointer',
              transition: 'background 0.15s'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#efefef'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#f5f5f5'}
          >
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              backgroundColor: '#e8e8e8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: '16px', fontWeight: '600', color: '#000' }}>Manage Members</div>
              <div style={{ fontSize: '14px', color: '#666' }}>View, promote & remove</div>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay for bottom sheet */}
      {showManageMenu && (
        <div
          onClick={() => setShowManageMenu(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 1059,
            display: 'lg' ? 'none' : 'block'
          }}
        />
      )}

      {club && isMember && (
        <button
          className="club-create-post-btn"
          onClick={() => setShowCreatePost(true)}
          title="Create Post"
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
            className="lucide lucide-pen-line w-6 h-6"
          >
            <path d="M12 20h9"></path>
            <path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z"></path>
          </svg>
        </button>
      )}
    </DashboardLayout>
  );
};

export default ClubDetails;
