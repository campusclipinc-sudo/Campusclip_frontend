import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, Spinner, Button } from "react-bootstrap";
import {
  useGetPendingRequests,
  useAcceptFollowRequest,
  useRejectFollowRequest,
} from "../../hooks/useRQUserFollowing";
import DashboardLayout from "../../component/DashboardLayout";
import "../../scss/profile.scss";

const FollowRequests = () => {
  const navigate = useNavigate();

  const { data: requestsData, isLoading } = useGetPendingRequests({});
  // Extract requests array from nested structure
  const requests = Array.isArray(requestsData?.data?.requests)
    ? requestsData.data.requests
    : Array.isArray(requestsData?.data)
      ? requestsData.data
      : Array.isArray(requestsData)
        ? requestsData
        : [];
  console.log("Requests data:", requestsData, "Processed requests:", requests);
  const { mutate: acceptRequest, isPending: isAccepting } =
    useAcceptFollowRequest();
  const { mutate: rejectRequest, isPending: isRejecting } =
    useRejectFollowRequest();

  const handleAccept = (requestId, e) => {
    console.log("Accepting request:", requestId);
    e.stopPropagation();
    acceptRequest({ follower_user: requestId });
  };

  const handleReject = (requestId, e) => {
    e.stopPropagation();
    rejectRequest({ follower_user: requestId });
  };

  return (
    <DashboardLayout>
      <div className="following-page-main">
        <div className="follow-requests-page">
          <div className="follow-requests-header">
            <button
              className="back-button"
              onClick={() => navigate("/profile")}
              aria-label="Go back"
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
                <path d="m12 19-7-7 7-7"></path>
                <path d="M19 12H5"></path>
              </svg>
            </button>
            <div>
              <h2>Follow Requests</h2>
              <p>
                {requests.length} pending{" "}
                {requests.length === 1 ? "request" : "requests"}
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="text-muted mt-2">Loading requests...</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="no-data text-center py-5">
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
                className="mb-3 text-muted"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              <h3 className="text-white">No pending requests</h3>
              <p className="text-muted">
                When people request to follow you, they'll appear here
              </p>
            </div>
          ) : (
            <div className="follow-requests-list">
              {requests?.map((request) => (
                <div key={request.id} className="request-item">
                  <div className="d-flex align-items-center gap-3">
                    <div
                      className="request-avatar"
                      onClick={() =>
                        navigate(`/profile/${request.follower_user_id}`)
                      }
                      style={{ cursor: "pointer" }}
                    >
                      {request.follower?.profile_image ? (
                        <img
                          src={request.follower.profile_image}
                          alt={request.follower.full_name}
                          className="rounded-circle"
                          style={{ width: 50, height: 50, objectFit: "cover" }}
                        />
                      ) : (
                        <div
                          className="rounded-circle d-flex align-items-center justify-content-center bg-primary text-white"
                          style={{
                            width: 50,
                            height: 50,
                            fontSize: "1.25rem",
                            fontWeight: "bold",
                          }}
                        >
                          {(
                            request.follower?.full_name?.[0] || "U"
                          ).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div
                      className="request-info flex-grow-1"
                      onClick={() =>
                        navigate(`/profile/${request.follower_user_id}`)
                      }
                      style={{ cursor: "pointer" }}
                    >
                      <h5 className="mb-0">
                        {request.follower?.full_name || "Unknown User"}
                      </h5>
                      <p className="mb-0 small">
                        @{request.follower?.username || "username"}
                      </p>
                    </div>
                    <div className="request-actions d-flex gap-2">
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={(e) => handleReject(request.id, e)}
                        disabled={isRejecting || isAccepting}
                      >
                        Reject
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={(e) => handleAccept(request.follower.id, e)}
                        disabled={isRejecting || isAccepting}
                      >
                        Accept
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default FollowRequests;
