import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, Spinner, Badge } from "react-bootstrap";
import { useGetFollowing } from "../../hooks/useRQUserFollowing";
import { useSelector } from "react-redux";
import DashboardLayout from "../../component/DashboardLayout";
import "../../scss/profile.scss";

const Following = () => {
  const navigate = useNavigate();
  const { userId } = useParams();
  const currentUser = useSelector((state) => state.user?.user);

  // If no userId in params, use current user's ID
  const targetUserId = userId || currentUser?.id;
  const isOwnProfile = !userId || userId === currentUser?.id;

  const { data: followingData, isLoading } = useGetFollowing(targetUserId);
  // Extract following array from nested structure
  const following = Array.isArray(followingData?.data?.following)
    ? followingData.data.following
    : Array.isArray(followingData?.data)
      ? followingData.data
      : Array.isArray(followingData)
        ? followingData
        : [];

  return (
    <DashboardLayout>
      <div className="following-page-main">
        <div className="following-page">
          <div className="following-header">
            <button
              className="back-button"
              onClick={() =>
                navigate(isOwnProfile ? "/profile" : `/profile/${userId}`)
              }
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
              <h2>Following</h2>
              <p className="text-muted">@{currentUser?.username || "user"}</p>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="text-muted mt-2">Loading following...</p>
            </div>
          ) : following.length === 0 ? (
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
              <h3 className="text-muted">Not following anyone yet</h3>
              <p className="text-muted">
                {isOwnProfile
                  ? "When you follow people or clubs, they'll appear here"
                  : "This user isn't following anyone yet"}
              </p>
            </div>
          ) : (
            <div className="following-list">
              {following.map((item) => {
                // Check if it's a user or a club
                const isClub = !!item.following_club;
                const target = isClub ? item.club : item.following;
                return (
                  <div
                    key={item.id}
                    className="following-item mb-2"
                    onClick={() =>
                      navigate(
                        isClub
                          ? `/clubs/${item.following_club}`
                          : `/students/${item?.following?.id || item?.id}`,
                      )
                    }
                    style={{ cursor: "pointer" }}
                  >
                    <div className="d-flex align-items-center gap-3">
                      <div className="following-avatar">
                        {target?.club_profile_image || target?.profile_image ? (
                          <img
                            src={
                              target.club_profile_image || target.profile_image
                            }
                            alt={target.name || target.full_name}
                            className="rounded-circle"
                            style={{
                              width: 50,
                              height: 50,
                              objectFit: "cover",
                            }}
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
                              target?.name?.[0] ||
                              target?.full_name?.[0] ||
                              "U"
                            ).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="following-info flex-grow-1">
                        <h5 className="mb-0">
                          {target?.name || target?.full_name || "Unknown"}
                        </h5>
                        {isClub ? (
                          <div className="d-flex align-items-center gap-2">
                            <Badge bg="info" className="small">
                              {target?.category?.name || "Club"}
                            </Badge>
                            <span className="text-muted small">
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
                                className="me-1"
                              >
                                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                                <circle cx="9" cy="7" r="4"></circle>
                                <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                              </svg>
                              {target?.members_count || 0} members
                            </span>
                          </div>
                        ) : (
                          <p className="text-muted mb-0 small">
                            @{target?.username || "username"}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Following;
