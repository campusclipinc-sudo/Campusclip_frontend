import React from "react";
import { Button, Spinner, Alert, Card } from "react-bootstrap";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  useGetAllRequests,
  useAcceptFollowRequestNotification,
  useRejectFollowRequestNotification,
  useAcceptClubRequest,
  useRejectClubRequest,
} from "../hooks";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

const FollowRequestsTab = () => {
  const navigate = useNavigate();

  // Fetch all requests using hook
  const {
    data: requestsData,
    isLoading: loading,
    error: errorData,
  } = useGetAllRequests();
  const requests = requestsData?.data?.requests || [];
  const error = errorData?.response?.data?.message || errorData?.message;

  // Accept/reject follow request hooks
  const acceptFollowMutation = useAcceptFollowRequestNotification();
  const rejectFollowMutation = useRejectFollowRequestNotification();

  // Accept/reject club request hooks
  const acceptClubMutation = useAcceptClubRequest();
  const rejectClubMutation = useRejectClubRequest();

  const handleAcceptFollowRequest = (requestId, followerId) => {
    acceptFollowMutation.mutate({ follower_user: followerId });
  };

  const handleRejectFollowRequest = (requestId, followerId) => {
    rejectFollowMutation.mutate({ follower_user: followerId });
  };

  const handleAcceptClubRequest = (requestId) => {
    acceptClubMutation.mutate({ request_id: requestId, action: "approve" });
  };

  const handleRejectClubRequest = (requestId) => {
    rejectClubMutation.mutate({ request_id: requestId, action: "reject" });
  };

  const handleProfileClick = (userId) => {
    navigate(`/profile/${userId}`);
  };

  const getProfileImage = (requester) => {
    return requester?.profile_image || null;
  };

  const getRequesterName = (requester) => {
    return requester?.full_name || "Unknown User";
  };

  if (loading) {
    return (
      <div className="loading-container">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Loading requests...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" className="mt-3">
        {error}
      </Alert>
    );
  }

  if (requests.length === 0) {
    return (
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
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <line x1="19" y1="8" x2="19" y2="14"></line>
            <line x1="22" y1="11" x2="16" y2="11"></line>
          </svg>
        </div>
        <h3>You're all caught up!</h3>
        <p>No new requests</p>
      </div>
    );
  }

  return (
    <div className="follow-requests-list">
      {requests.map((request) => {
        const isFollowRequest = request.type === "follow";
        // API returns 'requester' for both follow and club requests (follow requests have requester: follower)
        const requester = request.requester;
        const requesterName = getRequesterName(requester);
        const requesterUsername = requester?.username || "";
        const profileImage = getProfileImage(requester);

        const isActioning =
          (isFollowRequest &&
            (acceptFollowMutation.isLoading ||
              rejectFollowMutation.isLoading)) ||
          (!isFollowRequest &&
            (acceptClubMutation.isLoading || rejectClubMutation.isLoading));

        return (
          <Card key={request.id} className="request-card">
            <Card.Body>
              <div className="request-content">
                <div
                  className="request-user-info"
                  onClick={() => handleProfileClick(requester?.id)}
                  style={{ cursor: "pointer" }}
                >
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt={requesterName}
                      className="request-avatar"
                      onError={(e) => {
                        e.target.style.display = "none";
                        const placeholder = e.target.parentNode.querySelector(
                          ".request-avatar-placeholder",
                        );
                        if (placeholder) {
                          placeholder.style.display = "flex";
                        }
                      }}
                    />
                  ) : null}
                  <div
                    className="request-avatar request-avatar-placeholder"
                    style={{ display: profileImage ? "none" : "flex" }}
                  >
                    {(
                      requesterName?.[0] ||
                      requesterUsername?.[0] ||
                      requester?.email?.[0] ||
                      "U"
                    ).toUpperCase()}
                  </div>
                  <div className="request-details">
                    <h6 className="requester-name">{requesterName}</h6>
                    {isFollowRequest ? (
                      <p className="request-message">wants to follow you</p>
                    ) : (
                      <p className="request-message">
                        wants to join <strong>{request.club?.name}</strong>
                      </p>
                    )}
                    <span className="request-time">
                      {formatDistanceToNow(new Date(request.created_at), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                </div>

                <div className="request-actions">
                  <Button
                    variant="success"
                    size="sm"
                    className="accept-btn"
                    onClick={() =>
                      isFollowRequest
                        ? handleAcceptFollowRequest(request.id, requester.id)
                        : handleAcceptClubRequest(request.id)
                    }
                    disabled={isActioning}
                  >
                    {isActioning ? (
                      <Spinner animation="border" size="sm" />
                    ) : (
                      "Accept"
                    )}
                  </Button>
                  <div
                    className="btn-cross"
                    onClick={() =>
                      isFollowRequest
                        ? handleRejectFollowRequest(request.id, requester.id)
                        : handleRejectClubRequest(request.id)
                    }
                    disabled={isActioning}
                  >
                    <FontAwesomeIcon icon={faXmark} />
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        );
      })}
    </div>
  );
};

export default FollowRequestsTab;
