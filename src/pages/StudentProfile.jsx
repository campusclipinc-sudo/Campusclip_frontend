import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Row, Col, Spinner, Badge, Image } from "react-bootstrap";
import { formatDistanceToNow } from "date-fns";
import DashboardLayout from "../component/DashboardLayout";
import Tabs from "../component/Tabs";
import { useGetUserProfile } from "../hooks/useRQauth";
import { useGetUserPosts } from "../hooks/useRQPost";
import { useGetProfile } from "../hooks/useRQauth";
import { useGetUserClasses, useGetUserClubs } from "../hooks/useRQStudent";
import { useGetEducationalInstitutions } from "../hooks/index";
import FollowButton from "../components/FollowButton";
import PrivateProfileMessage from "../components/PrivateProfileMessage";
import CommentSection from "../components/CommentSection";
import ProfilePhotoModal from "../components/ProfilePhotoModal";
import AOS from "aos";
import "aos/dist/aos.css";
import "../scss/profile.scss";
import "../scss/feed.scss";

// Helper function to safely format date
const formatPostDate = (dateString) => {
  if (!dateString) return "Recently";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Recently";
    return formatDistanceToNow(date, { addSuffix: true });
  } catch (error) {
    return "Recently";
  }
};

const StudentProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pageTab, setPageTab] = useState("posts");
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  // Initialize AOS
  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: "ease-out-cubic",
      once: true,
    });
  }, []);

  // Refresh AOS on tab change
  useEffect(() => {
    AOS.refresh();
  }, [pageTab]);

  // Fetch user profile with privacy information
  const { data: userProfileData, isLoading } = useGetUserProfile(id);

  const profileData = userProfileData?.data;
  const profile = profileData?.user;
  const permission = profileData?.permission;
  const myFollowStatus = profileData?.my_follow_status;

  // Fetch current logged in user profile
  const { data: currentUserData } = useGetProfile();
  const currentUserId = currentUserData?.id;

  // Fetch educational institutions for university name
  const { data: educationalInstitutionsRes } = useGetEducationalInstitutions();

  const educationalInstitutionsOptions = useMemo(() => {
    return (
      educationalInstitutionsRes?.data?.map((u) => ({
        value: u.id,
        label: u.name,
      })) || []
    );
  }, [educationalInstitutionsRes]);

  // Get university name from profile or ID
  const universityName = useMemo(() => {
    if (!profile) return "";
    // Prefer the full educational_institution object if available
    if (profile.educational_institution?.name) {
      return profile.educational_institution.name;
    }
    // Fallback to looking up by ID
    if (profile.educational_institution_id) {
      const educationalInstitution = educationalInstitutionsOptions.find(
        (u) => u.value === profile.educational_institution_id,
      );
      return educationalInstitution?.label || "";
    }
    return "";
  }, [profile?.educational_institution, profile?.educational_institution_id, educationalInstitutionsOptions]);

  // Map academic year value to display label
  const academicYearLabel = useMemo(() => {
    if (!profile?.academic_year) return "";
    const yearMap = {
      1: "1st Year",
      2: "2nd Year",
      3: "3rd Year",
      4: "4th Year",
      5: "Freshman",
      6: "Sophomore",
      7: "Junior",
      8: "Senior",
      9: "Graduate",
    };
    return yearMap[profile.academic_year] || profile.academic_year;
  }, [profile?.academic_year]);

  // Fetch user posts (only if can view posts)
  const canViewPosts = permission?.canViewPosts;
  const { data: postsResponse, isLoading: isPostsLoading } = useGetUserPosts(
    id,
    canViewPosts,
  );

  const userPosts = postsResponse?.data?.posts || [];

  // Fetch user classes (only if can view classes)
  const canViewClasses = permission?.canViewClasses;
  const { data: classesResponse, isLoading: isClassesLoading } =
    useGetUserClasses(id, canViewClasses);

  const userClasses = classesResponse?.data.classes || [];

  // Fetch user clubs (only if can view clubs)
  const canViewClubs = permission?.canViewClubs;
  const { data: clubsResponse, isLoading: isClubsLoading } = useGetUserClubs(
    id,
    canViewClubs,
  );

  const userClubs = clubsResponse?.data.clubs || [];

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-5 text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2">Loading profile...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!profile) {
    return (
      <DashboardLayout>
        <div className="p-5 text-center">Student not found</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="profile-main">
        {/* Profile Card */}
        <div className="profile-card" data-aos="fade-right">
          <div className="profile-top d-flex align-items-center">
            <div
              className="avatar-lg clickable"
              onClick={() => setShowPhotoModal(true)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && setShowPhotoModal(true)}
            >
              {profile.profile_image ? (
                <img
                  src={profile.profile_image}
                  alt="avatar"

                />
              ) : (
                (profile.full_name || "U").charAt(0)
              )}
            </div>
            <div className="profile-name">
              <h4>{profile.full_name}</h4>
              <p>
                {profile.username
                  ? `@${profile.username}`
                  : profile.email
                    ? `@${profile.email.split("@")[0]}`
                    : "@student"}
              </p>
            </div>
          </div>

          <div className="d-flex justify-content-center profile-meta-main">
            <div className="profile-meta">
              <b>{profile.posts_count || 0}</b> posts
            </div>
            <div
              className="profile-meta"
              style={{ cursor: "pointer" }}
              onClick={() => navigate(`/profile/${id}/followers`)}
            >
              <b>{profile.followers_count || 0}</b> followers
            </div>
            <div
              className="profile-meta"
              style={{ cursor: "pointer" }}
              onClick={() => navigate(`/profile/${id}/following`)}
            >
              <b>{profile.following_count || 0}</b> following
            </div>
          </div>

          <div className="d-flex justify-content-center flex-wrap text-center profile-details">
            <span>
              <b>{academicYearLabel}</b>
            </span>
            {profile.major && academicYearLabel && <span>•</span>}
            <span>{profile.major || ""}</span>
          </div>

          <div className="d-flex justify-content-center profile-details">
            {universityName || ""}
          </div>

          <div className="d-flex justify-content-center gap-2 mt-3">
            <FollowButton
              userId={id}
              followStatus={myFollowStatus}
              isPrivate={profile.account_privacy === 1}
            />
          </div>
        </div>

        {/* Page Tabs */}
        <div className="profile-tab" data-aos="fade-left">
          <Tabs
            items={[
              {
                key: "posts",
                label: (
                  <div className="d-flex align-items-center gap-2">
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
                      <rect width="18" height="18" x="3" y="3" rx="2"></rect>
                      <path d="M3 9h18"></path>
                      <path d="M3 15h18"></path>
                      <path d="M9 3v18"></path>
                      <path d="M15 3v18"></path>
                    </svg>
                    <span>Posts</span>
                  </div>
                ),
              },
              {
                key: "classes",
                label: (
                  <div className="d-flex align-items-center gap-2">
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
                      <path d="M12 7v14"></path>
                      <path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"></path>
                    </svg>
                    <span>Classes</span>
                  </div>
                ),
              },
              {
                key: "clubs",
                label: (
                  <div className="d-flex align-items-center gap-2">
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
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                      <circle cx="9" cy="7" r="4"></circle>
                      <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                    <span>Clubs</span>
                  </div>
                ),
              },
            ]}
            activeKey={pageTab}
            onSelect={(k) => setPageTab(k)}
            className="mb-0"
            fullWidth={false}
          />

          {/* Posts Tab Content */}
          {pageTab === "posts" && (
            <div data-aos="fade-up">
              {!canViewPosts ? (
                <PrivateProfileMessage
                  followStatus={myFollowStatus}
                  username={profile.username}
                />
              ) : isPostsLoading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="primary" />
                  <p className="text-muted mt-2">Loading posts...</p>
                </div>
              ) : userPosts?.length === 0 ? (
                <div className="no-post-yet">
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
                    <rect width="18" height="18" x="3" y="3" rx="2"></rect>
                    <path d="M3 9h18"></path>
                    <path d="M3 15h18"></path>
                    <path d="M9 3v18"></path>
                    <path d="M15 3v18"></path>
                  </svg>
                  <h3>No posts yet</h3>
                  <p>{profile.full_name || "This user"} hasn't posted yet.</p>
                </div>
              ) : (
                <div className="feed-page">
                  {userPosts.map((post) => (
                    <div key={post.id} className="feed-item feed-item-post">
                      <div className="feed-post">
                        <div className="post-header">
                          <div className="post-avatar">
                            {profile.profile_image ? (
                              <Image
                                src={profile.profile_image}
                                alt={profile.full_name}
                                roundedCircle
                                className="avatar-img"
                              />
                            ) : (
                              <div className="avatar-placeholder">
                                {profile.full_name?.[0]?.toUpperCase() || "U"}
                              </div>
                            )}
                          </div>
                          <div className="post-meta">
                            <div className="post-author">
                              {profile.full_name || "Unknown User"}
                            </div>
                            <div className="post-time">
                              {formatPostDate(
                                post?.createdAt || post?.created_at,
                              )}
                            </div>
                          </div>
                          <div className="post-badges">
                            <Badge
                              bg={post.is_public ? "success" : "secondary"}
                              className="privacy-badge"
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
                                {post.is_public ? (
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
                                {post.is_public ? "Public" : "Private"}
                              </span>
                            </Badge>
                          </div>
                        </div>

                        {post.content && (
                          <div className="post-content">
                            <p>{post.content}</p>
                          </div>
                        )}

                        {(post.image_url || post.media_url) && (
                          <div className="post-image">
                            <Image
                              src={post.image_url || post.media_url}
                              alt="Post"
                              className="post-img"
                            />
                          </div>
                        )}

                        <div className="post-footer">
                          <CommentSection
                            post_id={post.id}
                            currentUserId={currentUserId}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Classes Tab Content */}
          {pageTab === "classes" && (
            <div data-aos="fade-up">
              {!canViewClasses ? (
                <PrivateProfileMessage
                  followStatus={myFollowStatus}
                  username={profile.username}
                />
              ) : isClassesLoading ? (
                <div className="text-muted">Loading classes…</div>
              ) : userClasses?.length === 0 ? (
                <div className="no-post-yet">
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
                    <path d="M12 7v14"></path>
                    <path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"></path>
                  </svg>
                  <h3>No classes yet</h3>
                  <p>
                    {profile.full_name || "This user"} hasn't joined any classes
                    yet.
                  </p>
                </div>
              ) : (
                <div className="myclub-card-main">
                  <Row>
                    {userClasses.map((classItem) => (
                      <Col key={classItem.id} md={6} lg={6}>
                        <div
                          className="myclub-card"
                          onClick={() => navigate(`/classes/${classItem.id}`)}
                        >
                          <div className="d-flex align-items-center gap-3">
                            <div
                              className="myclub-avatar"
                              style={{
                                backgroundColor: classItem.color || "#6c757d",
                              }}
                            >
                              {classItem.class_name?.[0]?.toUpperCase() || "C"}
                            </div>
                            <div className="myclub-name">
                              <h3>{classItem.class_name}</h3>
                              <div className="d-flex align-items-center myclub-tags">
                                {classItem.class_code && (
                                  <span>{classItem.class_code}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </Col>
                    ))}
                  </Row>
                </div>
              )}
            </div>
          )}

          {/* Clubs Tab Content */}
          {pageTab === "clubs" && (
            <div data-aos="fade-up">
              {!canViewClubs ? (
                <PrivateProfileMessage
                  followStatus={myFollowStatus}
                  username={profile.username}
                />
              ) : isClubsLoading ? (
                <div className="text-muted">Loading clubs…</div>
              ) : userClubs?.length === 0 ? (
                <div className="no-post-yet">
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
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                  <h3>No clubs yet</h3>
                  <p>
                    {profile.full_name || "This user"} hasn't joined any clubs
                    yet.
                  </p>
                </div>
              ) : (
                <div className="myclub-card-main">
                  <Row>
                    {userClubs.map((club) => {
                      const roleBadge =
                        club.member_role === "owner" ? "Owner" : "Member";
                      return (
                        <Col key={club.id} md={6} lg={6}>
                          <div
                            className="myclub-card"
                            onClick={() => navigate(`/clubs/${club.id}`)}
                          >
                            <div className="d-flex align-items-center gap-3">
                              <div className="myclub-avatar">
                                {club.club_profile_image ? (
                                  <img
                                    src={club.club_profile_image}
                                    alt={club.name}
                                    style={{
                                      width: "100%",
                                      height: "100%",
                                      objectFit: "cover",
                                      borderRadius: "inherit",
                                    }}
                                  />
                                ) : (
                                  club.name?.[0]?.toLowerCase() || "c"
                                )}
                              </div>
                              <div className="myclub-name">
                                <h3>{club.name}</h3>
                                <div className="d-flex align-items-center myclub-tags">
                                  <span>{roleBadge}</span>
                                  {club.category?.name && (
                                    <span>{club.category.name}</span>
                                  )}
                                  <div className="userIcon">
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
                                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                                      <circle cx="9" cy="7" r="4"></circle>
                                      <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                                      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                                    </svg>{" "}
                                    {club.members_count || 0}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </Col>
                      );
                    })}
                  </Row>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <ProfilePhotoModal
        show={showPhotoModal}
        onHide={() => setShowPhotoModal(false)}
        imageUrl={profile?.profile_image}
        userName={profile?.full_name}
      />
    </DashboardLayout>
  );
};

export default StudentProfile;
